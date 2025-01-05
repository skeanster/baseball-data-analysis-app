import mysql.connector
from flask import Flask, jsonify
from flask_restful import Api, Resource
from common.orm_db_config import db

# Endpoint Modules
from orm_endpoint_modules import PitchDataResource, NoHitterResource

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:password@localhost/padres_project_data'
db.init_app(app)
api = Api(app)

class Home(Resource):
    def get(self):
        result = {"ryan": "Welcome to my Python backend!"}
        return jsonify(result)


api.add_resource(Home, "/test", methods=['GET'])
api.add_resource(PitchDataResource.PitchDataResource,
                 "/pitchdata", methods=['GET'])
api.add_resource(NoHitterResource.NoHitterResource,
                 "/pitchdata/no_hitter", methods=['GET'])

if __name__ == "__main__":
    app.run(debug=True, port=5050)  # Enable debug mode and set the port
