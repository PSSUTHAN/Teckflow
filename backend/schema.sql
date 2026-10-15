-- TaskFlow MySQL Schema
CREATE DATABASE IF NOT EXISTS taskflow;
USE taskflow;

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

-- Sample Seed Data
INSERT IGNORE INTO tasks (id, title, description, priority, status, dueDate, createdAt, updatedAt) VALUES
('task-seed-1', 'Initialize MySQL Schema & Tables', 'Create relational tasks table with indexing on priority and status.', 'High', 'Completed', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY),
('task-seed-2', 'Build Express MySQL Connection Pool', 'Configure mysql2 connection pool with parameterized query execution.', 'High', 'In Progress', NOW() + INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 12 HOUR),
('task-seed-3', 'Design Responsive Dashboard UI', 'Implement KPI stat cards, completion rates, and priority breakdown.', 'Medium', 'In Progress', NOW() + INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 30 MINUTE),
('task-seed-4', 'Conduct End-to-End API and Validation Testing', 'Verify status code responses, missing title rejections, and sorting.', 'Medium', 'Pending', NOW() + INTERVAL 6 DAY, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR),
('task-seed-5', 'Review Overdue Project Milestones', 'Audit tasks past their expected delivery date and reallocate resources.', 'High', 'Pending', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY),
('task-seed-6', 'Prepare Production Deployment Checklist', 'Configure environment variables and secure database credentials.', 'Low', 'Pending', NOW() + INTERVAL 10 DAY, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR);
