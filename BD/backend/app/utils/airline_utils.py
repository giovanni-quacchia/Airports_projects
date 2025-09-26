from flask_login import current_user
from app.utils.auth_utils import get_session
from app.models.airline import Airline, AirlinePublic
from app.schemas.airline_schema import AirlineSchema, AirlinePublicSchema

# Returns session and right Table and Schema (or View)
def get_airline_utils(airline_id_requested=None):

    is_admin_or_owner = current_user.is_authenticated and (current_user.role == 'admin' or (current_user.role == 'airline' and current_user.id == airline_id_requested))
    session = get_session()

    if is_admin_or_owner:
        return session, Airline, AirlineSchema
    else:
        return session, AirlinePublic, AirlinePublicSchema