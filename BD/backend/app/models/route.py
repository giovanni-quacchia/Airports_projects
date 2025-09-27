from app.extensions import db

class Route(db.Model):
    __tablename__ = 'routes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    from_airport = db.Column(db.Integer, nullable=False)
    to_airport = db.Column(db.Integer, nullable=False)

    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['from_airport'], ['airports.id'], name='fk_from_airport', onupdate='CASCADE', ondelete='RESTRICT'),
        db.ForeignKeyConstraint(['to_airport'], ['airports.id'], name='fk_to_airport', onupdate='CASCADE', ondelete='RESTRICT'),

        # CHECK
        db.CheckConstraint('from_airport != to_airport', name='check_different_airports'),
        
        # UNIQUE   
        db.UniqueConstraint('from_airport', 'to_airport', name='unique_route')
    )
    
    def __repr__(self):
        return f"<Route {self.from_airport} - {self.to_airport}>"

    def save(self, session):
        session.add(self)
        print("New route created:", self)
        session.commit()

    def delete(self, session):
        session.delete(self)
        session.commit()
    
    def update(self, data, session):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        session.commit()
