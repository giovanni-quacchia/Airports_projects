from app.extensions import db
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY as Array

Base = declarative_base()

class Seat(db.Model):
    __tablename__ = 'seats'

    passenger = db.Column(db.Integer, primary_key=True)
    ticket = db.Column(db.Integer, primary_key=True)
    seat = db.Column(db.String(5), nullable=False)
    extra = db.Column(
        Array(db.Enum('LARGER SEAT', 'PRIORITY', 'EXTRA BAG', name='extra_types')), 
        nullable=False, 
        default=[]
    )

    # TODO: trigger unique seat per flight

    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['ticket'], ['tickets.id'], name='fk_ticket_seat', onupdate='CASCADE', ondelete='CASCADE', deferrable=True, initially='DEFERRED'),
        db.ForeignKeyConstraint(['passenger'], ['passengers.id'], name='fk_passenger_seat', onupdate='CASCADE', ondelete='CASCADE', deferrable=True, initially='DEFERRED'),
    )

    def __repr__(self):
        return f"<Seat {self.seat}: passenger {self.passenger} - Ticket {self.ticket}>"

    def save(self, session=None, commit=True):
        session.add(self)
        print("New Seat created:", self)
        if session and commit:
            session.commit()

    def delete(self, session, commit=True):
        session.delete(self)
        if session and commit:
            session.commit()

    def update(self, data, session=None, commit=True):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        if session and commit:
            session.commit()

# PK (ticket, seat) fittizzia (serve a sqlalchemy per mappare la view)
class SeatPublic(Base):
    __tablename__ = 'public_seats'
    ticket = db.Column(db.Integer, primary_key=True)
    seat = db.Column(db.String(5), primary_key=True, nullable=False)