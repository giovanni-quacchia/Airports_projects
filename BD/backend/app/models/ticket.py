from app.extensions import db

class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    type = db.Column(db.Enum('ECONOMY', 'BUSINESS', 'FIRST_CLASS', name='ticket_types'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    flight = db.Column(db.Integer, nullable=False)

    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['flight'], ['flights.id'], name='fk_flight', onupdate='CASCADE', ondelete='CASCADE'),

        # CHECK
        db.CheckConstraint('quantity >= 0', name='ck_quantity_non_negative'),
        db.CheckConstraint('price >= 0', name='ck_price_non_negative'),

        # UNIQUE
        db.UniqueConstraint('flight', 'type', name='uq_flight_type')
    )

    def __repr__(self):
        return f"<Ticket Flight: {self.flight}, Type: {self.type}, Price: {self.price}, Quantity: {self.quantity}>"
    
    def save(self, session):
        session.add(self)
        print("New ticket created:", self)
        session.commit()

    def delete(self, session):
        session.delete(self)
        session.commit()

    def update(self, data, session):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        session.commit()
