from app.models.purchase import Purchase
from app.models.ticket import Ticket
from app.models.user import User
from app.models.PurchaseTicket import PurchaseTicket
from app.schemas.purchase_schema import PurchaseSchema
from app.extensions import db
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError 
from flask_login import current_user
from app.extensions import get_session
from flask import abort

# TODO: stampare anche array di tickets acquistati
"""
SELECT p.*, GROUP_CONCAT(pt.ticket) AS tickets
FROM purchases p LEFT OUTER JOIN purchasesTickets pt ON p.id = pt.purchase
"""
def get_all_purchases():
    session = get_session(current_user.role)    
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
    session = get_session(current_user.role)
    purchase = session.query(Purchase).get(purchase_id)
    if not purchase:
        # General error, otherwise it would reveal the existence of the resource
        abort(403, description="Forbidden: You don't have access to this resource")
    if current_user.role != "admin" and purchase.user != current_user.id:
        abort(403, description="Forbidden: You don't have access to this resource")
    return PurchaseSchema().dump(purchase)

# TODO: da sistemare: aggiungere passeggeri e posti???
def create_purchase(data):
    try:
        # commit e rollback gestiti automaticamente
        session = get_session(current_user.role)
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
            tickets = data.get('tickets')
            quantity = new_purchase.quantity
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
                    raise ValueError(f"Insufficient balance for User ID {user.id}. Required: {current_cost} for ticket {ticket_id}, Available: {balance}")
                balance -= current_cost
                
                # Create ticket-purchase
                purchase_ticket = PurchaseTicket(
                    ticket=ticket_id,
                    purchase=new_purchase.id
                )
                session.add(purchase_ticket)
            
            # Update total cost of the purchase
            new_purchase.total_cost = total_cost

            # Update user balance
            user.balance = balance
            
            session.commit()

        return PurchaseSchema().dump(new_purchase)
            

    except SQLAlchemyError as e:
        # rollback automatico
        raise e
    
def delete_purchase_by_id(purchase_id):
    session = get_session(current_user.role)
    purchase = session.query(Purchase).get_or_404(purchase_id)
    purchase.delete(session)
    return {"message": "Purchase deleted successfully"}

def update_purchase_by_id(purchase_id, data):
    session = get_session(current_user.role)
    purchase = session.query(Purchase).get_or_404(purchase_id)
    purchase.update(session, data)
    return PurchaseSchema().dump(purchase)