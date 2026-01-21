# Well, it does what it says. It creates the database.
from app import app, db

with app.app_context():
    db.create_all()
    print("Database tables created.")
