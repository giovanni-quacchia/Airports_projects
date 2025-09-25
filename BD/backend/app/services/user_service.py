from app.models.user import User
from flask import abort
from flask_login import login_user, logout_user


def login_user_(mail, password):
    user = User.query.filter_by(mail=mail).first()
    if user and user.check_password(password):
        login_user(user)
        return {"message": "Login successful"}
    return {"message": "Invalid email or password"}

def logout_user_():
    logout_user()
    return {"message": "Logged out successfully"}

def get_all_users(q):
    query = User.query
    if q:
        query = query.filter(User.mail.ilike(f"%{q}%"))
    users = query.all()
    return [{
        "id": user.id,
        "mail": user.mail,
        "isAdmin": user.isAdmin,
        "balance": user.balance
    } for user in users
    ]

def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        abort(404)
    return {
        "id": user.id,
        "mail": user.mail,
        "isAdmin": user.isAdmin,
        "balance": user.balance
    }

def create_user(data):
    new_user = User(
        mail=data.get('mail'),
        password=data.get('password'),
    )
    new_user.save()
    return {
        "id": new_user.id,
        "mail": new_user.mail,
        "isAdmin": new_user.isAdmin,
        "balance": new_user.balance
    }

def delete_user_by_id(user_id):
    user = User.query.get_or_404(user_id)
    user.delete()
    return {"message": "User deleted successfully"}

def update_user_by_id(user_id, data):
    user = User.query.get_or_404(user_id)
    if 'password' in data:
        user.set_password(data.pop('password'))
    user.update(data)
    return {
        "id": user.id,
        "mail": user.mail,
        "isAdmin": user.isAdmin,
        "balance": user.balance
    }