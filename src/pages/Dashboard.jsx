import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Vev System Widgets
import VevStatusCard from '../components/widgets/VevStatusCard'
import TelegramLiveFeed from '../components/widgets/TelegramLiveFeed'
import LearningProgressChart from '../components/widgets/LearningProgressChart'
import ActiveTasksCounter from '../components/widgets/ActiveTasksCounter'
import GitHubSyncStatus from '../components/widgets/GitHubSyncStatus'
import SakslisteWidget from '../components/widgets/SakslisteWidget'

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
