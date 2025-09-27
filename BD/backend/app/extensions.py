from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine
from config import Config

from flask_login import current_user

db = SQLAlchemy()
login_manager = LoginManager()

ENGINES = {
    "guest": create_engine(Config.make_uri(Config.DB_GUEST)),
    "user": create_engine(Config.make_uri(Config.DB_USER)),
    "airline": create_engine(Config.make_uri(Config.DB_AIRLINE)),
    "admin": create_engine(Config.make_uri(Config.DB_ADMIN)),
}

# sessionmaker per creare sessioni singleton
SESSIONS = {role: scoped_session(sessionmaker(bind=engine)) for role, engine in ENGINES.items()}

def get_session():
    role = getattr(current_user, 'role', 'guest')
    return SESSIONS.get(role)