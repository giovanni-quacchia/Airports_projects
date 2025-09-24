from app.extensions import db

class Purchase(db.Model):
    __tablename__ = 'purchasesTickets'
    purchase = db.Column(db.Integer, primary_key=True)
    ticket = db.Column(db.Integer, primary_key=True)
    """
    TODO:   trigger before insert/update: check when (new.purchase.qnt - curr.purchase.qnt) > 0
            then ticket.qnt >= (new.purchase.qnt - curr.purchase.qnt)
    """
    # Constraints
    __table_args__ = (
        
        # FK
        db.ForeignKeyConstraint(['purchase'], ['purchases.id'], name='fk_purchase', onupdate='CASCADE', ondelete='CASCADE'),
        db.ForeignKeyConstraint(['ticket'], ['tickets.id'], name='fk_ticket', onupdate='CASCADE', ondelete='RESTRICT'),
    )
    