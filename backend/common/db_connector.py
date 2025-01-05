import mysql.connector


class DBConnector:
    @classmethod
    def connect(cls):
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="password",
            database="padres_project_data"
        )

        cursor = db.cursor()
        return db, cursor
