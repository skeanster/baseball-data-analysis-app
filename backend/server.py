import mysql.connector
from flask import Flask, jsonify
from flask_restful import Api, Resource
from common.orm_db_config import db

# Endpoint Modules
from orm_endpoint_modules import PitchDataResource, NoHitterResource, HittersResource

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:password@localhost/padres_project_data'
db.init_app(app)
api = Api(app)


api.add_resource(PitchDataResource.PitchDataResource,
                 "/pitchdata", methods=['GET'])
api.add_resource(NoHitterResource.NoHitterResource,
                 "/pitchdata/no_hitter", methods=['POST'])
api.add_resource(HittersResource.HittersResource,
                 "/pitchdata/padres_batters", methods=['GET', 'POST'])

if __name__ == "__main__":
    app.run(debug=True, port=5050)
