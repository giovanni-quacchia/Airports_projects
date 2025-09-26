import os
import hmac
import hashlib
from app.extensions import db
from sqlalchemy.orm import declarative_base
from flask_login import UserMixin
from app.extensions import login_manager

Base = declarative_base()
# TODO: aggiunto il role per airline e user, da mettere nello schema
class Airline(db.Model, UserMixin):
    __tablename__ = 'airlines'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mail = db.Column(db.String(120), unique=True, nullable=False)
    # Save salt and digest as binary to save space (hex strings take double space)
    salt = db.Column(db.LargeBinary(16), nullable=False)
    digest = db.Column(db.LargeBinary(64), nullable=False)
    code = db.Column(db.String(2), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    PIVA = db.Column(db.String(11), unique=True, nullable=False)
    logo = db.Column(db.String(255), nullable=True)
    isFirstLogin = db.Column(db.Boolean, default=True, nullable=False)
    role = db.Column(db.String(20), default='airline', nullable=False)  # 'airline' role

    def __init__(self, mail, code, name, PIVA, logo=None, isFirstLogin=True, id=None):
        if id is not None:
            self.id = id
        self.mail = mail
        self.set_password("password")  # Default password
        self.code = code
        self.name = name
        self.PIVA = PIVA
        self.logo = logo
        self.isFirstLogin = isFirstLogin
        self.role = 'airline'

    def __repr__(self):
        return f"<Airline {self.mail} - Code: {self.code} - Name: {self.name}>"

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
        return f"airline:{self.id}"

    def save(self):
        db.session.add(self)
        print("New airline created:", self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def update(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()

class AirlinePublic(Base):
    __tablename__ = 'public_airlines'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(2), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    PIVA = db.Column(db.String(11), unique=True, nullable=False)
    logo = db.Column(db.String(255), nullable=True)