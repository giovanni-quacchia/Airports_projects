from app.extensions import db

class Airplane(db.Model):
    __tablename__ = 'airplanes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    model = db.Column(db.String(50), nullable=False)
    letters = db.Column(db.Integer, nullable=False)
    rows = db.Column(db.Integer, nullable=False)
    # Airline null when airplane is not assigned to any airline
    airline = db.Column(db.Integer)

    # Constraints
    __table_args__ = (
        # CHECK
        db.CheckConstraint('letters > 0', name='check_positive_letters'),
        db.CheckConstraint('rows > 0', name='check_positive_rows'),
        
        # FK
        db.ForeignKeyConstraint(['airline'], ['airlines.id'], name='fk_airline', onupdate='CASCADE', ondelete='SET NULL'),   
    )
    
    def __repr__(self):
        return f"<Airplane {self.id} - airline: {self.airline} >"

    def save(self, session):
        session.add(self)
        print("New airplane created:", self)
        session.commit()

    def delete(self, session):
        session.delete(self)
        session.commit()

    def update(self, session, data):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        session.commit()