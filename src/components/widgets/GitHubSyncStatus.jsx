import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Github, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function GitHubSyncStatus() {
  const [status, setStatus] = useState({
    lastSync: '2026-03-05 03:00',
    nextSync: '2026-03-06 03:00',
    status: 'synced',
    commits: 3
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-green-500/20 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    )
  }

  const StatusIcon = status.status === 'synced' ? CheckCircle : AlertCircle
  const statusColor = status.status === 'synced' ? 'text-status-online' : 'text-status-warning'

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
        
        <StatusIcon size={16} className={statusColor} />
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
