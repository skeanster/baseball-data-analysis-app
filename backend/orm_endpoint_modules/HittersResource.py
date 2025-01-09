from flask_restful import Resource
from flask import jsonify, Blueprint, request
from common.orm_db_models import PitchData

bp = Blueprint('views', __name__)

class HittersResource(Resource):
    
    def get(self):
        rows = PitchData.query.with_entities(
            PitchData.batter_bam_id, PitchData.batter_name_last
        ).filter(
            PitchData.batter_team_bam_id == 135  # Padres
        ).distinct(
            PitchData.batter_bam_id
        ).all()

        result = [{"batter_id": row[0], "batter_name": row[1]} for row in rows]

        return jsonify(result)
    
    def post(self):
        request_data = request.get_json()

        hitter_data = request_data.get("requestHitterData")

        if hitter_data is None:
            return jsonify({"error": "requestHitterData is required"}), 400
        
        columns = [
            'is_pitch', 'swing', 'in_zone', 'hit_exit_speed',
            'foul', 'hit_trajectory', 'pitch_type'
        ]

        rows = PitchData.query.with_entities(
            *[getattr(PitchData, column) for column in columns]
        ).filter(
            PitchData.batter_bam_id == hitter_data,
            PitchData.batter_team_bam_id == 135,  # Padres
        ).all()

        result = [{columns[i]: row[i] for i in range(len(columns))} for row in rows]

        return jsonify(result)
