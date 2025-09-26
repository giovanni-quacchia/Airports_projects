from app.models.user import User
from flask import abort
from flask_login import login_user, logout_user, current_user
from app.extensions import SESSIONS
from app.schemas.user_schema import UserSchema
from app.extensions import get_session

def login_user_(mail, password):
    session = get_session()
    user = session.query(User).filter_by(mail=mail).first()
    if user and user.check_password(password):
        login_user(user)
        return {"message": "Login successful"}
    return {"message": "Invalid email or password"}

def logout_user_():
    logout_user()
    return {"message": "Logged out successfully"}

def get_all_users(q):
    session = get_session(current_user.role)
    query = session.query(User)
    if q:
        query = query.filter(User.mail.ilike(f"%{q}%"))
    users = query.all()
    return [UserSchema().dump(user) for user in users]

def get_user_by_id(user_id):
    session = get_session(current_user.role)
    user = session.query(User).get(user_id)
    if not user:
        abort(404)
    return UserSchema().dump(user)

def create_user(data):
    session = get_session(current_user.role)
    new_user = User(
        mail=data.get('mail'),
        password=data.get('password'),
    )
    new_user.save(session)
    return UserSchema().dump(new_user)

def delete_user_by_id(user_id):
    session = get_session(current_user.role)
    user = session.query(User).get_or_404(user_id)
    user.delete(session)
    return {"message": "User deleted successfully"}

def update_user_by_id(user_id, data):
    session = get_session(current_user.role)
    user = session.query(User).get_or_404(user_id)
    if 'password' in data:
        user.set_password(data.pop('password'))
    user.update(session, data)
    return UserSchema().dump(user)