import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw, X, Server, Copy, Check } from 'lucide-react';
import { taskService } from '../services/taskService';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus?: {
    isConnectedToMongo: boolean;
    engine: 'mongodb' | 'file_storage';
    connectionUri: string;
    databaseName?: string;
  };
  onReseedCompleted: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onReseedCompleted,
}) => {
  const [isReseeding, setIsReseeding] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isMongo = dbStatus?.isConnectedToMongo;

  const handleReseed = async () => {
    try {
      setIsReseeding(true);
      await taskService.seedDemoTasks();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 2500);
      onReseedCompleted();
    } catch (err) {
      console.error('Failed to reseed:', err);
    } finally {
      setIsReseeding(false);
    }
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText('MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Database & Architecture Info
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Engine Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Storage Engine
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  isMongo ? 'text-emerald-700' : 'text-blue-700'
                }`}
              >
                {isMongo ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Server className="w-4 h-4 text-blue-600" />
                )}
                {isMongo ? 'MongoDB Connected' : 'Resilient Persistent Storage'}
              </span>
            </div>

            <p className="text-sm font-mono text-slate-700 break-all bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
              {dbStatus?.connectionUri || 'Local Persistent Storage (.data/tasks.json)'}
            </p>

            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              {isMongo
                ? `Connected to database: ${dbStatus?.databaseName || 'taskflow'}`
                : 'All CRUD operations persist safely to local storage on the server. To connect MongoDB Atlas, provide MONGODB_URI in your environment.'}
            </p>
          </div>

          {/* MongoDB Connection Helper */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Connecting MongoDB Atlas (Optional)
            </label>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add your connection string in the Secrets or <code className="text-blue-700 font-mono">.env</code>:
            </p>
            <div className="flex items-center gap-2 bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs font-mono">
              <span className="truncate flex-1">
                MONGODB_URI="mongodb+srv://..."
              </span>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy template"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Seed / Reset Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">Demo Dataset</p>
              <p className="text-xs text-slate-500">Restore default demo tasks with various priorities</p>
            </div>
            <button
              type="button"
              onClick={handleReseed}
              disabled={isReseeding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
              {reseedSuccess ? 'Reseeded!' : 'Reseed Demo Tasks'}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
