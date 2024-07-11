from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from bson import ObjectId
from datetime import datetime
from flask_jwt_extended import JWTManager, create_access_token
from dotenv import load_dotenv
import os


# Load environment variables
load_dotenv()

app = Flask(__name__)

# Use an environment variable for the JWT secret key
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'mytoken')
jwt = JWTManager(app)
    
CORS(app)

# Retrieve MongoDB URL from environment variables
mongo_url = os.getenv('mongo_url')
if not mongo_url:
    raise EnvironmentError("MONGO_URL not found in environment variables.")

try:
    client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
    client.server_info()  # Attempt to connect and force a server call
    db = client.get_default_database()  # Get the default database
    app.logger.info("Successfully connected to MongoDB")
    tasks_collection = db['tasks']
except ServerSelectionTimeoutError as e:
    app.logger.error("Database connection failed.", exc_info=True)
    raise e



# Helper function to convert ObjectId to string
def serialize_object_id(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

# Helper function to serialize a task
def serialize_task(task):
    # Helper function to handle datetime or string
    def parse_datetime(dt):
        if isinstance(dt, str):
            return datetime.fromisoformat(dt.rstrip('Z'))
        return dt
    
    dueDate = parse_datetime(task.get('dueDate', datetime.utcnow()))
    created_at = parse_datetime(task.get('created_at', datetime.utcnow()))
    updated_at = parse_datetime(task.get('updated_at', datetime.utcnow()))

    return {
        'id': serialize_object_id(task['_id']),
        'text': task['text'],
        'description': task.get('description', ''),
        'completed': task['completed'],
        'status': task.get('status', 'Pending'),
        'dueDate' : dueDate.isoformat() + 'z',
        'created_at': created_at.isoformat() + 'Z',
        'updated_at': updated_at.isoformat() + 'Z'
    }
    
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    if not name or not email or not phone or not password:
        return jsonify({"error": "Missing fields"}), 400

    user_collection = db['users']
    if user_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    user_id = user_collection.insert_one({
        "name": name,
        "email": email,
        "phone": phone,
        "password": password,  # Store the password as provided
        "role": "user",
        "status": "pending"
    }).inserted_id
    return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')  
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user_collection = db['users']
    user = user_collection.find_one({"email": email, "password": password})  # Check if user exists with provided email and password
    if user:
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify(access_token=access_token, name=user['name'], identity=str(user['_id'])), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = list(tasks_collection.find())
    return jsonify([serialize_task(task) for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    task_data = request.json
    task_data['completed'] = False
    task_data['created_at'] = datetime.utcnow()
    task_data['updated_at'] = datetime.utcnow()
    result = tasks_collection.insert_one(task_data)
    new_task = tasks_collection.find_one({'_id': result.inserted_id})
    return jsonify(serialize_task(new_task)), 201

@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = tasks_collection.find_one({'_id': ObjectId(task_id)})
    if task:
        return jsonify(serialize_task(task))
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    task_data = request.json
    task_data['updated_at'] = datetime.utcnow()
    result = tasks_collection.update_one(
        {'_id': ObjectId(task_id)},
        {'$set': task_data}
    )
    if result.modified_count:
        updated_task = tasks_collection.find_one({'_id': ObjectId(task_id)})
        return jsonify(serialize_task(updated_task))
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    result = tasks_collection.delete_one({'_id': ObjectId(task_id)})
    if result.deleted_count:
        return '', 204
    return jsonify({'error': 'Task not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)