import React from 'react'
import { motion } from 'framer-motion'
import { 
  Layout, List, Plus, RefreshCw, ArrowRight,
  Sun, Calendar, TrendingUp
} from 'lucide-react'
import KanbanBoard from '../components/KanbanBoard'
import SakslisteWidget from '../components/widgets/SakslisteWidget'

export default function Saksliste() {
  return (
    <div className="h-full overflow-y-auto p-4 lg:p-5 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-neon/20 to-violet-neon/20 
                            border border-cyan-neon/30 flex items-center justify-center"
            >
              <Layout size={24} className="text-cyan-neon" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Saksliste & Kanban</h1>
              <p className="text-sm text-gray-500">NRJ Morgen - Story management</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn-cyber flex items-center gap-2">
            <Sun size={16} />
            <span>Kjør Morning Routine</span>
          </button>
          
          <button className="btn-cyber-primary flex items-center gap-2">
            <Plus size={16} />
            <span>Ny sak</span>
          </button>
        </div>
      </motion.div>
      
      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: 'Backlog', value: 12, color: 'gray', icon: '📥' },
          { label: 'Research', value: 5, color: 'cyan', icon: '🔍' },
          { label: 'Write', value: 3, color: 'violet', icon: '✍️' },
          { label: 'Review', value: 2, color: 'amber', icon: '👀' },
          { label: 'Done', value: 28, color: 'green', icon: '✅' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`
              glass p-4 rounded-panel border
              ${stat.color === 'gray' ? 'border-gray-500/20' :
                stat.color === 'cyan' ? 'border-cyan-neon/20' :
                stat.color === 'violet' ? 'border-violet-neon/20' :
                stat.color === 'amber' ? 'border-status-warning/20' :
                'border-status-online/20'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`
                text-2xl font-bold font-mono
                ${stat.color === 'gray' ? 'text-gray-400' :
                  stat.color === 'cyan' ? 'text-cyan-neon' :
                  stat.color === 'violet' ? 'text-violet-neon' :
                  stat.color === 'amber' ? 'text-status-warning' :
                  'text-status-online'}
              `}>
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kanban Board - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 panel p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layout size={18} className="text-cyan-neon" />
              <h2 className="text-sm font-semibold text-white">Kanban Board</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Dra og slipp for å flytte</span>
              <ArrowRight size={14} className="text-gray-500" />
            </div>
          </div>
          
          <KanbanBoard />
        </motion.div>
        
        {/* Saksliste Widget - Takes 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <SakslisteWidget detailed />
        </motion.div>
      </div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel p-4"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-cyan-neon" />
          Hurtighandlinger
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Morning Routine', icon: '🌅', desc: 'Hent nye saker' },
            { label: 'Auto-Assign', icon: '🤖', desc: 'La Vev fordele' },
            { label: 'Export CSV', icon: '📊', desc: 'Last ned rapport' },
            { label: 'Sync til NRJ', icon: '📻', desc: 'Oppdater saksliste' },
          ].map(action => (
            <button
              key={action.label}
              className="p-4 rounded-lg border border-white/10 bg-white/5 
                       hover:border-cyan-neon/30 hover:bg-cyan-neon/5
                       transition-all text-left group"
            >
              <span className="text-2xl mb-2 block">{action.icon}</span>
              <p className="text-sm font-medium text-white group-hover:text-cyan-neon transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
