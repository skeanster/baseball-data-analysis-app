from flask_restful import Resource
from flask import jsonify, Blueprint, request
from common.orm_db_config import db
from common.orm_db_models import PitchData
from common.orm_common_functions import row2dict

bp = Blueprint('views', __name__)

class NoHitterResource(Resource):
    
    def post(self):
        request_data = request.get_json()
        get_rest_of_month = request_data.get("requestWholeMonth")

        columns = [
            'inning', 'pitch_type', 'pitch_result', 'rel_speed',
            'called_strike', 'swinging_strike', 'spin_rate'
        ]

        rows = PitchData.query.with_entities(
            *[getattr(PitchData, column) for column in columns]
        ).filter(
            PitchData.pitcher_bam_id == 656302,  # Cease
            PitchData.batter_team_bam_id != 120 if get_rest_of_month else PitchData.batter_team_bam_id == 120  # Nationals
        ).all()

        result = [
            {columns[i]: row[i] for i in range(len(columns))}
            for row in rows
        ]

        return jsonify(result)
