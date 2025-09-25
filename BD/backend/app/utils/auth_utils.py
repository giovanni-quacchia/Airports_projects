from functools import wraps
from flask_login import current_user
from flask import abort
from app.extensions import login_manager
from app.models.user import User
from app.models.airline import Airline

@login_manager.user_loader
def load_user(user_id):
    model, real_id = user_id.split(":")
    if model == "user":
        return User.query.get(int(real_id))
    elif model == "airline":
        return Airline.query.get(int(real_id))
    return None

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print(current_user)
        if not hasattr(current_user, 'isAdmin') or not current_user.isAdmin:
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if hasattr(current_user, 'isAirline') and current_user.isAirline:
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

def admin_or_owner_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = kwargs.get('user_id')
            print(current_user)
            if getattr(current_user, 'isAirline', False):
                abort(403)  # Forbidden
            if not getattr(current_user, 'isAdmin', False) and current_user.id != user_id:
                abort(403)  # Forbidden
            return f(*args, **kwargs)
        return decorated_function

def airline_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(current_user, 'isAirline') or not current_user.isAirline:
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function   

def airline_or_owner_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            airline_id = kwargs.get('airline_id')
            if not getattr(current_user, 'isAirline', False):
                abort(403)  # Forbidden
            if current_user.id != airline_id:
                abort(403)  # Forbidden
            return f(*args, **kwargs)
        return decorated_function