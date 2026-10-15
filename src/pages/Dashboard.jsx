import React from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Layers,
} from 'lucide-react';
import { StatCard } from '../components/StatCard.jsx';
import { TaskCard } from '../components/TaskCard.jsx';

export const Dashboard = ({
  stats,
  recentTasks,
  isLoading,
  onNavigateToTasks,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
}) => {
  const total = stats?.totalTasks || 0;
  const completed = stats?.completedTasks || 0;
  const inProgress = stats?.inProgressTasks || 0;
  const pending = stats?.pendingTasks || 0;
  const overdue = stats?.overdueTasks || 0;
  const completionRate = stats?.completionRate || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/90">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Task Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of project progress, deadlines, and task completion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Overdue Warning Callout */}
      {overdue > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-900">
                {overdue} {overdue === 1 ? 'task is' : 'tasks are'} past due date
              </p>
              <p className="text-xs text-rose-700">
                Review overdue items to update schedules or complete pending work.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTasks('Pending')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2 shrink-0"
          >
            Review Overdue &rarr;
          </button>
        </div>
      )}

      {/* Primary KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={total}
          subtitle="All recorded items"
          icon={ListTodo}
          variant="blue"
          onClick={() => onNavigateToTasks('All')}
        />
        <StatCard
          label="Pending Tasks"
          value={pending}
          subtitle="Awaiting kickoff"
          icon={Clock}
          variant="slate"
          onClick={() => onNavigateToTasks('Pending')}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          subtitle="Currently active"
          icon={Layers}
          variant="amber"
          onClick={() => onNavigateToTasks('In Progress')}
        />
        <StatCard
          label="Completed Tasks"
          value={completed}
          subtitle={`${completionRate}% overall rate`}
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => onNavigateToTasks('Completed')}
        />
      </div>

      {/* Completion & Breakdown Analytics Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Completion Progress
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current ratio of completed milestones against total task volume
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {completionRate}%
            </span>
          </div>

          {/* Clean Segmented Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${completionRate}%` }}
                className="bg-emerald-500 transition-all duration-500 rounded-l-full"
                title={`Completed: ${completed}`}
              />
              <div
                style={{
                  width: `${
                    total > 0 ? Math.round((inProgress / total) * 100) : 0
                  }%`,
                }}
                className="bg-blue-500 transition-all duration-500"
                title={`In Progress: ${inProgress}`}
              />
              <div
                style={{
                  width: `${
                    total > 0 ? Math.round((pending / total) * 100) : 0
                  }%`,
                }}
                className="bg-slate-300 transition-all duration-500 rounded-r-full"
                title={`Pending: ${pending}`}
              />
            </div>

            {/* Zero-pill unboxed legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed ({completed})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>In Progress ({inProgress})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Pending ({pending})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Priority Balance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown by criticality
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-600 font-medium">High Priority</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                    {stats?.priorityBreakdown?.high || 0}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        total > 0
                          ? Math.round(((stats?.priorityBreakdown?.high || 0) / total) * 100)
                          : 0
                      }%`,
                    }}
                    className="h-full bg-rose-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-600 font-medium">Medium Priority</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                    {stats?.priorityBreakdown?.medium || 0}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        total > 0
                          ? Math.round(((stats?.priorityBreakdown?.medium || 0) / total) * 100)
                          : 0
                      }%`,
                    }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Low Priority</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                    {stats?.priorityBreakdown?.low || 0}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        total > 0
                          ? Math.round(((stats?.priorityBreakdown?.low || 0) / total) * 100)
                          : 0
                      }%`,
                    }}
                    className="h-full bg-slate-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Tasks
            </h2>
            <p className="text-xs text-slate-500">
              Latest items created or updated across all projects
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTasks('All')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View All ({total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500 mb-3">No tasks found yet.</p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create your first task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTasks.slice(0, 6).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
