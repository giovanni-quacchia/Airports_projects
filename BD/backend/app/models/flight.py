from app.extensions import db
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()

class Flight(db.Model):
    __tablename__ = 'flights'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(10), nullable=False)
    
    departure = db.Column(db.DateTime, nullable=False)
    arrival = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # duration in minutes
    
    route = db.Column(db.Integer, nullable=False)
    airline = db.Column(db.Integer, nullable=False)
    airplane = db.Column(db.Integer, nullable=False)
    
    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['route'], ['routes.id'], name='fk_route_flight', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),
        db.ForeignKeyConstraint(['airline'], ['airlines.id'], name='fk_airline_flight', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),
        db.ForeignKeyConstraint(['airplane'], ['airplanes.id'], name='fk_airplane_flight', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),

        # CHECK
        db.CheckConstraint('duration > 0', name='check_duration_positive'),
        db.CheckConstraint('arrival > departure', name='check_arrival_after_departure'),
        
        # UNIQUE
        db.UniqueConstraint('code', 'route', 'departure', name='unique_flight')
    )

    def __repr__(self):
        return f"<Flight {self.id}, {self.code} - Airline: {self.airline} - Route: {self.route} - {self.departure} -- {self.arrival}>"
    
    def save(self, session):
        session.add(self)
        print("New flight created:", self)
        session.commit()

    def delete(self, session, commit=True):
        session.delete(self)
        if commit:
            session.commit()

    def update(self, data, session=None):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        if session:
            session.commit()

# sqlalchemy ORM richiedeva una primary key per mappare la view
class Itinerary(Base):
    __tablename__ = 'itineraries'
    id = db.Column(db.Integer, primary_key=True)
    flight1 = db.Column(JSONB, nullable=False)
    flight2 = db.Column(JSONB, nullable=True)
    tot_duration = db.Column(db.Interval, nullable=False)
    stop_time = db.Column(db.Interval, nullable=True)