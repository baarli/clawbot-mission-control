import React, { useState, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Clock, AlertTriangle, CheckCircle, XCircle,
  Pause, Play, Trash2, RotateCcw, Tag, Calendar,
  ChevronDown, ChevronUp, Filter, Search, Bot,
  Flag, Zap, MoreHorizontal
} from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { format } from 'date-fns'
import clsx from 'clsx'

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  { id: 'pending',     label: 'Pending',     color: '#6b7280', icon: Clock,        tagClass: 'tag-gray' },
  { id: 'planned',     label: 'Planned',     color: '#00d4ff', icon: Calendar,     tagClass: 'tag-cyan' },
  { id: 'in-progress', label: 'In Progress', color: '#7c3aed', icon: Play,         tagClass: 'tag-violet' },
  { id: 'completed',   label: 'Completed',   color: '#00ff88', icon: CheckCircle,  tagClass: 'tag-green' },
  { id: 'failed',      label: 'Failed',      color: '#ff3366', icon: XCircle,      tagClass: 'tag-red' },
  { id: 'aborted',     label: 'Aborted',     color: '#ffaa00', icon: Pause,        tagClass: 'tag-amber' },
]

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'text-status-danger', bg: 'bg-status-danger/10', border: 'border-status-danger/30', dot: '#ff3366' },
  high:     { label: 'High',     color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30', dot: '#ffaa00' },
  medium:   { label: 'Medium',   color: 'text-cyan-neon',      bg: 'bg-cyan-neon/10',      border: 'border-cyan-neon/30',      dot: '#00d4ff' },
  low:      { label: 'Low',      color: 'text-gray-400',       bg: 'bg-gray-700/20',       border: 'border-gray-700/40',       dot: '#6b7280' },
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, index }) {
  const [expanded, setExpanded] = useState(false)
  const updateTask = useRobotStore((s) => s.updateTask)
  const removeTask = useRobotStore((s) => s.removeTask)
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx(
            'glass-card rounded-card mb-2 border transition-all duration-150 cursor-grab active:cursor-grabbing',
            snapshot.isDragging
              ? 'border-cyan-neon/50 shadow-neon-cyan rotate-[1deg]'
              : 'border-white/6 hover:border-white/12'
          )}
        >
          <div className="p-3">
            {/* Top row */}
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white leading-tight">{task.title}</p>
                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{task.command}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: priority.dot }} />
                <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-gray-600 hover:text-white">
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-2">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/6 text-gray-500 border border-white/8">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Bot size={9} className="text-gray-600" />
                <span className="text-[9px] text-gray-600">{task.assignee || 'unassigned'}</span>
              </div>
              <span className="text-[9px] text-gray-600 font-mono">
                {format(new Date(task.created_at), 'MMM d HH:mm')}
              </span>
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-white/6"
              >
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">Priority</span>
                    <span className={clsx('text-[10px] font-medium', priority.color)}>{priority.label}</span>
                  </div>
                  {task.estimated_duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500">Est. Duration</span>
                      <span className="text-[10px] font-mono text-gray-300">{task.estimated_duration}s</span>
                    </div>
                  )}
                  {task.error && (
                    <div className="p-2 rounded bg-status-danger/10 border border-status-danger/20">
                      <p className="text-[10px] text-status-danger">{task.error}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    {task.status === 'failed' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'pending', error: null })}
                        className="flex-1 btn-cyber py-1 text-[10px] flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={9} /> Retry
                      </button>
                    )}
                    <button
                      onClick={() => removeTask(task.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gray-600 hover:text-status-danger hover:bg-status-danger/10 border border-transparent hover:border-status-danger/20 transition-all"
                    >
                      <Trash2 size={9} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  )
}

