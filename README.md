# TaskFlow - Full-Stack MySQL Task Management Application

A complete, production-ready **Task Management Web Application** built with **MySQL**, **Express.js**, **React**, and **Node.js** using Vite, Tailwind CSS v4, Lucide icons, and Axios.

---

## 1. Features

- **Dashboard Overview**:
  - Total tasks, pending tasks, in-progress tasks, completed tasks, and overdue tasks.
  - Live completion progress percentage bar with segment breakdown.
  - Priority distribution metrics (High, Medium, Low).
  - Recent tasks overview with one-click status transitions.

- **Task Management (Full CRUD)**:
  - **Create**: Add tasks with title, description, priority (`Low`, `Medium`, `High`), status (`Pending`, `In Progress`, `Completed`), and due date.
  - **View**: Toggle seamlessly between responsive Card Grid view and high-density Table view.
  - **Update**: Modal drawer for editing task details, due dates, priority, or status.
  - **Delete**: Custom accessible confirmation modal before permanently deleting items.
  - **One-Click Complete**: Interactive status toggling with optimistic feedback.

- **Search, Filter & Sort**:
  - Live text search across title and description (`LIKE ?` in MySQL).
  - Filter by status (`All`, `Pending`, `In Progress`, `Completed`).
  - Filter by priority (`All`, `Low`, `Medium`, `High`).
  - Sort by Creation Date, Due Date, Priority, or Title (ascending & descending).
  - Reset filters shortcut and empty states.

- **MySQL Database Architecture**:
  - Direct connection pooling with `mysql2/promise`.
  - Auto-creates the `tasks` relational table on startup with indexing on status, priority, and due dates.
  - Includes `backend/schema.sql` for quick manual table importing or provisioning on MySQL / AWS RDS / PlanetScale / Aiven / Google Cloud SQL.
  - Resilient local fallback engine if MySQL credentials are not provided, ensuring zero-crash uptime in sandboxes.

---

## 2. Project Structure

```
task-management-app/
├── backend/
│   ├── config/
│   │   └── db.js                # MySQL mysql2 connection pool & auto-table migration
│   ├── controllers/
│   │   └── taskController.js    # Parameterized SQL CRUD queries & aggregation
│   ├── models/
│   │   └── Task.js              # Validation & row formatting
│   ├── routes/
│   │   └── taskRoutes.js        # Express REST API endpoints
│   ├── middleware/
│   │   └── errorMiddleware.js   # 404 handler & error response serializer
│   └── schema.sql               # MySQL DDL table definition & starter seeds
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── Sidebar.jsx          # Navigation sidebar with status counters
│   │   ├── StatCard.jsx         # KPI metric card with tabular figures
│   │   ├── TaskCard.jsx         # Card view with unboxed metadata
│   │   ├── TaskTableRow.jsx     # High-density table row view
│   │   ├── TaskForm.jsx         # Create / Edit modal with validation
│   │   ├── TaskFilters.jsx      # Search, filter, and sort controls
│   │   ├── TaskList.jsx         # Grid/Table container with skeletons & empty states
│   │   ├── DeleteConfirmModal.jsx # In-app confirmation dialog
│   │   ├── DatabaseStatusModal.jsx# Database status & reseeding modal
│   │   └── Toast.jsx            # Floating action notification toasts
│   ├── pages/
│   │   ├── Dashboard.jsx        # High-level metrics & recent tasks
│   │   └── Tasks.jsx            # Full task list management
│   ├── services/
│   │   └── taskService.js       # Axios client for REST API endpoints
│   ├── App.jsx                  # Root application layout
│   ├── main.jsx                 # React DOM bootstrap
│   └── index.css                # Tailwind CSS v4 theme & base styles
│
├── server.js                    # Express server mounting API & Vite middlewares
├── .env.example                 # Environment variables specification
└── package.json                 # Dependencies and scripts
```

---

## 3. MySQL Database Setup

