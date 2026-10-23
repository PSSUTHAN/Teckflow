import os
import json
import uuid
from datetime import datetime, date, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

# Global database status
db_state = {
    "isConnectedToMySQL": False,
    "engine": "file_storage",
    "connectionHost": "",
    "databaseName": "",
    "errorMessage": None
}

STORAGE_DIR = os.path.join(os.getcwd(), ".data")
STORAGE_FILE = os.path.join(STORAGE_DIR, "tasks.json")

INITIAL_SEED_TASKS = [
    {
        "id": "task-seed-1",
        "title": "Initialize MySQL Schema & Tables",
        "description": "Set up relational tables with indexing on status, priority, and dates.",
        "priority": "High",
        "status": "Completed",
        "dueDate": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
        "createdAt": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
        "updatedAt": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    },
    {
        "id": "task-seed-2",
        "title": "Build Python Flask REST API & DB Pool",
        "description": "Configure MySQL connection pool with parameterized SQL query execution.",
        "priority": "High",
        "status": "In Progress",
        "dueDate": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        "createdAt": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        "updatedAt": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat()
    },
    {
        "id": "task-seed-3",
        "title": "Design Responsive Dashboard UI (HTML5/CSS3/JS)",
        "description": "Implement KPI stat cards, completion rates, priority distribution, and clean tabular layout.",
        "priority": "Medium",
        "status": "In Progress",
        "dueDate": (datetime.now(timezone.utc) + timedelta(days=4)).isoformat(),
        "createdAt": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
        "updatedAt": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
    },
    {
        "id": "task-seed-4",
        "title": "Conduct End-to-End API and Validation Testing",
        "description": "Verify status code responses, missing title rejections, sorting algorithms, and filter states.",
        "priority": "Medium",
        "status": "Pending",
        "dueDate": (datetime.now(timezone.utc) + timedelta(days=6)).isoformat(),
        "createdAt": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
        "updatedAt": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
    },
    {
        "id": "task-seed-5",
        "title": "Review Overdue Project Milestones",
        "description": "Audit tasks past their expected delivery date and adjust resource allocations accordingly.",
        "priority": "High",
        "status": "Pending",
        "dueDate": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        "createdAt": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
        "updatedAt": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    },
    {
        "id": "task-seed-6",
        "title": "Prepare Production Docker & Kubernetes Deployment",
        "description": "Configure multi-stage Docker container and Kubernetes manifests for Python Flask and MySQL.",
        "priority": "Low",
        "status": "Pending",
        "dueDate": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
        "createdAt": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
        "updatedAt": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    }
]

# -------------------------------------------------------------
# Local Storage Fallback Helpers
# -------------------------------------------------------------
def read_fallback_storage():
    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        if not os.path.exists(STORAGE_FILE):
            write_fallback_storage(INITIAL_SEED_TASKS)
            return INITIAL_SEED_TASKS
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else INITIAL_SEED_TASKS
    except Exception as e:
        print(f"Error reading fallback storage: {e}")
        return INITIAL_SEED_TASKS

def write_fallback_storage(tasks):
    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(tasks, f, indent=2, default=str)
        return True
    except Exception as e:
        print(f"Error writing fallback storage: {e}")
        return False

# -------------------------------------------------------------
# MySQL Connection Management
# -------------------------------------------------------------
def get_mysql_connection():
    if not db_state["isConnectedToMySQL"]:
        return None

    try:
        import MySQLdb
        import MySQLdb.cursors
        
        host = os.getenv("MYSQL_HOST", "localhost")
        port = int(os.getenv("MYSQL_PORT", 3306))
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "taskflow")

        conn = MySQLdb.connect(
            host=host,
            port=port,
            user=user,
            passwd=password,
            db=database,
            charset="utf8mb4",
            cursorclass=MySQLdb.cursors.DictCursor,
            connect_timeout=5
        )
        return conn
    except Exception as e:
        print(f"MySQL connection attempt failed: {e}")
        return None

