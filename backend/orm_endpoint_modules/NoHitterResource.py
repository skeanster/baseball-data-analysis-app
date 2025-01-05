from flask_restful import Resource
from flask import jsonify, request, Blueprint
from common.orm_db_config import db
from common.orm_db_models import PitchData
from common.orm_common_functions import row2dict

bp = Blueprint('views', __name__)


class NoHitterResource(Resource):
    def get(self):
        rows = PitchData.query.filter(
            PitchData.pitcher_name_last == "Cease",
            PitchData.batter_team == "Washington Nationals",
        ).all()

        result = [row2dict(row) for row in rows]

        return jsonify(result)
