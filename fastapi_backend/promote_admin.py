import os
import sys
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine, Base
from app import models

try:
    with engine.begin() as conn:
        # 1. Run migrations manually in case the server hasn't been started yet
        try:
            conn.execute(text("ALTER TABLE User ADD COLUMN role VARCHAR(50) DEFAULT 'student' NOT NULL;"))
            print("Added 'role' column to User table.")
        except Exception:
            pass # Already exists
            
        try:
            conn.execute(text("ALTER TABLE Subject ADD COLUMN price INT DEFAULT 0 NOT NULL;"))
            print("Added 'price' column to Subject table.")
        except Exception:
            pass # Already exists
            
    # 2. Create any missing tables (Notification, Certificate, Purchase)
    Base.metadata.create_all(bind=engine)
    
    # 3. Promote the user
    with engine.begin() as conn:
        # Get the first user to make them admin (or change this if you want a specific email)
        email = 'manumpm23@gmail.com'
        
        # Check if user exists
        result = conn.execute(text("SELECT email FROM User WHERE email = :email"), {"email": email}).fetchone()
        
        if not result:
            print(f"User '{email}' not found. Please register an account with this email first.")
        else:
            conn.execute(text("UPDATE User SET role = 'admin' WHERE email = :email"), {"email": email})
            print(f"Success! The account '{email}' has been promoted to Admin.")
            
except Exception as e:
    print(f"An error occurred: {e}")
