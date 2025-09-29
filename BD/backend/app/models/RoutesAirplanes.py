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

    def save(self, session):
        session.add(self)
        print("New route-airplane association created:", self)
        session.commit()

    def delete(self, session):
        session.delete(self)
        session.commit()

    def update(self, data, session):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        session.commit()