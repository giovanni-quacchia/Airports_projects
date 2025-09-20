from dotenv import load_dotenv

from app.routes import main_blueprint, api, airport_bp
from app.error_handlers import register_error_handlers
from app import create_app

load_dotenv()

app = create_app()

register_error_handlers(app)

app.register_blueprint(main_blueprint)
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(airport_bp, url_prefix='/api/airports')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)