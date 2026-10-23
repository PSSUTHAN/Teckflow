# TeckFlow - Full-Stack Python, MySQL, HTML, CSS & JavaScript Task Management Application

A complete, production-ready **Task Management Web Application** built with **Python 3 (Flask)**, **MySQL**, **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 1. Technology Stack

- **Backend**: Python 3.12+ (Flask, PyMySQL / mysqlclient, Gunicorn WSGI)
- **Database**: MySQL 8.0 (with automatic resilient local JSON document fallback)
- **Frontend**: Semantic HTML5, Modern CSS3 (Variables, Flexbox, Grid), Native Vanilla JavaScript (ES Modules, Async Fetch API)
- **Containerization & Orchestration**: Docker, Docker Compose, Kubernetes

---

## 2. Key Features

- **Dashboard Analytics**:
  - Live KPI stat cards: Total Tasks, Completed, In Progress, Overdue.
  - Dynamic completion rate progress bar with status segment legend.
  - Priority distribution metrics (High, Medium, Low) with visual indicator bars.
  - Recent tasks overview with one-click status transitions.

- **Full Task Management (CRUD)**:
  - **Create**: Add tasks with title, description, priority (`Low`, `Medium`, `High`), status (`Pending`, `In Progress`, `Completed`), and due date.
  - **View**: Toggle seamlessly between responsive Card Grid view and high-density Table view.
  - **Update**: Modal dialog for editing task attributes, due dates, priority, or status.
  - **Delete**: Custom accessible confirmation modal before permanently deleting items.
  - **One-Click Complete**: Interactive status toggling with optimistic feedback.

- **Search, Filter & Sort**:
  - Live text search across title and description (`LIKE ?` in MySQL).
  - Filter by status tabs (`All`, `Pending`, `In Progress`, `Completed`).
  - Filter by priority dropdown (`All`, `Low`, `Medium`, `High`).
  - Sort by Creation Date, Due Date, Priority, or Title (ascending & descending).
  - Reset filters shortcut and empty states.

- **Dual-Engine Resilient Database Architecture**:
  - Direct connection to MySQL with parameterized SQL execution and automatic table migration.
  - Includes `schema.sql` for instant database table and seed data provisioning.
  - Automatic fallback to persistent local JSON storage (`.data/tasks.json`) if MySQL is offline or not configured.

---

## 3. Project Structure

```
Teckflow/
├── app.py                   # Main Flask REST API & Web Server
├── db.py                    # MySQL connection pooling & fallback JSON storage
├── schema.sql               # MySQL relational schema & initial seed data
├── requirements.txt         # Python dependencies (Flask, mysqlclient, gunicorn, etc.)
├── templates/
│   └── index.html           # HTML5 semantic application template
├── static/
│   ├── css/
│   │   └── style.css        # Modern, responsive CSS design system
│   └── js/
│       └── app.js           # Client application logic (Vanilla JS)
├── Dockerfile               # Production multi-stage Python container
├── docker-compose.yml       # Flask app + MySQL 8.0 stack
├── kubernetes.yaml          # All-in-one Kubernetes deployment manifest
├── k8s/                     # Modular Kubernetes manifests
│   ├── app.yaml
│   ├── configmap.yaml
│   ├── mysql.yaml
│   └── secret.yaml
├── .env                     # Environment variables
└── .env.example
```

---

## 4. REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Retrieve tasks with SQL `WHERE` filtering & sorting |
| `GET` | `/api/tasks/stats` | Retrieve aggregate counts with SQL `SUM/COUNT` |
| `GET` | `/api/tasks/<id>` | Retrieve single task (`SELECT * FROM tasks WHERE id = ?`) |
| `POST` | `/api/tasks` | Insert new task (`INSERT INTO tasks ...`) |
| `PUT` | `/api/tasks/<id>` | Update task (`UPDATE tasks SET ... WHERE id = ?`) |
| `PATCH` | `/api/tasks/<id>/status` | Update task status (`UPDATE tasks SET status = ? WHERE id = ?`) |
| `DELETE` | `/api/tasks/<id>` | Delete task (`DELETE FROM tasks WHERE id = ?`) |
| `POST` | `/api/tasks/seed-demo` | Restore sample tasks dataset |
| `GET` | `/api/health` | Health check reporting MySQL engine status |
| `GET` | `/api/db-status` | Detailed database connection parameters |

---

## 5. Running the Application Locally

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start the Python Server
```bash
python app.py
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 6. Docker Deployment

### Run with Docker Compose (Flask + MySQL)
```bash
docker compose up -d --build
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- MySQL Host Port: `localhost:3306`

To shut down:
```bash
docker compose down
```

---

## 7. Kubernetes Deployment

```bash
# Deploy all resources
kubectl apply -f kubernetes.yaml

# Check running pods
kubectl get pods -w

# Check services
kubectl get services
```
