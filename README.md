# TaskFlow - Full-Stack MERN Task Management Application

A complete, production-ready **Task Management Web Application** built using the MERN stack (MongoDB, Express.js, React, Node.js) with Vite, Tailwind CSS v4, Lucide icons, and Axios.

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
  - Live text search across title and description.
  - Filter by status (`All`, `Pending`, `In Progress`, `Completed`).
  - Filter by priority (`All`, `Low`, `Medium`, `High`).
  - Sort by Creation Date, Due Date, Priority, or Title (ascending & descending).
  - Reset filters shortcut and empty states.

- **Resilient Full-Stack Architecture**:
  - Full REST API with Express controllers and error handling middleware.
  - Mongoose schema with field validation, indexes, and timestamps.
  - Dual database engine: Connects automatically to **MongoDB Atlas** or **local MongoDB** when `MONGODB_URI` is provided; seamlessly falls back to a persistent JSON storage engine if MongoDB is offline or unconfigured.

---

## 2. Project Structure

```
task-management-app/
├── backend/
│   ├── config/
│   │   └── db.ts                # MongoDB Mongoose connector & resilient fallback
│   ├── controllers/
│   │   └── taskController.ts    # REST API CRUD & stats logic
│   ├── models/
│   │   └── Task.ts              # Mongoose schema, validation & TypeScript types
│   ├── routes/
│   │   └── taskRoutes.ts        # Express REST API endpoints
│   └── middleware/
│       └── errorMiddleware.ts   # 404 handler & error response serializer
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Top navigation bar (Top Bar Contract)
│   │   ├── Sidebar.tsx          # Navigation sidebar with status counters
│   │   ├── StatCard.tsx         # KPI metric card with tabular figures
│   │   ├── TaskCard.tsx         # Card view with unboxed metadata
│   │   ├── TaskTableRow.tsx     # High-density table row view
│   │   ├── TaskForm.tsx         # Create / Edit modal with validation
│   │   ├── TaskFilters.tsx      # Search, filter, and sort controls
│   │   ├── TaskList.tsx         # Grid/Table container with skeletons & empty states
│   │   ├── DeleteConfirmModal.tsx # In-app confirmation dialog
│   │   ├── DatabaseStatusModal.tsx# Database status & reseeding modal
│   │   └── Toast.tsx            # Floating action notification toasts
│   ├── pages/
│   │   ├── Dashboard.tsx        # High-level metrics & recent tasks
│   │   └── TasksPage.tsx        # Full task list management
│   ├── services/
│   │   └── taskService.ts       # Axios client for REST API endpoints
│   ├── types/
│   │   └── task.ts              # Frontend TypeScript definitions
│   ├── App.tsx                  # Root application layout
│   ├── main.tsx                 # React DOM bootstrap
│   └── index.css                # Tailwind CSS v4 theme & base styles
│
├── server.ts                    # Express server mounting API & Vite middlewares
├── .env.example                 # Environment variables specification
└── package.json                 # Dependencies and scripts
```

---

## 3. REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Retrieve all tasks (supports `?status=`, `?priority=`, `?search=`, `?sortBy=`, `?sortOrder=`) |
| `GET` | `/api/tasks/stats` | Retrieve aggregated dashboard counts, completion rates, and priority counts |
| `GET` | `/api/tasks/:id` | Retrieve single task by ID |
| `POST` | `/api/tasks` | Create a new task (`title`, `description`, `priority`, `status`, `dueDate`) |
| `PUT` | `/api/tasks/:id` | Update task details |
| `PATCH` | `/api/tasks/:id/status` | Fast update of task status (`Pending` / `In Progress` / `Completed`) |
| `DELETE` | `/api/tasks/:id` | Permanently delete a task |
| `POST` | `/api/tasks/seed-demo` | Restore initial starter tasks dataset |
| `GET` | `/api/health` | Server and database status health check |

---

## 4. Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

To connect **MongoDB Atlas** (Cloud):
1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free cluster and a database user.
3. In Network Access, whitelist your IP address (or `0.0.0.0/0` for cloud deployment).
4. Copy the connection string and paste it into `.env`:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority"
   ```

*Note: If `MONGODB_URI` is left blank, the application automatically uses the resilient local file storage in `.data/tasks.json`.*

### Step 3: Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### Step 4: Build for Production
```bash
npm run build
npm start
```

---

## 5. Testing API Endpoints

You can test backend endpoints using `curl` or Postman:

- **Get all tasks**:
  ```bash
  curl http://localhost:3000/api/tasks
  ```
- **Create a task**:
  ```bash
  curl -X POST http://localhost:3000/api/tasks \
    -H "Content-Type: application/json" \
    -d '{"title":"Implement Auth","priority":"High","status":"Pending"}'
  ```
- **Update status**:
  ```bash
  curl -X PATCH http://localhost:3000/api/tasks/<TASK_ID>/status \
    -H "Content-Type: application/json" \
    -d '{"status":"Completed"}'
  ```
