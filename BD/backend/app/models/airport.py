from app.extensions import db

class Airport(db.Model):
    __tablename__ = 'airports'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(3), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<Airport {self.code} - {self.name}>"

    def save(self, session):
        session.add(self)
        print("New airport created:", self)
        session.commit()

    def delete(self, session):
        session.delete(self)
        session.commit()

    def update(self, data, session):
        for key, value in data.items():
            if hasattr(self, key):
                if key == 'code':
                    value = value.upper()
                setattr(self, key, value)
        session.commit()
