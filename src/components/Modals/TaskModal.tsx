import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Priority, TaskStatus } from '../../types';
import { FiX, FiCheck, FiClock, FiCalendar, FiTarget, FiTag } from 'react-icons/fi';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    editingTask,
    closeTaskModal,
    createTask,
    updateTask,
    missions,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [missionId, setMissionId] = useState<string>('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [dueDate, setDueDate] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setNotes(editingTask.notes || '');
      setPriority(editingTask.priority || 'medium');
      setStatus(editingTask.status || 'not_started');
      setMissionId(editingTask.mission_id || '');
      setEstimatedMinutes(editingTask.estimated_minutes || 30);
      setDueDate(editingTask.due_date || '');
      setScheduledDate(editingTask.scheduled_date || new Date().toISOString().split('T')[0]);
      setTagsInput(editingTask.tags ? editingTask.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setNotes('');
      setPriority('medium');
      setStatus('not_started');
      setMissionId(missions[0]?.id || '');
      setEstimatedMinutes(30);
      setDueDate('');
      setScheduledDate(new Date().toISOString().split('T')[0]);
      setTagsInput('');
    }
  }, [editingTask, isTaskModalOpen, missions]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    if (editingTask && editingTask.id) {
      await updateTask({
        ...editingTask,
        title,
        description,
        notes,
        priority,
        status,
        mission_id: missionId || null,
        estimated_minutes: Number(estimatedMinutes) || 30,
        due_date: dueDate || null,
        scheduled_date: scheduledDate || null,
        tags,
      });
    } else {
      await createTask({
        title,
        description,
        notes,
        priority,
        status,
        mission_id: missionId || null,
        estimated_minutes: Number(estimatedMinutes) || 30,
        due_date: dueDate || null,
        scheduled_date: scheduledDate || null,
        tags,
      });
    }

    closeTaskModal();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-2xl border border-white/15 w-full max-w-lg bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <span>{editingTask && editingTask.id ? 'Edit Task' : 'Create Task'}</span>
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="What needs to be accomplished?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mission</label>
              <select
                value={missionId}
                onChange={(e) => setMissionId(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-100"
              >
                <option value="">No Mission (General)</option>
                {missions.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-100"
              >
                <option value="high">High (Red)</option>
                <option value="medium">Medium (Yellow)</option>
                <option value="low">Low (Green)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief details or key criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Minutes</label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Schedule Today?</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="java, ai, portfolio, review"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5"
            >
              <FiCheck className="w-4 h-4" />
              <span>{editingTask && editingTask.id ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
