import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, CheckCircle, AlertCircle, Clock,
  MessageCircle, Mic, User, Bot, Brain, TrendingUp, BookOpen,
  Layout, CheckCircle2, Github, RefreshCw, Sun, Calendar, ChevronLeft, ChevronRight,
  ExternalLink, Tag, Newspaper
} from 'lucide-react'

// ============================================
// WIDGET 1: VevStatusCard (INLINE)
// ============================================
function VevStatusCard() {
  const [status, setStatus] = useState({
    overall: 'healthy',
    services: { telegram: true, fileWatcher: true, learning: true, health: true },
    lastCheck: new Date().toISOString()
  })
  const [loading, setLoading] = useState(false)

  const statusColors = {
    healthy: 'text-status-online border-status-online/30 bg-status-online/5',
    warning: 'text-status-warning border-status-warning/30 bg-status-warning/5',
    error: 'text-status-danger border-status-danger/30 bg-status-danger/5'
  }

  const StatusIcon = status.overall === 'healthy' ? CheckCircle : 
                    status.overall === 'warning' ? AlertCircle : Activity

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass p-4 rounded-panel border ${statusColors[status.overall]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${status.overall === 'healthy' ? 'bg-status-online/20' : 
                            status.overall === 'warning' ? 'bg-status-warning/20' : 'bg-status-danger/20'}`}>
            <StatusIcon size={20} className={status.overall === 'healthy' ? 'text-status-online' : 
                                            status.overall === 'warning' ? 'text-status-warning' : 'text-status-danger'} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Vev Status</h3>
            <p className="text-xs capitalize">{status.overall}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          <span>{new Date(status.lastCheck).toLocaleTimeString('no-NO', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {Object.entries(status.services).map(([name, isActive]) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-status-online' : 'bg-status-danger'}`} />
            <span className="text-gray-400 capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================
// WIDGET 2: TelegramLiveFeed (INLINE)
// ============================================
function TelegramLiveFeed() {
  const messages = [
    { id: 1, text: "Hei Vev! Kan du hjelpe meg?", from: 'user', time: '14:32' },
    { id: 2, text: "Hei! Jeg er klar til å hjelpe.", from: 'vev', time: '14:32' },
    { id: 3, text: "Hva er status på NRJ Morgen?", from: 'user', time: '14:35' },
    { id: 4, text: "Alt ser bra ut! Oppdatert sakslista.", from: 'vev', time: '14:36' },
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20 h-80 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-cyan-neon" />
          <h3 className="text-sm font-semibold text-white">Telegram Live</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">I dag: <span className="text-cyan-neon font-mono">12</span></span>
          <span className="text-gray-500">Voice: <span className="text-violet-neon font-mono">45</span></span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                            ${msg.from === 'user' ? 'bg-violet-neon/20' : 'bg-cyan-neon/20'}`}>
              {msg.from === 'user' ? <User size={14} className="text-violet-neon" /> : <Bot size={14} className="text-cyan-neon" />}
            </div>
            <div className={`max-w-[80%] p-2.5 rounded-lg text-xs
                            ${msg.from === 'user' ? 'bg-violet-neon/10 text-white' : 'bg-cyan-neon/10 text-white'}`}>
              <p>{msg.text}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-gray-500">{msg.time}</span>
                {msg.from === 'vev' && <Mic size={10} className="text-cyan-neon" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================
// WIDGET 3: LearningProgressChart (INLINE)
// ============================================
function LearningProgressChart() {
  const data = [
    { day: 'Man', learnings: 3 },
    { day: 'Tir', learnings: 5 },
    { day: 'Ons', learnings: 2 },
    { day: 'Tor', learnings: 7 },
    { day: 'Fre', learnings: 4 },
    { day: 'Lør', learnings: 1 },
    { day: 'Søn', learnings: 3 }
  ]
  
  const maxValue = Math.max(...data.map(d => d.learnings))
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-violet-neon/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-violet-neon" />
          <h3 className="text-sm font-semibold text-white">Learning Progress</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold font-mono text-violet-neon">47</p>
          <p className="text-[10px] text-gray-500">total</p>
        </div>
      </div>
      <div className="h-32 flex items-end gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-violet-neon/30 rounded-t-sm"
              style={{ height: `${(d.learnings / maxValue) * 80}px` }}
            />
            <span className="text-[10px] text-gray-500">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-neon/5">
          <TrendingUp size={14} className="text-violet-neon" />
          <div>
            <p className="text-[10px] text-gray-400">Denne uken</p>
            <p className="text-sm font-semibold text-white">25 nye</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-neon/5">
          <BookOpen size={14} className="text-cyan-neon" />
          <div>
            <p className="text-[10px] text-gray-400">Mønstre</p>
            <p className="text-sm font-semibold text-white">5 funnet</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// WIDGET 4: ActiveTasksCounter (INLINE)
// ============================================
function ActiveTasksCounter() {
  const tasks = { backlog: 12, research: 5, write: 3, review: 2, done: 28 }
  const total = Object.values(tasks).reduce((a, b) => a + b, 0)
  const active = tasks.research + tasks.write + tasks.review
  const completion = Math.round((tasks.done / total) * 100)
  
  const columns = [
    { id: 'backlog', label: 'Backlog', count: tasks.backlog, color: 'bg-gray-500' },
    { id: 'research', label: 'Research', count: tasks.research, color: 'bg-cyan-neon' },
    { id: 'write', label: 'Write', count: tasks.write, color: 'bg-violet-neon' },
    { id: 'review', label: 'Review', count: tasks.review, color: 'bg-status-warning' },
    { id: 'done', label: 'Done', count: tasks.done, color: 'bg-status-online' }
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
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
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
          <div className="h-full bg-gradient-to-r from-cyan-neon to-status-online" style={{ width: `${completion}%` }} />
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// WIDGET 5: GitHubSyncStatus (INLINE)
// ============================================
function GitHubSyncStatus() {
  const status = { lastSync: '2026-03-05 03:00', nextSync: '2026-03-06 03:00', commits: 3 }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-green-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Github size={18} className="text-white" />
          <h3 className="text-sm font-semibold text-white">GitHub Sync</h3>
        </div>
        <CheckCircle size={16} className="text-status-online" />
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Siste sync</span>
          <span className="text-gray-300 font-mono">{status.lastSync}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Neste sync</span>
          <span className="text-gray-300 font-mono">{status.nextSync}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Commits i dag</span>
          <span className="text-cyan-neon font-mono">{status.commits}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
          <span>Auto-backup aktiv</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// WIDGET 6: SakslisteWidget (INLINE)
// ============================================
function SakslisteWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const items = [
    { id: 1, title: "Farmen Kjendis: Ny sesong startet", category: "Reality", priority: "high" },
    { id: 2, title: "Paradise Hotel: Dramatisk exit", category: "Reality", priority: "high" },
    { id: 3, title: "Spellemannprisen 2026: Vinnerne", category: "Musikk", priority: "medium" },
    { id: 4, title: "NRK Nyheter: Værmelding", category: "Nyheter", priority: "low" },
  ]

  const formatDate = (date) => {
    return date.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={18} className="text-cyan-neon" />
          <h3 className="text-sm font-semibold text-white">Dagens Saksliste</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}
            className="p-1 hover:bg-white/10 rounded"
          >
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
          <span className="text-xs text-gray-300 capitalize">{formatDate(currentDate)}</span>
          <button 
            onClick={() => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
            className="p-1 hover:bg-white/10 rounded"
          >
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-space-700/30 hover:bg-space-700/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                item.priority === 'high' ? 'bg-status-danger' : 
                item.priority === 'medium' ? 'bg-status-warning' : 'bg-status-online'
              }`} />
              <div>
                <p className="text-sm text-white">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-neon/10 text-cyan-neon">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-500" />
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-xs text-gray-500">{items.length} saker i dag</span>
        <button className="text-xs text-cyan-neon hover:underline">Vis alle</button>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 lg:p-5 space-y-4">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-xl font-bold text-white">Vev Mission Control</h1>
        <span className="text-xs text-gray-500">{new Date().toLocaleDateString('no-NO')}</span>
      </motion.div>

      {/* Row 1: Status + Telegram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VevStatusCard />
        <TelegramLiveFeed />
      </div>

      {/* Row 2: Learning + Tasks + GitHub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LearningProgressChart />
        <ActiveTasksCounter />
        <GitHubSyncStatus />
      </div>

      {/* Row 3: Saksliste */}
      <div className="grid grid-cols-1 gap-4">
        <SakslisteWidget />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass p-4 rounded-panel"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Hurtighandlinger</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/saksliste')}
            className="px-4 py-2 bg-cyan-neon/20 text-cyan-neon rounded-lg text-sm hover:bg-cyan-neon/30 transition-colors"
          >
            Åpne Saksliste
          </button>
          <button
            onClick={() => navigate('/kanban')}
            className="px-4 py-2 bg-violet-neon/20 text-violet-neon rounded-lg text-sm hover:bg-violet-neon/30 transition-colors"
          >
            Åpne Kanban
          </button>
        </div>
      </motion.div>
    </div>
  )
}
