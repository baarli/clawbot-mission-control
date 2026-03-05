import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layout, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function ActiveTasksCounter() {
  const [tasks, setTasks] = useState({
    backlog: 12,
    research: 5,
    write: 3,
    review: 2,
    done: 28
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching from Kanban
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const total = Object.values(tasks).reduce((a, b) => a + b, 0)
  const active = tasks.research + tasks.write + tasks.review
  const completion = total > 0 ? Math.round((tasks.done / total) * 100) : 0

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-white/10 rounded"></div>
      </div>
    )
  }

  const columns = [
    { id: 'backlog', label: 'Backlog', count: tasks.backlog, color: 'gray' },
    { id: 'research', label: 'Research', count: tasks.research, color: 'cyan' },
    { id: 'write', label: 'Write', count: tasks.write, color: 'violet' },
    { id: 'review', label: 'Review', count: tasks.review, color: 'amber' },
    { id: 'done', label: 'Done', count: tasks.done, color: 'green' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layout size={18} className="text-cyan-neon" />
          <h3 className="text-sm font-semibold text-white">Active Tasks</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono text-cyan-neon">{active}</span>
          <span className="text-xs text-gray-500">aktive</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {columns.map(col => (
          <div key={col.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full 
                              ${col.color === 'gray' ? 'bg-gray-500' :
                                col.color === 'cyan' ? 'bg-cyan-neon' :
                                col.color === 'violet' ? 'bg-violet-neon' :
                                col.color === 'amber' ? 'bg-status-warning' :
                                'bg-status-online'}`} />
              <span className="text-xs text-gray-400 capitalize">{col.label}</span>
            </div>
            
            <span className="text-sm font-mono font-semibold text-white">{col.count}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Fullført</span>
          <span className="text-status-online font-mono">{completion}%</span>
        </div>
        <div className="mt-1 h-1.5 bg-space-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-neon to-status-online"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}
