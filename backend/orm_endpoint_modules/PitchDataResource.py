from flask_restful import Resource
from flask import jsonify, request, Blueprint
from common.orm_db_config import db
from common.orm_db_models import PitchData
from common.orm_common_functions import row2dict

bp = Blueprint('views', __name__)


class PitchDataResource(Resource):
    def get(self):
        rows = PitchData.query.filter(
            PitchData.batter_team == "San Diego Padres"
        ).all()

        result = [row2dict(row) for row in rows]

        return jsonify(result)
