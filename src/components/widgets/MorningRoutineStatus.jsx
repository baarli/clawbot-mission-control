import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function MorningRoutineStatus() {
  const [status, setStatus] = useState({
    lastRun: '2026-03-05 06:00',
    nextRun: '2026-03-06 06:00',
    status: 'completed',
    storiesFetched: 12,
    timeUntilNext: '5h 18m'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
    
    // Update countdown every minute
    const interval = setInterval(() => {
      const now = new Date()
      const next = new Date()
      next.setHours(6, 0, 0, 0)
      if (next < now) next.setDate(next.getDate() + 1)
      
      const diff = next - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setStatus(prev => ({
        ...prev,
        timeUntilNext: `${hours}h ${minutes}m`
      }))
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-amber-500/20 animate-pulse h-48">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-white/10 rounded"></div>
      </div>
    )
  }

  const StatusIcon = status.status === 'completed' ? CheckCircle : 
                    status.status === 'running' ? Clock : AlertCircle
  const statusColor = status.status === 'completed' ? 'text-status-online' : 
                      status.status === 'running' ? 'text-amber-400' : 'text-status-danger'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-amber-500/20 h-48"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun size={18} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Morning Routine</h3>
        </div>
        <StatusIcon size={16} className={statusColor} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 rounded-lg bg-space-700/30">
          <span className="text-xs text-gray-400">Siste kjøring</span>
          <span className="text-xs text-gray-300 font-mono">{status.lastRun}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-space-700/30">
          <span className="text-xs text-gray-400">Neste kjøring</span>
          <span className="text-xs text-amber-400 font-mono">{status.nextRun}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 rounded-lg bg-space-700/30">
          <span className="text-xs text-gray-400">Saker hentet</span>
          <span className="text-xs text-cyan-neon font-mono">{status.storiesFetched}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Tid til neste</span>
          <span className="text-lg font-bold font-mono text-amber-400">{status.timeUntilNext}</span>
        </div>
      </div>
    </motion.div>
  )
}