### Step 1: Create Database & Tables (Optional — Auto-Created by Default)
You can run the schema file against your MySQL instance:
```bash
mysql -u root -p < backend/schema.sql
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your connection parameters:
```env
# Option 1: URL format
MYSQL_URL="mysql://root:password@localhost:3306/taskflow"

# Option 2: Parameter format
MYSQL_HOST="localhost"
MYSQL_PORT=3306
MYSQL_USER="root"
MYSQL_PASSWORD="your_password"
MYSQL_DATABASE="taskflow"
```

*Note: If MySQL parameters are not provided, the app will run with local fallback storage so you can test immediately without any downtime.*

---

## 4. REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Retrieve tasks with SQL `WHERE` filtering & sorting |
| `GET` | `/api/tasks/stats` | Retrieve aggregate counts with SQL `SUM/COUNT` |
| `GET` | `/api/tasks/:id` | Retrieve single task (`SELECT * FROM tasks WHERE id = ?`) |
| `POST` | `/api/tasks` | Insert new task (`INSERT INTO tasks ...`) |
| `PUT` | `/api/tasks/:id` | Update task (`UPDATE tasks SET ... WHERE id = ?`) |
| `PATCH` | `/api/tasks/:id/status` | Update task status (`UPDATE tasks SET status = ? WHERE id = ?`) |
| `DELETE` | `/api/tasks/:id` | Delete task (`DELETE FROM tasks WHERE id = ?`) |
| `POST` | `/api/tasks/seed-demo` | Restore sample tasks dataset |
| `GET` | `/api/health` | Health check reporting MySQL engine status |

---

## 5. Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```


---

## 6. Docker Deployment

### Run with Docker Compose (App + MySQL Database)
The easiest way to run the entire stack (React frontend, Express backend, and MySQL 8 database with automatic schema initialization) is using Docker Compose:

```bash
docker compose up -d --build
```
Or with npm script:
```bash
npm run docker:up
```

- Application: [http://localhost:3000](http://localhost:3000)
- MySQL Host Port: `localhost:3306`

To shut down the containers:
```bash
docker compose down
```

### Build & Run the Application Container Standalone
To build and run just the application container (which uses the automatic persistent local fallback if no external MySQL is attached):

```bash
# Build Docker image
docker build -t taskflow .

# Run container
docker run -p 3000:3000 taskflow
```


---

## 7. Kubernetes Deployment

The project includes both modular manifests in `k8s/` and a unified [`kubernetes.yaml`](./kubernetes.yaml).

### Architecture
- **Secret (`taskflow-secret`)**: Stores database credentials securely.
- **ConfigMap (`taskflow-config`)**: Stores environment configuration (`NODE_ENV`, `PORT`, `MYSQL_HOST`, etc.).
- **ConfigMap (`mysql-init-script`)**: Supplies the SQL schema and demo seed tasks for automatic database initialization.
- **PersistentVolumeClaim (`mysql-pvc`)**: 5Gi persistent volume for MySQL relational data.
- **MySQL Deployment & Service**: Single-replica stateful MySQL 8 service reachable internally at `mysql:3306`.
- **App Deployment (`taskflow-app`)**: Multi-replica (2 pods) scalable full-stack application with liveness and readiness health probes.
- **App Service (`taskflow-service`)**: Exposes the application on port `80` (mapped to targetPort `3000`) with NodePort `30080` / LoadBalancer.

### Deploy to Kubernetes

1. **Deploy all resources**:
   ```bash
   kubectl apply -f k8s/
   # or
   kubectl apply -f kubernetes.yaml
   ```

2. **Verify pod statuses**:
   ```bash
   kubectl get pods -w
   ```

3. **Check services**:
   ```bash
   kubectl get services
   ```

4. **Access the application**:
   - On Minikube: `minikube service taskflow-service`
   - On Docker Desktop / Kind: [http://localhost:30080](http://localhost:30080) or [http://localhost:80](http://localhost:80)
   - On Cloud (EKS/GKE/AKS): Use the External IP provided by the LoadBalancer service.

5. **Tear down resources**:
   ```bash
   kubectl delete -f k8s/
   # or
   kubectl delete -f kubernetes.yaml
   ```
