/**
 * Task Model for MySQL
 * Defines schema defaults, validation, and serialization.
 */

export const TaskValidation = {
  validPriorities: ['Low', 'Medium', 'High'],
  validStatuses: ['Pending', 'In Progress', 'Completed'],

  validate(data) {
    const errors = [];
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Task title is required and cannot be empty');
    }

    if (data.priority && !this.validPriorities.includes(data.priority)) {
      errors.push(`Invalid priority: ${data.priority}. Allowed: Low, Medium, High`);
    }

    if (data.status && !this.validStatuses.includes(data.status)) {
      errors.push(`Invalid status: ${data.status}. Allowed: Pending, In Progress, Completed`);
    }

    if (data.dueDate) {
      const d = new Date(data.dueDate);
      if (isNaN(d.getTime())) {
        errors.push('Invalid due date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      priority: row.priority || 'Medium',
      status: row.status || 'Pending',
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString() : null,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    };
  },
};

export default TaskValidation;
