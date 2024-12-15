import pymysql
import config

pymysql.install_as_MySQLdb()

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from flask_cors import CORS
from datetime import datetime, timedelta
from collections import defaultdict

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

class Schedule(db.Model):
    __tablename__ = 'Schedule'
    Email = db.Column(db.String(255), primary_key=True)
    Activity = db.Column(db.String(255), primary_key=True)
    Day = db.Column(db.String(1), primary_key=True)
    StartTime = db.Column(db.Integer, nullable=False)
    EndTime = db.Column(db.Integer, nullable=False)


class Record(db.Model):
    __tablename__ = 'Records'
    Email = db.Column(db.String(255), primary_key=True)
    Activity = db.Column(db.String(255), primary_key=True)
    Datetime = db.Column(db.DateTime, primary_key=True)
    Duration = db.Column(db.Integer, nullable=False)
    Quality = db.Column(db.Integer, nullable=False)

class Meal(db.Model):
    __tablename__ = 'Meals'
    Email = db.Column(db.String(255), primary_key=True)
    FoodName = db.Column(db.String(255), primary_key=True)
    Datetime = db.Column(db.DateTime, primary_key=True)

def record_to_dict(record):
    return {
        "Email": record.Email,
        "Activity": record.Activity,
        "Datetime": record.Datetime.isoformat(),
        "Duration": record.Duration,
        "Quality": record.Quality
    }

def log_to_dict(log):
    return {
                'email': log.Email,
                'startDate': log.StartDate.date().isoformat(),
                'endDate': log.EndDate.date().isoformat(),
                'avgCalBurnt': log.AvgCalBurnt,
                'avgCalConsumed': log.AvgCalConsumed,
                'avgProteinGrams': log.AvgProteinGrams,
                'avgCarbGrams': log.AvgCarbGrams
    }

def meal_to_dict(meal):
    return {
        "Email": meal.Email,
        "FoodName": meal.FoodName,
        "Datetime": meal.Datetime.isoformat()
    }

