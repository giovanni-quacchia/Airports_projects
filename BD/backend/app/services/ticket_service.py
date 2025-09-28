from app.models.ticket import Ticket
from app.models.flight import Flight
from app.models.route import Route
from app.models.airport import Airport
from app.schemas.ticket_schema import TicketSchema, TicketGetSchema
from app.extensions import get_session
from flask import abort
from flask_login import current_user
from sqlalchemy import asc, desc, func
from sqlalchemy.orm import aliased
from sqlalchemy.dialects.postgresql import JSONB

def get_all_tickets(type=None, min_price=None, max_price=None, min_quantity=None, max_quantity=None, sort_by=None, order='asc'):

    session = get_session()
    query = session.query(Ticket)

    if type:
        query = query.where(Ticket.type == type)
    if min_price:
        query = query.where(Ticket.price >= min_price)
    if max_price:
        query = query.where(Ticket.price <= max_price)
    if min_quantity:
        query = query.where(Ticket.quantity >= min_quantity)
    if max_quantity:
        query = query.where(Ticket.quantity <= max_quantity)
    if sort_by:
        query = query.order_by(asc(sort_by) if order == 'asc' else desc(sort_by))

    res = query.all()
    return TicketSchema(many=True).dump(res)

def get_ticket_by_id(ticket_id):
    session = get_session()
    ticket = session.query(Ticket).get(ticket_id)
    if not ticket:
        abort(404, description=f"Ticket with id {ticket_id} not found")
    return TicketSchema().dump(ticket)

def get_tickets_for_flight(flight_id, type=None, min_price=None, max_price=None, min_quantity=None, max_quantity=None, sort_by=None, order='asc'):
    session = get_session()

    FromAirport, ToAirport = aliased(Airport), aliased(Airport)

    query = (
        session.query(
            Ticket.id,
            Ticket.type,
            Ticket.price,
            Ticket.quantity,
            Flight.id.label('flight'),
            Flight.airline.label('airline'),
            Flight.code.label('flight_code'),
            Flight.departure,
            Flight.arrival,
            FromAirport.code.label('from_airport'),
            ToAirport.code.label('to_airport'),
        )
        .join(Flight, Ticket.flight == Flight.id)
        .join(Route, Flight.route == Route.id)
        .join(FromAirport, Route.from_airport == FromAirport.id)
        .join(ToAirport, Route.to_airport == ToAirport.id)
        .where(Ticket.flight == flight_id)
    )

    if type:
        query = query.where(Ticket.type == type)
    if min_price:
        query = query.where(Ticket.price >= min_price)
    if max_price:
        query = query.where(Ticket.price <= max_price)
    if min_quantity:
        query = query.where(Ticket.quantity >= min_quantity)
    if max_quantity:
        query = query.where(Ticket.quantity <= max_quantity)
    if sort_by:
        query = query.order_by(asc(sort_by) if order == 'asc' else desc(sort_by))

    res = query.all()

    return TicketGetSchema(many=True).dump(res)

def create_ticket(data):
    try:
        session = get_session()
        with session.begin():

            # check admin or (current_user.role == 'airline' and flight.airline == current_user.id)
            if current_user.role == 'airline':
                flight = session.query(Flight).get(data['flight'])
                if not flight or flight.airline != current_user.id:
                    abort(403, description="Forbidden: You don't have access to this resource")

            new_ticket = Ticket(
                type=data['type'],
                price=data['price'],
                quantity=data['quantity'],
                flight=data['flight']
            )

            new_ticket.save(session)
            return TicketSchema().dump(new_ticket)
        
    except Exception as e:
        # rollback automatico
        raise e

def delete_ticket_by_id(ticket_id):
    try:
        session = get_session()
        ticket = session.query(Ticket).get(ticket_id)
        if not ticket:
            abort(404, description=f"Ticket not found")
        # check admin or (current_user.role == 'airline' and flight.airline == current_user.id)
        if current_user.role == 'airline':
            flight = session.query(Flight).get(ticket.flight)
            if not flight or flight.airline != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")

        ticket.delete(session)
        return {"message": "Ticket deleted successfully"}
    except Exception as e:
        # rollback automatico
        raise e

    except Exception as e:
        # rollback automatico
        raise e

def update_ticket_by_id(ticket_id, data):
    try:
        session = get_session()
        ticket = session.query(Ticket).get(ticket_id)
        if not ticket:
            abort(404, description=f"Ticket not found")
        
        # airline can't set new flight of different airline
        
        if current_user.role == 'airline':
            if data.get('flight'):
                flight = session.query(Flight).get(data['flight'])
                if not flight or flight.airline != current_user.id:
                    abort(403, description="Forbidden: You don't have access to this resource")


        ticket.update(data, session)
        return TicketSchema().dump(ticket)
    except Exception as e:
        # rollback automatico
        raise e