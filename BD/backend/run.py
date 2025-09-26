from dotenv import load_dotenv
from app import create_app
from app.utils.auth_utils import create_secret_key

load_dotenv()
create_secret_key()

app = create_app()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)