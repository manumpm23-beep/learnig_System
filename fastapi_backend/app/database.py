import os
import ssl
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
    
    # Strip any URL parameters like ?ssl_ca=... because we are manually bypassing SSL
    if "?" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.split("?")[0]

engine = create_engine(
    DATABASE_URL,
    connect_args={"ssl": {"cert_reqs": ssl.CERT_NONE}}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
