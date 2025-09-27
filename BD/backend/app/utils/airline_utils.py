from flask_login import current_user
from app.models.airline import Airline, AirlinePublic
from app.schemas.airline_schema import AirlineSchema, AirlinePublicSchema

# Returns session and right Table and Schema (or View)
def get_airline_utils(airline_id_requested=None):

    is_admin_or_owner = current_user.is_authenticated and (current_user.role == 'admin' or (current_user.role == 'airline' and current_user.id == airline_id_requested))

    if is_admin_or_owner:
        return Airline, AirlineSchema
    else:
        return AirlinePublic, AirlinePublicSchema