#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_SCRIPT="${REPO_ROOT}/scripts/package-worker-lambda.sh"
ZIP_PATH="${REPO_ROOT}/dist/worker-lambda.zip"

AWS_PROFILE="${AWS_PROFILE:-medibridge}"
AWS_REGION="${AWS_REGION:-us-east-2}"
FUNCTION_NAME="${FUNCTION_NAME:-medibridge-dev-worker}"
MODE="${1:-}"

if [[ "${MODE}" != "--deploy" ]]; then
  echo "DRY RUN — no AWS changes will be made."
  echo
  echo "Deployment target:"
  echo "  Profile:  ${AWS_PROFILE}"
  echo "  Region:   ${AWS_REGION}"
  echo "  Function: ${FUNCTION_NAME}"
  echo
  echo "To build and deploy intentionally, run:"
  echo "  $0 --deploy"
  exit 0
fi

echo "Verifying AWS identity..."
aws sts get-caller-identity \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --query '{Account:Account,Arn:Arn}' \
  --output json

echo "Verifying Lambda configuration..."
CONFIG="$(
  aws lambda get-function-configuration \
    --function-name "${FUNCTION_NAME}" \
    --profile "${AWS_PROFILE}" \
    --region "${AWS_REGION}" \
    --query '[Runtime,Architectures[0]]' \
    --output text
)"

read -r RUNTIME ARCHITECTURE <<<"${CONFIG}"

if [[ "${RUNTIME}" != "python3.12" ]]; then
  echo "ERROR: Expected python3.12, found ${RUNTIME}." >&2
  exit 1
fi

if [[ "${ARCHITECTURE}" != "x86_64" ]]; then
  echo "ERROR: Expected x86_64, found ${ARCHITECTURE}." >&2
  exit 1
fi

echo "Building validated Lambda package..."
"${PACKAGE_SCRIPT}"

echo "Deploying ${ZIP_PATH}..."
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --zip-file "fileb://${ZIP_PATH}" \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --query '{FunctionName:FunctionName,Version:Version,CodeSize:CodeSize}' \
  --output json

echo "Waiting for Lambda update to finish..."
for attempt in {1..60}; do
  STATUS="$(
    aws lambda get-function-configuration \
      --function-name "${FUNCTION_NAME}" \
      --profile "${AWS_PROFILE}" \
      --region "${AWS_REGION}" \
      --query 'LastUpdateStatus' \
      --output text
  )"

  case "${STATUS}" in
    Successful)
      echo "Lambda deployment completed successfully."
      exit 0
      ;;
    Failed)
      aws lambda get-function-configuration \
        --function-name "${FUNCTION_NAME}" \
        --profile "${AWS_PROFILE}" \
        --region "${AWS_REGION}" \
        --query '{Status:LastUpdateStatus,Reason:LastUpdateStatusReason}' \
        --output json
      exit 1
      ;;
    *)
      echo "Update status: ${STATUS} (${attempt}/60)"
      sleep 5
      ;;
  esac
done

echo "ERROR: Timed out waiting for the Lambda update." >&2
exit 1
