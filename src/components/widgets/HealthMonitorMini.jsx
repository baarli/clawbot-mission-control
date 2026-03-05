import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Server, Database } from 'lucide-react'

export default function HealthMonitorMini() {
  const [health, setHealth] = useState({
    status: 'healthy',
    services: {
      telegram: { status: 'online', lastCheck: Date.now() },
      fileWatcher: { status: 'online', lastCheck: Date.now() },
      healthMonitor: { status: 'online', lastCheck: Date.now() },
      database: { status: 'online', lastCheck: Date.now() }
    },
    diskUsage: 73,
    memoryUsage: 45
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching health data
    setTimeout(() => setLoading(false), 500)
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      // In production: fetch real health data
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse h-48">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-8 bg-white/5 rounded"></div>)}
        </div>
      </div>
    )
  }

  const services = [
    { id: 'telegram', name: 'Telegram', icon: Activity },
    { id: 'fileWatcher', name: 'File Watcher', icon: Server },
    { id: 'healthMonitor', name: 'Health Monitor', icon: Heart },
    { id: 'database', name: 'Database', icon: Database }
  ]

  const allOnline = Object.values(health.services).every(s => s.status === 'online')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20 h-48"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart size={18} className={allOnline ? 'text-status-online' : 'text-status-warning'} />
          <h3 className="text-sm font-semibold text-white">Health Monitor</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${allOnline ? 'bg-status-online/20 text-status-online' : 'bg-status-warning/20 text-status-warning'}`}>
          {allOnline ? 'Healthy' : 'Warning'}
        </span>
      </div>

      <div className="space-y-2">
        {services.map(service => {
          const status = health.services[service.id]?.status
          const isOnline = status === 'online'
          
          return (
            <div key={service.id} className="flex items-center justify-between p-2 rounded-lg bg-space-700/30">
              <div className="flex items-center gap-2">
                <service.icon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-300">{service.name}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-status-online' : 'bg-status-danger'}`} />
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Disk: {health.diskUsage}%</span>
          <span className="text-gray-500">RAM: {health.memoryUsage}%</span>
        </div>
        <div className="mt-1 flex gap-1">
          <div className="h-1 flex-1 bg-space-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-neon" style={{ width: `${health.diskUsage}%` }} />
          </div>
          <div className="h-1 flex-1 bg-space-700 rounded-full overflow-hidden">
            <div className="h-full bg-violet-neon" style={{ width: `${health.memoryUsage}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
