from app.models.ticket import Ticket
from app.schemas.ticket_schema import TicketSchema
from sqlalchemy import select
from app.extensions import db

def get_all_tickets(params=None):
    params = params or {}

    # Define filters with lambdas
    filters = {
        "type": lambda v: Ticket.type == v,
        "min_price": lambda v: Ticket.price >= v,
        "max_price": lambda v: Ticket.price <= v,
        "min_quantity": lambda v: Ticket.quantity >= v,
        "max_quantity": lambda v: Ticket.quantity <= v,
    }

    query = select(Ticket)
    for key, func in filters.items():
        value = params.get(key)
        if value is not None:
            query = query.where(func(value))

    tickets = db.session.execute(query).scalars().all()
    return TicketSchema(many=True).dump(tickets)

def get_ticket_by_id(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id, description=f"Ticket with id {ticket_id} not found")
    return TicketSchema().dump(ticket)

def create_ticket(data):
    new_ticket = Ticket(
        type=data['type'],
        price=data['price'],
        quantity=data['quantity'],
        flight=data['flight']
    )
    new_ticket.save()
    return TicketSchema().dump(new_ticket)

def delete_ticket_by_id(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id, description=f"Ticket with id {ticket_id} not found")
    ticket.delete()
    return {"message": "Ticket deleted successfully"}

def update_ticket_by_id(ticket_id, data):
    ticket = Ticket.query.get_or_404(ticket_id, description=f"Ticket with id {ticket_id} not found")
    ticket.update(data)
    return TicketSchema().dump(ticket)