#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$(mktemp -d)"
PACKAGE_DIR="${BUILD_DIR}/package"
DIST_DIR="${REPO_ROOT}/dist"
ZIP_PATH="${DIST_DIR}/worker-lambda.zip"

cleanup() {
  rm -rf "${BUILD_DIR}"
}
trap cleanup EXIT

mkdir -p "${PACKAGE_DIR}" "${DIST_DIR}"
rm -f "${ZIP_PATH}"

echo "Installing Linux/Python 3.12 dependencies..."
python3 -m pip install \
  --requirement "${REPO_ROOT}/workers/requirements.txt" \
  --target "${PACKAGE_DIR}" \
  --platform manylinux2014_x86_64 \
  --implementation cp \
  --python-version 3.12 \
  --only-binary=:all: \
  --upgrade

echo "Copying worker source and contracts..."
cp "${REPO_ROOT}/workers/handler.py" "${PACKAGE_DIR}/handler.py"
cp -R "${REPO_ROOT}/workers/shared" "${PACKAGE_DIR}/shared"
cp -R "${REPO_ROOT}/contracts" "${PACKAGE_DIR}/contracts"

find "${PACKAGE_DIR}" -type d \
  \( -name "__pycache__" -o -name "*.dist-info" \) \
  -prune -exec rm -rf {} +

echo "Creating Lambda ZIP..."
(
  cd "${PACKAGE_DIR}"
  zip -q -r "${ZIP_PATH}" .
)

echo "Validating package..."
unzip -tq "${ZIP_PATH}"

for required in \
  "handler.py" \
  "shared/events.py" \
  "contracts/events/document-sent.schema.json" \
  "contracts/ai/document-analysis.schema.json"
do
  if ! unzip -Z1 "${ZIP_PATH}" | grep -Fx "${required}" >/dev/null; then
    echo "ERROR: Missing required file: ${required}" >&2
    exit 1
  fi
done

if unzip -Z1 "${ZIP_PATH}" | grep -E '(__MACOSX|\.DS_Store)' >/dev/null; then
  echo "ERROR: macOS metadata found in package." >&2
  exit 1
fi

echo "Package created successfully:"
ls -lh "${ZIP_PATH}"
