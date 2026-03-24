import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config

from routes.auth_routes        import auth_bp
from routes.disease_routes     import disease_bp
from routes.weather_routes     import weather_bp
from routes.risk_routes        import risk_bp
from routes.crop_routes        import crop_bp
from routes.marketplace_routes import marketplace_bp
from routes.credit_routes      import credit_bp
from routes.worker_routes      import worker_bp
from routes.admin_routes       import admin_bp
from routes.feedback_routes    import feedback_bp
from routes.payment_routes     import payment_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # CORS 
    CORS(app, resources={r"/api/*": {"origins": Config.FRONTEND_URLS}})

    # Blueprint Registration 
    app.register_blueprint(auth_bp,         url_prefix='/api/v1/auth')
    app.register_blueprint(disease_bp,      url_prefix='/api/v1/disease')
    app.register_blueprint(weather_bp,      url_prefix='/api/v1/weather')
    app.register_blueprint(risk_bp,         url_prefix='/api/v1/risk')
    app.register_blueprint(crop_bp,         url_prefix='/api/v1/crop')
    app.register_blueprint(marketplace_bp,  url_prefix='/api/v1/marketplace')
    app.register_blueprint(credit_bp,       url_prefix='/api/v1/credit')
    app.register_blueprint(worker_bp,       url_prefix='/api/v1/workers')
    app.register_blueprint(admin_bp,        url_prefix='/api/v1/admin')
    app.register_blueprint(feedback_bp,     url_prefix='/api/v1/feedback')
    app.register_blueprint(payment_bp,      url_prefix='/api/v1/payment')

    # Static file 
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'FarmFi API', 'version': '1.0'})

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=os.getenv('FLASK_ENV') == 'development', port=5000)