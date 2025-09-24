from app.extensions import db

class RoutesAirplanes(db.Model):
    __tablename__ = 'routes_airplanes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    route = db.Column(db.Integer, nullable=False)
    airplane = db.Column(db.Integer, nullable=False)
    startDate = db.Column(db.DateTime, nullable=False)
    endDate = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<RoutesAirplanes {self.id} - route: {self.route_id}, airplane: {self.airplane_id}>"

    # TODO: trigger per evitare sovrapposizioni di date per lo stesso aereo su una rotta
    # TODO: trigger: airplane deve essere associato ad una airline

    # Constraints
    __table_args__ = (
        # CHECK
        db.CheckConstraint('"endDate" > "startDate"', name='check_start_end_dates'),

        # FK: deferred just before commit
        db.ForeignKeyConstraint(['route'], ['routes.id'], name='fk_route', onupdate='CASCADE', ondelete='CASCADE', deferrable=True, initially='DEFERRED'),
        db.ForeignKeyConstraint(['airplane'], ['airplanes.id'], name='fk_airplane', onupdate='CASCADE', ondelete='CASCADE', deferrable=True, initially='DEFERRED'),
    )
    
    def __repr__(self):
        return f"<RoutesAirplanes route: {self.route}, airplane: {self.airplane}, startDate: {self.startDate}, endDate: {self.endDate}>"

    def save(self):
        db.session.add(self) 
        print("New route-airplane association created:", self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def update(self, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()