// ─── Column ────────────────────────────────────────────────────────────────
function KanbanColumn({ column, tasks }) {
  const Icon = column.icon

  return (
    <div className="flex flex-col min-w-[200px] max-w-[240px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-4 rounded-full" style={{ background: column.color }} />
        <Icon size={12} style={{ color: column.color }} />
        <span className="text-xs font-semibold text-white">{column.label}</span>
        <span
          className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${column.color}20`, color: column.color, border: `1px solid ${column.color}30` }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              'flex-1 min-h-[80px] rounded-xl p-2 transition-all duration-150',
              snapshot.isDraggingOver
                ? 'bg-cyan-neon/5 border border-cyan-neon/20'
                : 'bg-white/2 border border-white/5'
            )}
          >
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-8 h-8 rounded-full bg-white/3 flex items-center justify-center mb-2">
                  <Icon size={14} className="text-gray-700" />
                </div>
                <p className="text-[10px] text-gray-700">No tasks</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

// ─── New Task Modal ────────────────────────────────────────────────────────────
function NewTaskModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: '',
    command: 'MOVE_FORWARD',
    priority: 'medium',
    tags: '',
    status: 'pending',
    assignee: 'auto',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      id: `task-${Date.now()}`,
      robot_id: 'robot-001',
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="panel p-6 rounded-panel max-w-sm w-full mx-4 border border-cyan-neon/20"
      >
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={16} className="text-cyan-neon" /> New Task
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Task Title', key: 'title', type: 'text', placeholder: 'Pick up object from Station A' },
            { label: 'Command', key: 'command', type: 'text', placeholder: 'PICK_OBJECT' },
            { label: 'Tags (comma-separated)', key: 'tags', type: 'text', placeholder: 'pickup, lab, priority' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="input-cyber w-full" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="input-cyber w-full">
                {Object.keys(PRIORITY_CONFIG).map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Assignee</label>
              <select value={form.assignee} onChange={(e) => set('assignee', e.target.value)} className="input-cyber w-full">
                {['auto', 'operator', 'scheduled'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 btn-cyber">Cancel</button>
          <button onClick={handleSave} className="flex-1 btn-cyber-primary">Create Task</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function TaskBoard() {
  const [showNewTask, setShowNewTask] = useState(false)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const tasks = useRobotStore((s) => s.tasks)
  const updateTask = useRobotStore((s) => s.updateTask)
  const addTask = useRobotStore((s) => s.addTask)

  const filteredTasks = useMemo(() =>
    tasks.filter((t) => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.command?.toLowerCase().includes(search.toLowerCase())
      const matchPriority = !filterPriority || t.priority === filterPriority
      return matchSearch && matchPriority
    }), [tasks, search, filterPriority])

  const tasksByColumn = useMemo(() => {
    const map = {}
    COLUMNS.forEach((col) => {
      map[col.id] = filteredTasks.filter((t) => t.status === col.id)
    })
    return map
  }, [filteredTasks])

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    updateTask(draggableId, { status: destination.droppableId })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input-cyber w-full pl-8 text-xs py-1.5"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input-cyber text-xs py-1.5 w-32"
        >
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-[11px] text-gray-500 ml-auto">
          <span>{tasks.length} total</span>
          <span>·</span>
          <span className="text-status-online">{tasksByColumn['in-progress']?.length || 0} active</span>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="btn-cyber-primary flex items-center gap-1.5 py-1.5"
        >
          <Plus size={13} /> New Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id] || []}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Stats footer */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5 flex-shrink-0">
        {COLUMNS.map((col) => {
          const count = tasksByColumn[col.id]?.length || 0
          return (
            <div key={col.id} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
              <span className="text-[10px] text-gray-500">{col.label}:</span>
              <span className="text-[10px] font-mono font-medium text-white">{count}</span>
            </div>
          )
        })}
      </div>

      {/* New task modal */}
      <AnimatePresence>
        {showNewTask && (
          <NewTaskModal onClose={() => setShowNewTask(false)} onSave={addTask} />
        )}
      </AnimatePresence>
    </div>
  )
}