class DBReader:
    def get_cal_data(self, email, numdays):
        today = datetime.utcnow().date()
        previous_dates = today - timedelta(days=numdays)

        cals_burnt_query = text("""
            SELECT DATE(Datetime) as date, 
                   SUM(a.CaloriesPerKg * us.Weight * (r.Duration / 60)) AS cals_burnt
            FROM Records r
            JOIN Activities a ON r.Activity = a.ActivityName
            JOIN UserStorage us ON r.Email = us.Email
            WHERE r.Email = :email AND DATE(Datetime) BETWEEN :start_date AND :end_date
            GROUP BY DATE(Datetime)
        """)
        cals_ingested_query = text("""
            SELECT DATE(m.Datetime) as date, 
                   SUM(f.Calories) AS total_cals
            FROM Meals m
            JOIN Food f ON m.FoodName = f.FoodName
            WHERE m.Email = :email AND DATE(m.Datetime) BETWEEN :start_date AND :end_date
            GROUP BY DATE(m.Datetime)
        """)
        unhealthy_cals_query = text("""
            SELECT DATE(m.Datetime) as date, 
                   SUM(f.Calories) AS unhealthy_cals
            FROM Meals m
            JOIN Food f ON m.FoodName = f.FoodName
            WHERE m.Email = :email AND DATE(m.Datetime) BETWEEN :start_date AND :end_date
              AND f.HighlyProcessed = 1
            GROUP BY DATE(m.Datetime)
        """)

        # Execute queries
        cals_burnt_results = db.session.execute(cals_burnt_query, {'email': email, 'start_date': previous_dates, 'end_date': today}).fetchall()
        cals_ingested_results = db.session.execute(cals_ingested_query, {'email': email, 'start_date': previous_dates, 'end_date': today}).fetchall()
        unhealthy_cals_results = db.session.execute(unhealthy_cals_query, {'email': email, 'start_date': previous_dates, 'end_date': today}).fetchall()

        # Prepare data
        data_dict = defaultdict(lambda: {'date': '', 'cals_burnt': 0, 'total_cals': 0, 'unhealthy_cals': 0})
        for i in range(numdays+1):
            date = previous_dates + timedelta(days=i)
            data_dict[date]['date'] = date.strftime('%b %d')

        for row in cals_burnt_results:
            data_dict[row.date]['cals_burnt'] = row.cals_burnt or 0

        for row in cals_ingested_results:
            data_dict[row.date]['total_cals'] = row.total_cals or 0

        for row in unhealthy_cals_results:
            data_dict[row.date]['unhealthy_cals'] = row.unhealthy_cals or 0

        return [data_dict[previous_dates + timedelta(days=i)] for i in range(numdays+1)]

    def get_activity_data(self, email, numdays):
        today = datetime.utcnow().date()
        previous_dates = today - timedelta(days=numdays)

        query = text("""
            SELECT r.Activity, 
                   SUM(a.CaloriesPerKg * us.Weight * (r.Duration / 60)) AS cals_burnt
            FROM Records r
            JOIN Activities a ON r.Activity = a.ActivityName
            JOIN UserStorage us ON r.Email = us.Email
            WHERE r.Email = :email AND DATE(r.Datetime) BETWEEN :start_date AND :end_date
            GROUP BY r.Activity
        """)

        results = db.session.execute(query, {'email': email, 'start_date': previous_dates, 'end_date': today}).fetchall()
        return [{'activity': row.Activity, 'cals_burnt': row.cals_burnt or 0} for row in results]


    def get_total_calories_per_day(self, email, numdays):
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=numdays)

        query = text("""
            SELECT DATE(r.Datetime) AS activity_date,
                SUM(a.CaloriesPerKg * us.Weight * (r.Duration / 60)) AS total_calories
            FROM Records r
            JOIN Activities a ON r.Activity = a.ActivityName
            JOIN UserStorage us ON r.Email = us.Email
            WHERE r.Email = :email 
            AND DATE(r.Datetime) BETWEEN :start_date AND :end_date
            GROUP BY activity_date
            ORDER BY activity_date
        """)

        results = db.session.execute(query, {'email': email, 'start_date': start_date, 'end_date': today}).fetchall()
        return [{'date': row.activity_date, 'total_calories': row.total_calories or 0} for row in results]

    def get_activity_percentile_data(self, email, numdays):
        today = datetime.utcnow().date()
        previous_dates = today - timedelta(days=numdays)

        user_query = text("""
            SELECT r.Activity, 
                   SUM(a.CaloriesPerKg * us.Weight * (r.Duration / 60)) AS user_cals_burnt
            FROM Records r
            JOIN Activities a ON r.Activity = a.ActivityName
            JOIN UserStorage us ON r.Email = us.Email
            WHERE r.Email = :email AND DATE(r.Datetime) BETWEEN :start_date AND :end_date
            GROUP BY r.Activity
        """)
        all_users_query = text("""
            SELECT r.Activity, r.Email, 
                   SUM(a.CaloriesPerKg * us.Weight * (r.Duration / 60)) AS cals_burnt
            FROM Records r
            JOIN Activities a ON r.Activity = a.ActivityName
            JOIN UserStorage us ON r.Email = us.Email
            WHERE DATE(r.Datetime) BETWEEN :start_date AND :end_date
            GROUP BY r.Activity, r.Email
        """)

        user_results = db.session.execute(user_query, {'email': email, 'start_date': previous_dates, 'end_date': today}).fetchall()
        all_users_results = db.session.execute(all_users_query, {'start_date': previous_dates, 'end_date': today}).fetchall()

        activity_cals = defaultdict(list)
        for row in all_users_results:
            activity_cals[row.Activity].append(row.cals_burnt)

        percentile_data = []
        for user_row in user_results:
            activity = user_row.Activity
            user_cals_burnt = user_row.user_cals_burnt
            cals_list = sorted(activity_cals[activity])
            total_users = len(cals_list)
            count_less = sum(1 for c in cals_list if c < user_cals_burnt)
            percentile = (count_less / total_users) * 100 if total_users > 0 else 0
            percentile_data.append({'activity': activity, 'percentile': round(percentile, 2)})

        return percentile_data
    
    def get_all_logs_data(self, email):
        user_query = text("""
            SELECT *
            FROM Logs L
            WHERE L.Email = :email                
        """)
        user_logs = db.session.execute(user_query, {'email': email}).fetchall()

        log_data = []
        for log in user_logs:
            entry = log_to_dict(log)
            log_data.append(entry)
        print(user_logs)
        print(log_data)
        return log_data
    
    def create_new_log(self, email: str, startDate: str, endDate: str):
        user_query = text("CALL GenLog(:email, :startDate, :endDate)")
        db.session.execute(user_query, {'email': email, 'startDate': startDate, 'endDate': endDate})
        db.session.commit() 
        
    def get_all_schedule(self, email):
        query = text("""
            SELECT Activity, StartTime, EndTime, Day
            FROM Schedule
            WHERE Email = :email
        """)

        results = db.session.execute(query, {'email': email}).fetchall()
        return [{'activity': row.Activity, 'start_time': row.StartTime, 'end_time': row.EndTime, 'day': row.Day} for row in results]

