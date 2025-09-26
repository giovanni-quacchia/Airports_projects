from app.models.airline import Airline, AirlinePublic
from app.schemas.airline_schema import AirlineSchema, AirlinePublicSchema
from flask import abort
from sqlalchemy import or_, select
from app.extensions import db
from flask_login import login_user, logout_user, current_user
from app.extensions import get_session

from app.utils.airline_utils import get_airline_utils

def login_airline_(mail, password, newPassword=None):
    session = get_session()
    airline = session.query(Airline).filter_by(mail=mail).first()

    if not airline or not airline.check_password(password):
        abort(401, description="Invalid email or password")

    if airline.isFirstLogin:
        if newPassword is None:
            abort(400, description="First login requires a new password")
        airline.set_password(newPassword)
        airline.isFirstLogin = False
        airline.save(session)
    login_user(airline)
    return {"message": "Login successful"}

def logout_airline_():
    logout_user()
    return {"message": "Logged out successfully"}


def get_all_airlines(q):
    
    session = get_session()
    Table, Schema = get_airline_utils()
    
    query = session.query(Table)
    if q:
        query = query.filter(AirlineMatch(Table, q))
    airlines = query.all()
    return [Schema().dump(airline) for airline in airlines]

def get_airline_by_id(airline_id):
    session = get_session()
    Table, Schema = get_airline_utils(airline_id_requested=airline_id)
    airline = session.query(Table).get(airline_id)
    if not airline:
        abort(404)
    return Schema().dump(airline)

def create_airline(data):
    session = get_session(current_user.role)
    new_airline = Airline(
        mail=data.get('mail'),
        code=data.get('code'),
        name=data.get('name'),
        PIVA=data.get('PIVA'),
        logo=data.get('logo'),
    )
    new_airline.save(session)
    return AirlineSchema().dump(new_airline)

def delete_airline_by_id(airline_id):
    session = get_session(current_user.role)
    airline = session.query(Airline).get_or_404(airline_id)
    airline.delete(session)
    return {"message": "Airline deleted successfully"}

def update_airline_by_id(airline_id, data):
    session = get_session(current_user.role)
    airline = session.query(Airline).get_or_404(airline_id)
    if 'password' in data:
        airline.set_password(data.pop('password'))
    airline.update(session, data)
    return AirlineSchema().dump(airline)
    
# WHERE code LIKE '%q%' OR name LIKE '%q%' ...
def AirlineMatch(table, q):
    return or_(
        table.code.ilike(f'%{q}%'),
        table.name.ilike(f'%{q}%'),
        table.PIVA.ilike(f'%{q}%'),
    )

def airline_exists(airline_id) -> bool:
    session = get_session()
    exists_query = select(AirlinePublic.id).where(AirlinePublic.id == airline_id).exists()
    exists_airline = session.execute(select(exists_query)).scalar()
    return exists_airline