def init_db():
    host = os.getenv("MYSQL_HOST")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "taskflow")
    port = int(os.getenv("MYSQL_PORT", 3306))

    if not host:
        print("[INFO] MySQL configuration not found in environment. Using local persistent storage.")
        db_state["isConnectedToMySQL"] = False
        db_state["engine"] = "file_storage"
        db_state["connectionHost"] = "Local Persistent Storage (.data/tasks.json)"
        read_fallback_storage()
        return

    try:
        import MySQLdb
        print(f"Connecting to MySQL at {host}:{port}...")
        
        # Connect to MySQL server (without specifying DB first to ensure DB exists)
        conn = MySQLdb.connect(
            host=host,
            port=port,
            user=user,
            passwd=password,
            charset="utf8mb4",
            connect_timeout=5
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.select_db(database)

        # Create tasks table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
              id VARCHAR(64) PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
              status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
              dueDate DATETIME NULL,
              createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_status (status),
              INDEX idx_priority (priority),
              INDEX idx_due_date (dueDate),
              INDEX idx_created_at (createdAt)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Check if table is empty; if so, populate initial seed data
        cursor.execute("SELECT COUNT(*) FROM tasks;")
        count = cursor.fetchone()[0]
        if count == 0:
            for task in INITIAL_SEED_TASKS:
                due_val = task.get("dueDate")
                if due_val:
                    try:
                        due_val = datetime.fromisoformat(due_val.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M:%S")
                    except Exception:
                        pass
                cursor.execute("""
                    INSERT IGNORE INTO tasks (id, title, description, priority, status, dueDate)
                    VALUES (%s, %s, %s, %s, %s, %s);
                """, (task["id"], task["title"], task["description"], task["priority"], task["status"], due_val))
            conn.commit()

        cursor.close()
        conn.close()

        db_state["isConnectedToMySQL"] = True
        db_state["engine"] = "mysql"
        db_state["connectionHost"] = f"{host}:{port}"
        db_state["databaseName"] = database
        db_state["errorMessage"] = None
        print(f"[SUCCESS] Connected to MySQL database '{database}'.")
    except Exception as e:
        print(f"[WARNING] MySQL Connection Warning: {e}")
        print("[INFO] Falling back to persistent local storage (.data/tasks.json) so application remains fully operational.")
        db_state["isConnectedToMySQL"] = False
        db_state["engine"] = "file_storage"
        db_state["connectionHost"] = "Local Persistent Storage (.data/tasks.json)"
        db_state["databaseName"] = database
        db_state["errorMessage"] = str(e)
        read_fallback_storage()

def get_db_status():
    return db_state

# -------------------------------------------------------------
# Data Access Layer (CRUD)
# -------------------------------------------------------------
def format_task(task):
    if not task:
        return None
    # Ensure id field is present
    t = dict(task)
    if "_id" in t and "id" not in t:
        t["id"] = str(t["_id"])
    
    # Format datetimes to ISO string
    for k in ["dueDate", "createdAt", "updatedAt"]:
        if isinstance(t.get(k), (datetime, date)):
            t[k] = t[k].isoformat()
    return t

def get_tasks(status=None, priority=None, search=None, sort_by="createdAt", sort_order="desc"):
    valid_sort_fields = {"title": "title", "priority": "priority", "status": "status", "dueDate": "dueDate", "createdAt": "createdAt"}
    sort_column = valid_sort_fields.get(sort_by, "createdAt")
    order_direction = "DESC" if str(sort_order).lower() == "desc" else "ASC"

    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM tasks WHERE 1=1"
            params = []

            if status and status != "All":
                query += " AND status = %s"
                params.append(status)

            if priority and priority != "All":
                query += " AND priority = %s"
                params.append(priority)

            if search and search.strip():
                query += " AND (title LIKE %s OR description LIKE %s)"
                term = f"%{search.strip()}%"
                params.extend([term, term])

            query += f" ORDER BY {sort_column} {order_direction}"
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return [format_task(r) for r in rows]
        except Exception as e:
            print(f"MySQL query error, using fallback: {e}")

    # Fallback to local file storage
    tasks = read_fallback_storage()
    filtered = []
    search_term = (search or "").strip().lower()

    for t in tasks:
        if status and status != "All" and t.get("status") != status:
            continue
        if priority and priority != "All" and t.get("priority") != priority:
            continue
        if search_term:
            title = (t.get("title") or "").lower()
            desc = (t.get("description") or "").lower()
            if search_term not in title and search_term not in desc:
                continue
        filtered.append(t)

    # Sort
    reverse = (order_direction == "DESC")
    def sort_key(item):
        val = item.get(sort_column)
        if val is None:
            return ""
        return str(val).lower()

    filtered.sort(key=sort_key, reverse=reverse)
    return [format_task(t) for t in filtered]

def get_task_by_id(task_id):
    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = %s LIMIT 1", (task_id,))
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            return format_task(row)
        except Exception as e:
            print(f"MySQL get_task error: {e}")

    tasks = read_fallback_storage()
    for t in tasks:
        if t.get("id") == task_id:
            return format_task(t)
    return None

def create_task(data):
    task_id = "task-" + uuid.uuid4().hex[:10]
    now_iso = datetime.now(timezone.utc).isoformat()
    title = (data.get("title") or "").strip()
    if not title:
        raise ValueError("Task title is required.")

    description = (data.get("description") or "").strip()
    priority = data.get("priority", "Medium")
    if priority not in ["Low", "Medium", "High"]:
        priority = "Medium"

    status = data.get("status", "Pending")
    if status not in ["Pending", "In Progress", "Completed"]:
        status = "Pending"

    due_date = data.get("dueDate") or None
    if due_date and due_date.strip() == "":
        due_date = None

    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            due_val = None
            if due_date:
                try:
                    due_val = datetime.fromisoformat(due_date.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M:%S")
                except Exception:
                    due_val = due_date
            cursor.execute("""
                INSERT INTO tasks (id, title, description, priority, status, dueDate)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (task_id, title, description, priority, status, due_val))
            conn.commit()
            cursor.close()
            conn.close()
            return get_task_by_id(task_id)
        except Exception as e:
            print(f"MySQL insert error: {e}")

    new_task = {
        "id": task_id,
        "title": title,
        "description": description,
        "priority": priority,
        "status": status,
        "dueDate": due_date,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }
    tasks = read_fallback_storage()
    tasks.insert(0, new_task)
    write_fallback_storage(tasks)
    return new_task

def update_task(task_id, data):
    title = (data.get("title") or "").strip()
    if not title:
        raise ValueError("Task title is required.")

    description = (data.get("description") or "").strip()
    priority = data.get("priority", "Medium")
    status = data.get("status", "Pending")
    due_date = data.get("dueDate") or None
    if due_date and due_date.strip() == "":
        due_date = None

    now_iso = datetime.now(timezone.utc).isoformat()

    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            due_val = None
            if due_date:
                try:
                    due_val = datetime.fromisoformat(due_date.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M:%S")
                except Exception:
                    due_val = due_date

            cursor.execute("""
                UPDATE tasks
                SET title = %s, description = %s, priority = %s, status = %s, dueDate = %s, updatedAt = NOW()
                WHERE id = %s
            """, (title, description, priority, status, due_val, task_id))
            conn.commit()
            cursor.close()
            conn.close()
            return get_task_by_id(task_id)
        except Exception as e:
            print(f"MySQL update error: {e}")

    tasks = read_fallback_storage()
    updated = None
    for i, t in enumerate(tasks):
        if t.get("id") == task_id:
            tasks[i]["title"] = title
            tasks[i]["description"] = description
            tasks[i]["priority"] = priority
            tasks[i]["status"] = status
            tasks[i]["dueDate"] = due_date
            tasks[i]["updatedAt"] = now_iso
            updated = tasks[i]
            break
    if updated:
        write_fallback_storage(tasks)
    return updated

def patch_task_status(task_id, new_status):
    if new_status not in ["Pending", "In Progress", "Completed"]:
        raise ValueError("Invalid status value.")

    now_iso = datetime.now(timezone.utc).isoformat()

    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE tasks SET status = %s, updatedAt = NOW() WHERE id = %s
            """, (new_status, task_id))
            conn.commit()
            cursor.close()
            conn.close()
            return get_task_by_id(task_id)
        except Exception as e:
            print(f"MySQL patch status error: {e}")

    tasks = read_fallback_storage()
    updated = None
    for i, t in enumerate(tasks):
        if t.get("id") == task_id:
            tasks[i]["status"] = new_status
            tasks[i]["updatedAt"] = now_iso
            updated = tasks[i]
            break
    if updated:
        write_fallback_storage(tasks)
    return updated

def delete_task(task_id):
    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
            affected = cursor.rowcount
            conn.commit()
            cursor.close()
            conn.close()
            return affected > 0
        except Exception as e:
            print(f"MySQL delete error: {e}")

    tasks = read_fallback_storage()
    initial_len = len(tasks)
    tasks = [t for t in tasks if t.get("id") != task_id]
    if len(tasks) < initial_len:
        write_fallback_storage(tasks)
        return True
    return False

def get_stats():
    tasks = get_tasks()
    total = len(tasks)
    pending = 0
    in_progress = 0
    completed = 0
    overdue = 0
    high_priority = 0
    medium_priority = 0
    low_priority = 0

    now = datetime.now(timezone.utc)

    for t in tasks:
        st = t.get("status")
        if st == "Completed":
            completed += 1
        elif st == "In Progress":
            in_progress += 1
        else:
            pending += 1

        pr = t.get("priority")
        if pr == "High":
            high_priority += 1
        elif pr == "Low":
            low_priority += 1
        else:
            medium_priority += 1

        due = t.get("dueDate")
        if due and st != "Completed":
            try:
                # Parse ISO date
                due_dt = datetime.fromisoformat(due.replace("Z", "+00:00"))
                if due_dt.tzinfo is None:
                    due_dt = due_dt.replace(tzinfo=timezone.utc)
                if due_dt < now:
                    overdue += 1
            except Exception:
                pass

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0

    return {
        "total": total,
        "pending": pending,
        "inProgress": in_progress,
        "completed": completed,
        "overdue": overdue,
        "completionRate": completion_rate,
        "priorityBreakdown": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        }
    }

def reseed_demo_data():
    conn = get_mysql_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("TRUNCATE TABLE tasks;")
            for task in INITIAL_SEED_TASKS:
                due_val = task.get("dueDate")
                if due_val:
                    try:
                        due_val = datetime.fromisoformat(due_val.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M:%S")
                    except Exception:
                        pass
                cursor.execute("""
                    INSERT INTO tasks (id, title, description, priority, status, dueDate)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (task["id"], task["title"], task["description"], task["priority"], task["status"], due_val))
            conn.commit()
            cursor.close()
            conn.close()
            return True
        except Exception as e:
            print(f"MySQL reseed error: {e}")

    write_fallback_storage(INITIAL_SEED_TASKS)
    return True