db_reader = DBReader()

@app.route('/schedule', methods=['POST'])
def create_schedule():
    try:
        data = request.json
        # Check if the record already exists


        start_hour = int(data['StartTime'].split(':')[0])
        end_hour = int(data['EndTime'].split(':')[0])

        if end_hour < start_hour:
            return jsonify({"success": False, "message": "Start Time must be before End Time!"}), 400


        existing_schedule = db.session.execute(
            text("""
                SELECT 1 FROM Schedule 
                WHERE Email = :Email AND Day = :Day AND (:StartTime < EndTime AND :EndTime > StartTime)
                """),
            {
                "Email": data['Email'],
                "Day": data['Day'],
                "StartTime": start_hour,
                "EndTime": end_hour
            }
        ).fetchone()

        if existing_schedule:
            print("Overlap")
            return jsonify({"success": False, "message": "Schedule already exists or overlaps with a pre-existing schedule!"}), 400


        # Insert new record
        db.session.execute(
            text("""
                INSERT INTO Schedule (Email, Activity, Day, StartTime, EndTime)
                VALUES (:Email, :Activity, :Day, :StartTime, :EndTime)
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Day": data['Day'],
                "StartTime": start_hour,
                "EndTime": end_hour
            }
        )
        db.session.commit()
        return jsonify({"success": True, "message": "Record created successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/schedule', methods=['GET'])
def get_all_activities():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_all_schedule(email)
    return jsonify({"success": True, "data": data})


@app.route('/schedule', methods=['PUT'])
def update_schedule():
    try:
        data = request.json

        # Check if the record exists before trying to update
        result = db.session.execute(
            text("""
                SELECT 1 FROM Schedule 
                WHERE Email = :Email AND Activity = :Activity AND Day = :Day AND StartTime = :StartTime
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Day": data['Day'],
                "StartTime": data['StartTime']
            }
        ).fetchone()

        if not result:
            return jsonify({"success": False, "message": "Schedule not found"}), 404

        start_hour = int(data['StartTime'].split(':')[0])
        end_hour = int(data['EndTime'].split(':')[0])

        if end_hour < start_hour:
            return jsonify({"success": False, "message": "Start Time must be before End Time!"}), 400

        check = db.session.execute(
            text("""
                SELECT 1 FROM Schedule 
                WHERE Email = :Email AND Day = :Day AND Activity != :Activity AND (:StartTime < EndTime AND :EndTime > StartTime)
                """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Day": data['Day'],
                "StartTime": start_hour,
                "EndTime": end_hour
            }
        ).fetchone()

        if check:
            return jsonify({"success": False, "message" : "Schedule already exists or overlaps with a pre-existing schedule!"}), 400
        

        # Perform the update
        db.session.execute(
            text("""
                UPDATE Schedule 
                SET EndTime = :EndTime
                WHERE Email = :Email AND Activity = :Activity AND Day = :Day AND StartTime = :StartTime
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Day": data['Day'],
                "StartTime": start_hour,
                "EndTime": end_hour
            }
        )
        db.session.commit()

        return jsonify({"success": True, "message": "Schedule updated successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/schedule', methods=['DELETE'])
def delete_schedule():
    # try:
        data = request.json
        result = db.session.execute(
            text("""
                DELETE FROM Schedule 
                WHERE Email = :Email AND Activity = :Activity AND Day = :Day AND StartTime = :StartTime
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Day": data['Day'],
                "StartTime": data['StartTime']
            }
        )
        db.session.commit()

        print(data['StartTime'])

        if result.rowcount == 0:
            return jsonify({"success": False, "message": "Record not found"}), 404

        return jsonify({"success": True, "message": "Record deleted successfully!"})
    # except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/records', methods=['POST'])
