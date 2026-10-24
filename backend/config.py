"""
CareerSphere Configuration Module
Loads configuration from environment variables and .env file.
"""

import os
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Environment & Server
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development').lower()
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', '8000'))
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')

# Database Configuration
# Supports PostgreSQL (postgresql://user:pass@host:port/dbname) or SQLite path
DATABASE_URL = os.getenv('DATABASE_URL', '')
if not DATABASE_URL:
    DB_DIR = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(DB_DIR, exist_ok=True)
    DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'careersphere.db')}"

# JWT Authentication Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'careersphere-production-secret-key-change-in-env-2026')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '10080'))  # 7 days

# CORS Configuration
# Comma-separated list of allowed origins, or '*' for local development
CORS_ORIGINS_RAW = os.getenv('CORS_ORIGINS', '*')
if CORS_ORIGINS_RAW.strip() == '*':
    CORS_ORIGINS = ['*']
else:
    CORS_ORIGINS = [o.strip() for o in CORS_ORIGINS_RAW.split(',') if o.strip()]

# Ingestion Scheduler Interval (default 4 hours)
INGESTION_INTERVAL_SECONDS = int(os.getenv('INGESTION_INTERVAL_SECONDS', '14400'))
