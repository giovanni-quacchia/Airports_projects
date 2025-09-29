from app.models.purchase import Purchase
from app.models.ticket import Ticket
from app.models.flight import Flight
from app.models.user import User
from app.models.airplane import Airplane
from app.models.passenger import Passenger
from app.models.seat import Seat
from app.models.PurchaseTicket import PurchaseTicket
from app.schemas.purchase_schema import PurchaseSchema
from app.extensions import db
from sqlalchemy import select, func
from flask_login import current_user
from app.extensions import get_session
from flask import abort

# stampa anche array di tickets acquistati
"""
SELECT p.*, GROUP_CONCAT(pt.ticket) AS tickets
FROM purchases p 
LEFT OUTER JOIN purchasesTickets pt ON p.id = pt.purchase
"""
def get_all_purchases():
    session = get_session()    
    query = (
        select(Purchase, func.array_agg(PurchaseTicket.ticket).label('tickets'))
        .outerjoin(PurchaseTicket, Purchase.id == PurchaseTicket.purchase) # anche acquisti senza tickets
        .group_by(Purchase.id)
    )

    results = session.execute(query).all()

    return [
        PurchaseSchema().dump(purchase) | {"tickets": tickets if tickets != [None] else []}
        for purchase, tickets in results
    ]

def get_purchase_by_id(purchase_id):
    session = get_session()
    purchase = session.query(Purchase).get(purchase_id)
    if not purchase:
        # General error, otherwise it would reveal the existence of the resource
        abort(403, description="Forbidden: You don't have access to this resource")
    if current_user.role != "admin" and purchase.user != current_user.id:
        abort(403, description="Forbidden: You don't have access to this resource")
    return PurchaseSchema().dump(purchase)

# TODO: da testare
def create_purchase(data):
    try:
        # commit e rollback gestiti automaticamente
        session = get_session()
        with session.begin():
            
            # check isAdmin or data.user == current_user.id
            if current_user.role != "admin" and data.get('user') != current_user.id:
                abort(403, description="Forbidden: You don't have access to this resource")
            
            # Create purchase
            new_purchase = Purchase(
                user=data.get('user'),
                quantity=data.get('quantity'),
                date=db.func.current_timestamp(),
                total_cost=0.0
            )
            session.add(new_purchase)
            session.flush()  # Ensure new_purchase.id is populated
            
            # Find user
            user = session.get(User, new_purchase.user)
            if not user:
                raise ValueError(f"User with ID {new_purchase.user} does not exist.") # TODO: print better in error_handler
            balance = user.balance

            # Acquistare i biglietti
            total_cost = buy_tickets(session, data.get('tickets'), new_purchase.id, new_purchase.quantity, balance)

            # Update total cost of the purchase and user balance
            new_purchase.total_cost = total_cost
            user.balance -= total_cost
            
            # aggiungere passeggeri e posti
            add_passengers(session, data.get('passengers', []), new_purchase.id)
            # commit automatico
            
        return PurchaseSchema().dump(new_purchase)
            
    except Exception as e:
        # rollback automatico
        raise e
    
def delete_purchase_by_id(purchase_id):
    session = get_session()
    purchase = session.query(Purchase).get(purchase_id)
    # General error
    if not purchase:
        abort(403, description="Forbidden: You don't have access to this resource")
    purchase.delete(session)
    return {"message": "Purchase deleted successfully"}

def update_purchase_by_id(purchase_id, data):
    session = get_session()
    purchase = session.query(Purchase).get(purchase_id)
    if not purchase:
        abort(403, description="Forbidden: You don't have access to this resource")
    purchase.update(session, data)
    return PurchaseSchema().dump(purchase)

def is_seat_occupied(session, ticket_id, seat_number):
    # find flight id
    flight_id = session.query(Ticket.flight).filter(Ticket.id == ticket_id).first()[0]

    # check if seat is occupied in the same flight
    existing_seat = (
        session.query(Seat)
        .join(Ticket, Seat.ticket == Ticket.id)
        .where(Seat.seat == seat_number, Ticket.flight == flight_id)
        .exists()
    )
    return True if session.query(existing_seat).scalar() else False

def is_seat_valid_for_airplane(session, ticket_id, seat_number):
    # find airplane id
    airplane_id = (
        session.query(Flight.airplane)
        .join(Ticket, Flight.id == Ticket.flight)
        .where(Ticket.id == ticket_id).first()[0]
    )

    # find airplane rows, letters
    rows, letters = (
        session.query(Airplane.rows, Airplane.letters)
        .where(Airplane.id == airplane_id)
        .one()
    )

    return check_seat(seat_number, rows, letters)


def check_seat(seat, num_rows, num_letters):
    """
    Check if a seat is valid.
    seat must already match regex /^[A-Z]([1-9]\d*)$/ (letter + number).
    """
    letter = seat[0]
    number = int(seat[1:])

    last_char = chr(65 + num_letters - 1)  # 'A' = 65 in ASCII

    return letter <= last_char and number <= num_rows

def buy_tickets(session, tickets, purchase_id, quantity, balance):
    total_cost = 0.0
    for ticket_id in tickets:
        # Find ticket
        ticket = session.get(Ticket, ticket_id)
        if not ticket:
            raise ValueError(f"Ticket with ID {ticket_id} does not exist.") # TODO: print better in error_handler
        
        # Check availability: TODO: print better in error_handler
        if ticket.quantity < quantity:
            raise ValueError(f"Not enough tickets available for Ticket ID {ticket_id}. Requested: {quantity}, Available: {ticket.quantity}")
        
        # Decrease ticket quantity
        ticket.quantity -= quantity

        # Calculate total cost
        current_cost = ticket.price * quantity
        total_cost += current_cost

        # Check and update current balance
        if balance < current_cost:
            raise ValueError(f"Insufficient balance for user. Required: {current_cost} for ticket {ticket_id}, Available: {balance}")
        balance -= current_cost
        
        # Create ticket-purchase
        purchase_ticket = PurchaseTicket(
            ticket=ticket_id,
            purchase=purchase_id
        )
        session.add(purchase_ticket)
    return total_cost

def add_passengers(session, passengers, new_purchase_id, ):
    for passenger_data in passengers:
        passenger = Passenger(
            name=passenger_data.get('name'),
            surname=passenger_data.get('surname'),
            CF=passenger_data.get('CF'),
            passportNumber=passenger_data.get('passportNumber'),
            purchase=new_purchase_id
        )
        session.add(passenger)
        session.flush()  # Ensure passenger.id is populated

        for seat_data in passenger_data.get('seats', []):

            ticket_id = seat_data.get('ticket')
            seat_number = seat_data.get('seat')

            # check if seat is valid for the airplane
            if not is_seat_valid_for_airplane(session, ticket_id, seat_number):  
                return abort(400, description=f"Seat {seat_number} is not valid for Ticket ID {ticket_id}.")

            # check if seat is already occupied in same flight
            if(is_seat_occupied(session, ticket_id, seat_number)):
                return abort(400, description=f"Seat {seat_number} for Ticket ID {ticket_id} is already occupied.")

            seat = Seat(
                ticket=ticket_id,
                seat=seat_number,
                extra=seat_data.get('extra', False),
                passenger=passenger.id
            )
            session.add(seat)