import os
import hmac
import hashlib
from app.extensions import db, login_manager
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mail = db.Column(db.String(120), unique=True, nullable=False)
    # Save salt and digest as binary to save space (hex strings take double space)
    salt = db.Column(db.LargeBinary(16), nullable=False)
    digest = db.Column(db.LargeBinary(64), nullable=False)
    isAdmin = db.Column(db.Boolean, default=False, nullable=False)
    balance = db.Column(db.Float, default=0.0, nullable=False)

    # Constraints
    __table_args__ = (
        # CHECK
        db.CheckConstraint('balance >= 0', name='check_positive_balance'),
    )

    def __init__(self, mail, password, isAdmin=False, balance=0.0, id=None):
        if id is not None:
            self.id = id
        self.mail = mail
        self.set_password(password)
        self.isAdmin = isAdmin
        self.balance = balance

    def __repr__(self):
        return f"<User {self.mail} - Admin: {self.isAdmin} - Balance: {self.balance}>"
    
    def set_password(self, password: str):
        self.salt = os.urandom(16)
        self.digest = hashlib.pbkdf2_hmac(
            'sha256',           # hash algorithm
            password.encode(),  # password as bytes
            self.salt,          # salt as bytes
            100000              # number of iterations
        )

    def check_password(self, password: str) -> bool:
        test_digest = hashlib.pbkdf2_hmac(
            'sha256', 
            password.encode(), 
            self.salt,
            100000
        )
        return hmac.compare_digest(self.digest, test_digest)
    
    def get_id(self):
        return f"user:{self.id}" 

    def save(self):
        db.session.add(self)
        print("New user created:", self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def update(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()