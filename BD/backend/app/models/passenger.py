from app.extensions import db

class Passenger(db.Model):
    __tablename__ = 'passengers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    CF = db.Column(db.String(32))
    passportNumber = db.Column(db.String(32))

    purchase = db.Column(db.Integer, nullable=False)

    # Constraints
    __table_args__ = (
        # FK
        db.ForeignKeyConstraint(['purchase'], ['purchases.id'], name='fk_purchase_passenger', onupdate='CASCADE', ondelete='RESTRICT', deferrable=True, initially='DEFERRED'),
    
        # CHECK
        db.CheckConstraint("CF IS NOT NULL OR passportNumber IS NOT NULL", name='check_CF_or_passport_not_null'),
    )

    def __repr__(self):
        return f"<Passenger {self.name} {self.surname}>"

    def save(self, session=None, commit=True):
        session.add(self)
        print("New Passenger created:", self)
        if session and commit:
            session.commit()

    def delete(self, session, commit=True):
        session.delete(self)
        if commit:
            session.commit()

    def update(self, data, session=None, commit=True):
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        if session and commit:
            session.commit()