from app.extensions import db

class PurchaseTicket(db.Model):
    purchase = db.Column(db.Integer, primary_key=True, nullable=False)
    ticket = db.Column(db.Integer, primary_key=True, nullable=False)

    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['purchase'], ['purchases.id'], name='fk_purchase_ticket_purchase', onupdate='CASCADE', ondelete='RESTRICT'),
        db.ForeignKeyConstraint(['ticket'], ['tickets.id'], name='fk_purchase_ticket_ticket', onupdate='CASCADE', ondelete='SET NULL'),
    )