def create_record():
    try:
        data = request.json
        # Check if the record already exists
        existing_record = db.session.execute(
            text("""
                SELECT 1 FROM Records 
                WHERE Email = :Email AND Activity = :Activity AND Datetime = :Datetime
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Datetime": data['Datetime']
            }
        ).fetchone()

        if existing_record:
            return jsonify({"success": False, "message": "Record with this primary key already exists!"}), 400

        # Insert new record
        db.session.execute(
            text("""
                INSERT INTO Records (Email, Activity, Datetime, Duration, Quality)
                VALUES (:Email, :Activity, :Datetime, :Duration, :Quality)
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Datetime": data['Datetime'],
                "Duration": data['Duration'],
                "Quality": data['Quality']
            }
        )
        db.session.commit()
        return jsonify({"success": True, "message": "Record created successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/saved_logs', methods=['GET'])
def get_all_logs():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_all_logs_data(email)
    return jsonify({"success": True, "data": data})

@app.route('/saved_logs', methods=['POST'])
def post_new_log():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    data = request.json
    if not data['startDate']:
        return jsonify({"success": False, "message": "Start Date is required"}), 400

    if not data['endDate']:
        return jsonify({"success": False, "message": "End Date is required"}), 400

    data = db_reader.create_new_log(email, data['startDate'], data['endDate'])
    return jsonify({"success": True, "message": "Log created successfully!"}), 201


@app.route('/records', methods=['GET'])
def get_records():
    try:
        email = request.args.get('email')
        if email:
            records = db.session.execute(
                text("""
                    SELECT * FROM Records WHERE Email = :Email
                """),
                {"Email": email}
            ).fetchall()
        else:
            records = db.session.execute(
                text("""
                    SELECT * FROM Records
                """)
            ).fetchall()

        return jsonify({"success": True, "data": [record_to_dict(record) for record in records]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/records', methods=['PUT'])
def update_record():
    try:
        data = request.json
        result = db.session.execute(
            text("""
                UPDATE Records 
                SET Duration = :Duration, Quality = :Quality 
                WHERE Email = :Email AND Activity = :Activity AND Datetime = :Datetime
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Datetime": data['Datetime'],
                "Duration": data.get('Duration'),
                "Quality": data.get('Quality')
            }
        )
        db.session.commit()

        if result.rowcount == 0:
            return jsonify({"success": False, "message": "Record not found"}), 404

        return jsonify({"success": True, "message": "Record updated successfully!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/records', methods=['DELETE'])
def delete_record():
    try:
        data = request.json
        result = db.session.execute(
            text("""
                DELETE FROM Records 
                WHERE Email = :Email AND Activity = :Activity AND Datetime = :Datetime
            """),
            {
                "Email": data['Email'],
                "Activity": data['Activity'],
                "Datetime": data['Datetime']
            }
        )
        db.session.commit()

        if result.rowcount == 0:
            return jsonify({"success": False, "message": "Record not found"}), 404

        return jsonify({"success": True, "message": "Record deleted successfully!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/meals', methods=['POST'])
def create_meals():
    try:
        data = request.json
        # Check if the meal already exists
        existing_meal = db.session.execute(
            text("""
                SELECT 1 FROM Meals 
                WHERE Email = :Email AND FoodName = :FoodName AND Datetime = :Datetime
            """),
            {
                "Email": data['Email'],
                "FoodName": data['FoodName'],
                "Datetime": data['Datetime']
            }
        ).fetchone()

        if existing_meal:
            return jsonify({"success": False, "message": "Meal with this primary key already exists!"}), 400

        # Insert new meal
        db.session.execute(
            text("""
                INSERT INTO Meals (Email, FoodName, Datetime)
                VALUES (:Email, :FoodName, :Datetime)
            """),
            {
                "Email": data['Email'],
                "FoodName": data['FoodName'],
                "Datetime": data['Datetime']
            }
        )
        db.session.commit()
        return jsonify({"success": True, "message": "Meal created successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/meals', methods=['GET'])
def get_meals():
    try:
        email = request.args.get('email')
        if email:
            meals = db.session.execute(
                text("""
                    SELECT * FROM Meals WHERE Email = :Email
                """),
                {"Email": email}
            ).fetchall()
        else:
            meals = db.session.execute(
                text("""
                    SELECT * FROM Meals
                """)
            ).fetchall()

        return jsonify({"success": True, "data": [meal_to_dict(meal) for meal in meals]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/meals', methods=['PUT'])
def update_meal():
    try:
        data = request.json
        result = db.session.execute(
            text("""
                UPDATE Meals 
                SET FoodName = :FoodName 
                WHERE Email = :Email AND FoodName = :OldFoodName AND Datetime = :Datetime
            """),
            {
                "Email": data['Email'],
                "OldFoodName": data['OldFoodName'],  # Pass old FoodName to identify the record
                "FoodName": data.get('FoodName'),
                "Datetime": data['Datetime']
            }
        )
        db.session.commit()

        if result.rowcount == 0:
            return jsonify({"success": False, "message": "Meal not found"}), 404

        return jsonify({"success": True, "message": "Meal updated successfully!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/meals', methods=['DELETE'])
def delete_meal():
    try:
        data = request.json
        result = db.session.execute(
            text("""
                DELETE FROM Meals 
                WHERE Email = :Email AND FoodName = :FoodName AND Datetime = :Datetime
            """),
            {
                "Email": data['Email'],
                "FoodName": data['FoodName'],
                "Datetime": data['Datetime']
            }
        )
        db.session.commit()

        if result.rowcount == 0:
            return jsonify({"success": False, "message": "Meal not found"}), 404

        return jsonify({"success": True, "message": "Meal deleted successfully!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/foodnames', methods=['GET'])
def get_foodnames():
    try:
        foodnames = db.session.execute(
            text("""
                SELECT FoodName FROM Food
            """)
        ).fetchall()

        foodnames_list = [row[0] for row in foodnames]  
        return jsonify({"success": True, "data": foodnames_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/activitynames', methods=['GET'])
def get_activitynames():
    try:
        activitynames = db.session.execute(
            text("""
                SELECT ActivityName FROM Activities
            """)
        ).fetchall()

        activitynames_list = [row[0] for row in activitynames]  
        return jsonify({"success": True, "data": activitynames_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/weekly/calories', methods=['GET'])
def get_weekly_calories():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_cal_data(email,6)
    return jsonify({"success": True, "data": data})

@app.route('/daily/calories', methods=['GET'])
def get_daily_calories():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_cal_data(email,0)
    return jsonify({"success": True, "data": data})

@app.route('/weekly/activities', methods=['GET'])
def get_weekly_activities():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_activity_data(email, 6)
    return jsonify({"success": True, "data": data})

@app.route('/weekly/activitiescalories', methods=['GET'])
def get_weekly_activitiescalories():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_total_calories_per_day(email, 6)
    return jsonify({"success": True, "data": data})

@app.route('/weekly/percentiles', methods=['GET'])
def get_weekly_percentiles():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_activity_percentile_data(email,6)
    return jsonify({"success": True, "data": data})

@app.route('/monthly/calories', methods=['GET'])
def get_monthly_calories():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_cal_data(email,30)
    return jsonify({"success": True, "data": data})


@app.route('/monthly/activities', methods=['GET'])
def get_monthly_activities():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_activity_data(email, 30)
    return jsonify({"success": True, "data": data})


@app.route('/monthly/percentiles', methods=['GET'])
def get_monthly_percentiles():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    data = db_reader.get_activity_percentile_data(email,30)
    return jsonify({"success": True, "data": data})

@app.route('/user', methods=['POST'])
def add_or_update_user():
    try:
        data = request.json
        email = data.get('email')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        age = data.get('age')
        weight = data.get('weight')
        sex = data.get('sex')
        insomnia = data.get('insomnia', 0)
        maintenance_calories = data.get('maintenanceCalories')

        if not all([email, first_name, last_name, age, weight, sex, maintenance_calories]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        # Check if the user already exists
        user_exists = db.session.execute(
            text("SELECT 1 FROM UserStorage WHERE Email = :email"),
            {"email": email}
        ).fetchone()

        if user_exists:
            # Update the user's information
            db.session.execute(
                text("""
                    UPDATE UserStorage
                    SET FirstName = :first_name,
                        LastName = :last_name,
                        Age = :age,
                        Weight = :weight,
                        Sex = :sex,
                        Insomnia = :insomnia,
                        MaintenanceCalories = :maintenance_calories
                    WHERE Email = :email
                """),
                {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "age": age,
                    "weight": weight,
                    "sex": sex,
                    "insomnia": insomnia,
                    "maintenance_calories": maintenance_calories
                }
            )
        else:
            # Insert new user
            db.session.execute(
                text("""
                    INSERT INTO UserStorage 
                    (Email, FirstName, LastName, Age, Weight, Sex, Insomnia, MaintenanceCalories)
                    VALUES (:email, :first_name, :last_name, :age, :weight, :sex, :insomnia, :maintenance_calories)
                """),
                {
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "age": age,
                    "weight": weight,
                    "sex": sex,
                    "insomnia": insomnia,
                    "maintenance_calories": maintenance_calories
                }
            )
        db.session.commit()
        return jsonify({"success": True, "message": "User information saved successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/user', methods=['GET'])
def check_user_completeness():
    email = request.args.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400

    query = text("SELECT * FROM UserStorage WHERE Email = :email")
    user = db.session.execute(query, {"email": email}).fetchone()

    if user:
        # Check for required fields
        is_complete = all([
            user.FirstName, 
            user.LastName, 
            user.Age is not None, 
            user.Weight is not None, 
            user.Sex
        ])
        return jsonify({
            "success": True,
            "complete": is_complete,
            "profile": user._asdict() if is_complete else None
        })

    return jsonify({"success": True, "complete": False, "profile": None})


if __name__ == "__main__":
    app.run(debug=True)

