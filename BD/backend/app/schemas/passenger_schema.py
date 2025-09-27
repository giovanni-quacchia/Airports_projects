from marshmallow import Schema, fields, validates, ValidationError, validates_schema
from app.schemas.seat_schema import SeatBaseSchema

class PassengerBaseSchema(Schema):
    name = fields.Str(required=True)
    surname = fields.Str(required=True)
    CF = fields.Str(allow_none=True)
    passportNumber = fields.Str(allow_none=True)

    @validates_schema
    def validate_cf_or_passport(self, data, **kwargs):
        if not data.get("CF") and not data.get("passportNumber"):
            raise ValidationError("CF or Passport Number required", field_name="CF")

class PassengerSchema(PassengerBaseSchema):
    id = fields.Int(dump_only=True)
    purchase = fields.Int(required=True)

class PassengerWithSeatsSchema(PassengerBaseSchema):
    seats = fields.List(fields.Nested(SeatBaseSchema), required=True)

    # il passeggero può scegliere un solo posto per ogni biglietto
    @validates_schema
    def validate_seats(self, data, **kwargs):
        seats = data.get("seats", [])
        seen = set()
        for seat in seats:
            ticket = seat.get("ticket")
            if ticket in seen:
                raise ValidationError("A passenger can only choose one seat per ticket", field_name="seats")
            seen.add(ticket)


class PassengerQuerySchema(Schema):
    q = fields.Str()
    sortBy = fields.Str()
    order = fields.Str()

    @validates("sortBy")
    def validate_sortby(self, v):
        if v not in {"name", "surname", "CF", "passportNumber"}:
            raise ValidationError("Sorting parameter not valid")

    @validates("order")
    def validate_order(self, v):
        if v not in {"asc", "desc"}:
            raise ValidationError("Order parameter not valid")
