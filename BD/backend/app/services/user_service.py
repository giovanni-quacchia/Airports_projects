from app.models.user import User
from flask import abort
from flask_login import login_user, logout_user
from app.schemas.user_schema import UserSchema
from app.extensions import get_session

def login_user_(mail, password):

    session = get_session()
    user = session.query(User).filter_by(mail=mail).first()

    if user and user.check_password(password):
        login_user(user)
        return {"msg": "Login successful", "user": UserSchema().dump(user)}
    else:
        abort(401, description="Invalid email or password")

def logout_user_():
    logout_user()
    return {"msg": "Logged out successfully"}

def get_all_users(q):
    
    session = get_session()
    query = session.query(User)

    if q:
        query = query.filter(User.mail.ilike(f"%{q}%"))

    users = query.all()
    return UserSchema(many=True).dump(users)

def get_user_by_id(user_id):

    session = get_session()
    user = session.query(User).get(user_id)

    if not user:
        abort(404, description="User not found")

    return UserSchema().dump(user)

def create_user(data):

    try:
        session = get_session()
        with session.begin():
            existing_user = session.query(User).filter_by(mail=data.get('mail')).first()
            if existing_user:
                raise ValueError("User with this email already exists")
            # Create new user
            new_user = User(
                mail=data.get('mail'),
                password=data.get('password'),
            )

            new_user.save(session, commit=False)
            return UserSchema().dump(new_user)
    except Exception as e:
        # rollback automatico
        raise e

def delete_user_by_id(user_id):

    session = get_session()
    user = session.query(User).get(user_id)

    if not user:
        abort(404, description="User not found")

    user.delete(session)
    return {"msg": "User deleted successfully"}

def update_user_by_id(user_id, data):

    session = get_session()
    user = session.query(User).get(user_id)

    if not user:
        abort(404, description="User not found")
    if 'password' in data:
        user.set_password(data.pop('password'))
        
    user.update(session, data)
    return UserSchema().dump(user)