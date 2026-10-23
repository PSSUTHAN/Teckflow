import os
import sys
from datetime import datetime, timezone
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import db

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

PORT = int(os.getenv("PORT", 3000))
NODE_ENV = os.getenv("NODE_ENV", "development")

# Initialize database / storage
db.init_db()

# -------------------------------------------------------------
# Frontend Routes
# -------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")

# -------------------------------------------------------------
# REST API Endpoints
# -------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db.get_db_status()
    }), 200

@app.route("/api/db-status", methods=["GET"])
def db_status():
    return jsonify({
        "success": True,
        "data": db.get_db_status()
    }), 200

@app.route("/api/tasks/stats", methods=["GET"])
def task_stats():
    try:
        stats = db.get_stats()
        return jsonify({
            "success": True,
            "data": stats
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks", methods=["GET"])
def list_tasks():
    try:
        status = request.args.get("status")
        priority = request.args.get("priority")
        search = request.args.get("search")
        sort_by = request.args.get("sortBy", "createdAt")
        sort_order = request.args.get("sortOrder", "desc")

        tasks = db.get_tasks(
            status=status,
            priority=priority,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return jsonify({
            "success": True,
            "count": len(tasks),
            "data": tasks
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks/<task_id>", methods=["GET"])
def get_task(task_id):
    try:
        task = db.get_task_by_id(task_id)
        if not task:
            return jsonify({
                "success": False,
                "message": f"Task not found with ID {task_id}"
            }), 404
        return jsonify({
            "success": True,
            "data": task
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks", methods=["POST"])
def create_new_task():
    try:
        data = request.get_json() or {}
        task = db.create_task(data)
        return jsonify({
            "success": True,
            "message": "Task created successfully",
            "data": task
        }), 201
    except ValueError as val_err:
        return jsonify({
            "success": False,
            "message": str(val_err)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks/<task_id>", methods=["PUT"])
def update_existing_task(task_id):
    try:
        data = request.get_json() or {}
        task = db.update_task(task_id, data)
        if not task:
            return jsonify({
                "success": False,
                "message": f"Task not found with ID {task_id}"
            }), 404
        return jsonify({
            "success": True,
            "message": "Task updated successfully",
            "data": task
        }), 200
    except ValueError as val_err:
        return jsonify({
            "success": False,
            "message": str(val_err)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks/<task_id>/status", methods=["PATCH"])
def patch_status(task_id):
    try:
        data = request.get_json() or {}
        new_status = data.get("status")
        if not new_status:
            return jsonify({
                "success": False,
                "message": "Status field is required"
            }), 400

        task = db.patch_task_status(task_id, new_status)
        if not task:
            return jsonify({
                "success": False,
                "message": f"Task not found with ID {task_id}"
            }), 404
        return jsonify({
            "success": True,
            "message": "Task status updated successfully",
            "data": task
        }), 200
    except ValueError as val_err:
        return jsonify({
            "success": False,
            "message": str(val_err)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def remove_task(task_id):
    try:
        success = db.delete_task(task_id)
        if not success:
            return jsonify({
                "success": False,
                "message": f"Task not found with ID {task_id}"
            }), 404
        return jsonify({
            "success": True,
            "message": "Task deleted successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/api/tasks/seed-demo", methods=["POST"])
def reseed_demo():
    try:
        db.reseed_demo_data()
        return jsonify({
            "success": True,
            "message": "Sample tasks reseeded successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "message": "API route not found"}), 404
    return render_template("index.html"), 200

if __name__ == "__main__":
    print(f"[START] TaskFlow Python Server starting on port {PORT}")
    print(f"[URL] Application URL: http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=(NODE_ENV == "development"))

