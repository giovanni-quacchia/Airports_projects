from app.extensions import db
from marshmallow import Schema, fields

class AirportSchema(Schema):
    code = fields.Int()
    name = fields.Str(required=True)
    city = fields.Str(required=True)
    country = fields.Str(required=True)


class Airport(db.Model):
    __tablename__ = 'airports'
    code = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)

    def save(self):
        db.session.add(self)
        db.session.commit()