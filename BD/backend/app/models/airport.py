from app.extensions import db
from marshmallow import Schema, fields
from marshmallow.validate import Length, Regexp

class AirportSchema(Schema):
    id = fields.Int(dump_only=True) # dump-only means it will not be required when creating a new instance
    # 3 uppercase letters
    code = fields.Str(
        required=True,
        validate=Regexp(r'^[A-Z]{3}$')
    )
    name = fields.Str(required=True)
    city = fields.Str(required=True)
    country = fields.Str(required=True)

class Airport(db.Model):
    __tablename__ = 'airports'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(3), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    
    def __init__(self, code, name, city, country):
        self.code = code.upper() # Ensure code is stored in uppercase
        self.name = name
        self.city = city
        self.country = country

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()