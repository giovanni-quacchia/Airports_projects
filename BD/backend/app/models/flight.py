from app.extensions import db

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
    
    # TODO: trigger check airplane.airline == airline
    # TODO: trigger check airplane.route == route per periodo
    # TODO: trigger if (route, code) exists, then same code for same route
    
    # TODO: problema del deferrable solo su rotta
    
    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['route'], ['routes.id'], name='fk_route', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),
        db.ForeignKeyConstraint(['airline'], ['airlines.id'], name='fk_airline', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),
        db.ForeignKeyConstraint(['airplane'], ['airplanes.id'], name='fk_airplane', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),

        # CHECK
        db.CheckConstraint('duration > 0', name='check_duration_positive'),
        db.CheckConstraint('arrival > departure', name='check_arrival_after_departure'),
        
        # UNIQUE
        db.UniqueConstraint('code', 'route', 'departure', name='unique_flight')
    )

    def __repr__(self):
        return f"<Flight {self.id}, {self.code} - Airline: {self.airline} - Route: {self.route} - {self.departure} -- {self.arrival}>"
    
    def save(self):
        db.session.add(self)
        print("New flight created:", self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def update(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()