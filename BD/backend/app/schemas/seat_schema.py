from marshmallow import Schema, fields, validates, ValidationError, validates_schema
import re

SEAT_RE = re.compile(r'^[A-Z]([1-9]\d*)$')
ALLOWED_EXTRAS = {"LARGER SEAT", "PRIORITY", "EXTRA BAG"}

class SeatPublicSchema(Schema):
    ticket = fields.Int(required=True)
    seat = fields.Str(required=True)

    @validates("seat")
    def validate_seat(self, v: str, **kwargs):
        if not SEAT_RE.match(v or ""):
            raise ValidationError("Seat must be one uppercase letter followed by a positive number, e.g., 'A12'")

class SeatBaseSchema(SeatPublicSchema):
    extra = fields.List(fields.Str(), required=True)

    @validates("extra")
    def validate_extra(self, v: list, **kwargs):
        if not all(item in ALLOWED_EXTRAS for item in v):
            raise ValidationError(f"Extra must be one of {ALLOWED_EXTRAS}")


class SeatSchema(SeatBaseSchema):
    passenger = fields.Int(required=True)
    