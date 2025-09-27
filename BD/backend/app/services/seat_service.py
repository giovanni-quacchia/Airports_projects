from sqlalchemy import select, exists
from app.models.seat import Seat, SeatPublic
from app.models.passenger import Passenger
from app.models.purchase import Purchase
from app.models.flight import Flight
from app.models.ticket import Ticket
from app.schemas.seat_schema import SeatSchema, SeatPublicSchema
from app.extensions import get_session
from flask import abort
from flask_login import current_user

def get_all_seats():
    
    session = get_session()
    Table, Schema = (Seat, SeatSchema) if (current_user.is_authenticated and current_user.role == 'admin') else (SeatPublic, SeatPublicSchema)

    query = session.query(Table)
    res = query.all()
    return Schema(many=True).dump(res)

def get_seat_by_id(sid):
    try:
        session = get_session()
        with session.begin():
            
            # find seat
            seat = session.query(Seat).get(sid)
            if not seat:
                return abort(404, description="Seat not found")

            # check user owner
            if current_user.role == 'user':
                check_user_id_owner(session, seat.passenger, current_user.id)
            # check airline owner
            elif current_user.role == 'airline':
                check_airline_owner(session, seat.ticket, current_user.id)
            elif current_user.role != 'admin':
                return abort(403, description="Forbidden")

            return SeatSchema().dump(seat)
    except Exception as e:
        # rollback automatico
        raise e
    

def create_seat(data):
    try:
        session = get_session()
        with session.begin():
            
            # check user owner
            if current_user.role == 'user':
                check_user_id_owner(session, data.get['passenger'], current_user.id)
            # check airline owner
            elif current_user.role == 'airline':
                check_airline_owner(session, data.get['ticket'], current_user.id)
            elif current_user.role != 'admin':
                return abort(403, description="Forbidden")

            s = Seat(
                passenger=data.get('passenger'),
                ticket=data.get('ticket'),
                seat=data.get('seat'),
                extra=data.get('extra', []),
            )
            s.save(session, commit=False)
            return SeatSchema().dump(s)
    except Exception as e:
        # rollback automatico
        raise e
   

def update_seat_by_id(sid, data):
    try:
        session = get_session()
        with session.begin():

            # find seat
            seat = session.query(Seat).get(sid)
            if not seat:
                return abort(404, description="Seat not found")

            # check user owner
            if current_user.role == 'user':
                check_user_id_owner(session, seat.passenger, current_user.id)
            # check airline owner
            elif current_user.role == 'airline':
                check_airline_owner(session, seat.ticket, current_user.id)
            elif current_user.role != 'admin':
                return abort(403, description="Forbidden")

            # only admin can change ticket, passenger
            if 'passenger' in data and current_user.role != 'admin':
                return abort(403, description="Forbidden: Only admin can change passenger")
            if 'ticket' in data and current_user.role != 'admin':
                return abort(403, description="Forbidden: Only admin can change ticket")

            seat.update(data, session, commit=False)
            return SeatSchema().dump(seat)
    except Exception as e:
        # rollback automatico
        raise e

def delete_seat_by_id(sid):
    session = get_session()
    s = session.query(Seat).get(sid)
    if not s:
        abort(404, description="Seat not found")
    s.delete(session)
    return {"message": "Seat deleted"}

"""
select 1
where exists (
    select 1
    from passengers p
    join purchases pu on p.purchase = pu.id
    where p.id = :passenger_id and pu.user = :user_id
)
"""
def check_user_id_owner(session, passenger_id, user_id):
    query = select(1).where(
        exists(
            select(1)
            .join(Purchase, Passenger.purchase == Purchase.id)
            .where(
                (Passenger.id == passenger_id) &
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
    from tickets t
    join flights f on t.flight = f.id
    where f.id = :flight_id and f.airline = :airline_id
)
"""
def check_airline_owner(session, flight_id, airline_id):

    query = select(1).where(
        exists(
            select(1)
            .join(Flight, Ticket.flight == Flight.id)
            .where(
                (Flight.id == flight_id) &
                (Flight.airline == airline_id)
            )
        )
    )
    res = session.execute(query).scalar()
    if not res:
        return abort(404, description="Airline not found")
    return True