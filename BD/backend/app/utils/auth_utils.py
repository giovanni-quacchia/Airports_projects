from functools import wraps
from flask_login import current_user
from flask import abort, g
from app.extensions import login_manager
from app.models.user import User
from app.models.airline import Airline
from config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import os
import secrets

def create_secret_key():
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write(f"SECRET_KEY='{secrets.token_hex(32)}'\n")
        print(".env file created with a new SECRET_KEY.")
    else:
        print(".env file already exists.")

@login_manager.user_loader
def load_user(user_id):
    model, real_id = user_id.split(":")
    if model == "user":
        return User.query.get(int(real_id))
    elif model == "airline":
        return Airline.query.get(int(real_id))
    return None

def get_session():
    return g.db_session

def get_db_session(role = "anonymous"):
    role_map = {
        "anonymous": Config.DB_ANONYMOUS,
        "user": Config.DB_USER,
        "admin": Config.DB_ADMIN,
        "airline": Config.DB_AIRLINE
    }
    engine = create_engine(Config.make_uri(role_map.get(role, Config.DB_ANONYMOUS)))
    Session = sessionmaker(bind=engine)
    return Session()

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.role != 'admin':
            print(f"Admin required, {current_user.role} found")
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.role != 'user':
            print(f"User required, {current_user.role} found")
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

def admin_or_user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.role not in ['admin', 'user']:
            print(f"Admin or User required, {current_user.role} found")
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

def admin_or_owner_user_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = kwargs.get('user_id')
            if current_user.role not in ['admin', 'user']:
                print(f"Admin or User required, {current_user.role} found")
                abort(403)  # Forbidden
            if current_user.role != 'admin' and current_user.id != user_id:
                print(f"Owner User required, {current_user.id} found, {user_id} required")
                abort(403)  # Forbidden
            return f(*args, **kwargs)
        return decorated_function

def airline_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.role != 'airline':
            print(f"Airline required, {current_user.role} found")
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

def admin_or_airline_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.role not in ['admin', 'airline']:
            print(f"Admin or Airline required, {current_user.role} found")
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function   

def admin_or_airline_owner_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            airline_id = kwargs.get('airline_id')
            if current_user.role not in ['admin', 'airline']:
                print(f"Admin or Airline required, {current_user.role} found")
                abort(403)  # Forbidden
            if current_user.role != 'admin' and current_user.id != airline_id:
                print(f"Airline Owner required, {current_user.id} found, {airline_id} required")
                abort(403)  # Forbidden
            return f(*args, **kwargs)
        return decorated_function
    
