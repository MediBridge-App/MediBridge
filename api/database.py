from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os
import json
import boto3
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


def get_database_credentials():
    secret_arn = os.getenv("DB_SECRET_ARN")

    if not secret_arn:
        raise Exception(
            "DB_SECRET_ARN is not configured"
        )

    client = boto3.client(
        "secretsmanager",
        region_name=os.getenv("AWS_REGION", "us-east-2")
    )

    response = client.get_secret_value(
        SecretId=secret_arn
    )

    return json.loads(
        response["SecretString"]
    )


# Get database username/password from AWS Secrets Manager
secret = get_database_credentials()


# Build PostgreSQL connection URL
DATABASE_URL = (
    f"postgresql://"
    f"{quote_plus(secret['username'])}:"
    f"{quote_plus(secret['password'])}"
    f"@{os.getenv('DB_HOST')}:"
    f"{os.getenv('DB_PORT', '5432')}/"
    f"{os.getenv('DB_NAME')}?sslmode=require"
)


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()