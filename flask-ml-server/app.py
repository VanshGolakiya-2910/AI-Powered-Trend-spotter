from flask import Flask, jsonify
import subprocess
import redis
app = Flask(__name__)

# Redis connection
redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)

@app.route('/')
def home():
    return "ML Backend Server is running!"

@app.route('/run', methods=['GET'])
def run_scripts():
    try:
        import os
        runner_path = os.path.join(os.path.dirname(__file__), 'Runner.py')
        result = subprocess.run(['python', runner_path], capture_output=True, text=True)
        
        response = {
            "status": "success",
            "stdout": result.stdout,
            "stderr": result.stderr if result.stderr else None
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/results', methods=['GET'])
def get_results():
    # This assumes topic modeling results are stored in Redis (you can customize this)
    data = redis_client.lrange("Twitter_data", 0, 0)
    if not data:
        return jsonify({"status": "error", "message": "No data found in Redis"}), 404

    return jsonify({"status": "success", "data": data[0]}), 200


if __name__ == '__main__':
    app.run(debug=True)
