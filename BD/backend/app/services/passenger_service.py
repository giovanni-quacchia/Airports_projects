from sqlalchemy import or_, asc, desc, select, exists
from app.models.passenger import Passenger
from app.models.purchase import Purchase
from app.models.ticket import Ticket
from app.models.flight import Flight
from app.models.PurchaseTicket import PurchaseTicket
from app.schemas.passenger_schema import PassengerSchema
from app.extensions import get_session
from flask import abort
from flask_login import current_user

def get_all_passengers(q=None, sort_by=None, order='asc'):
    session = get_session()
    query = session.query(Passenger)
    
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Passenger.name.ilike(search),
                Passenger.surname.ilike(search),
                Passenger.CF.ilike(search),
                Passenger.passportNumber.ilike(search)
            )
        )
    
    # Sorting
    if sort_by:
        column = getattr(Passenger, sort_by, None)
        if column:
            query = query.order_by(desc(column) if order == 'desc' else asc(column))
    
    res = query.all()
    return PassengerSchema(many=True).dump(res)

def get_passenger_by_id(pid):
    try:
        session = get_session()
        with session.begin():
            
            # find passenger
            passenger = session.query(Passenger).get(pid)
            if not passenger:
                return abort(404, description="Passenger not found")
            
            # check user owner
            if current_user.role == 'user':
                check_user_id_owner(session, passenger.purchase, current_user.id)
            # check airline owner
            elif current_user.role == 'airline':
                check_airline_owner(session, passenger.purchase, current_user.id)
            elif current_user.role != 'admin':
                return abort(403, description="Forbidden")
            
            return PassengerSchema().dump(passenger)
    except Exception as e:
        # rollback automatico
        raise e
    

def create_passenger(data):
    try:
        session = get_session()
        with session.begin():
            
            # check user owner
            if current_user.role == 'user':
                check_user_id_owner(session, data.get['purchase'], current_user.id)
            # check airline owner
            elif current_user.role == 'airline':
                check_airline_owner(session, data.get['purchase'], current_user.id)
            elif current_user.role != 'admin':
                return abort(403, description="Forbidden")
            
            # Create passenger
            p = Passenger(
                name=data.get('name'),
                surname=data.get('surname'),
                CF=data.get('CF'),
                passportNumber=data.get('passportNumber'),
                purchase=data.get('purchase_id'),
            )
            p.save(session, commit=False)

            # TODO: create seat
            

            return PassengerSchema().dump(p)
    except Exception as e:
        # rollback automatico
        raise e
   

def update_passenger_by_id(pid, data):
    try:
        session = get_session()
        with session.begin():
            
            # find passenger
            passenger = session.query(Passenger).get(pid)
            if not passenger:
                return abort(404, description="Passenger not found")
            
            # check user owner
            if current_user.role == 'user':
                check_user_id_owner(session, passenger.purchase, current_user.id)
            # check airline owner
            elif current_user.role == 'airline':
                check_airline_owner(session, passenger.purchase, current_user.id)
            elif current_user.role != 'admin':
                return abort(403, description="Forbidden")
            
            # only admin can change purchase
            if 'purchase' in data and current_user.role != 'admin':
                return abort(403, description="Forbidden: Only admin can change purchase")
            
            passenger.update(data, session, commit=False)
            return PassengerSchema().dump(passenger)
    except Exception as e:
        # rollback automatico
        raise e

def delete_passenger_by_id(pid):
    session = get_session()
    p = session.query(Passenger).get(pid)
    if not p:
        abort(404, description="Passenger not found")
    p.delete(session)
    return {"message": "Passenger deleted"}

"""
select 1
where exists (
    select 1
    from purchases p
    where p.id = :purchase_id and p.user = :user_id
)
"""
def check_user_id_owner(session, purchase_id, user_id):
    query = select(1).where(
        exists(
            select(1)
            .where(
                (Purchase.id == purchase_id) &
                (Purchase.user == user_id)
            )
        )
    )
    user = session.execute(query).scalar()
    if not user:
        return abort(404, description="User not found")
    return True

"""
select 1
where exists (
    select 1
    from purchase_tickets pt
    join tickets t on pt.ticket = t.id
    join flights f on t.flight = f.id
    where pt.purchase = :purchase_id and f.airline = :airline_id
)
"""
def check_airline_owner(session, purchase_id, airline_id):

    query = select(1).where(
        exists(
            select(1)
            .join(Ticket, PurchaseTicket.ticket == Ticket.id)
            .join(Flight, Ticket.flight == Flight.id)
            .where(
                (PurchaseTicket.purchase == purchase_id) &
                (Flight.airline == airline_id)
            )
        )
    )

    res = session.execute(query).scalar()

    if not res:
        return abort(404, description="Airline not found")

    return True