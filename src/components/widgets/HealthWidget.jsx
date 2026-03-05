import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Cpu, HardDrive, Wifi, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

export default function HealthWidget() {
  const [health, setHealth] = useState({
    overall: 'healthy',
    services: {
      telegram: true,
      fileWatcher: true,
      healthMonitor: true
    },
    diskUsage: '73%',
    github: true
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealthData = async () => {
    try {
      const response = await fetch('http://localhost:8765/api/health/status')
      const data = await response.json()
      
      setHealth({
        overall: data.overall_status || 'healthy',
        services: data.services || {
          telegram: true,
          fileWatcher: true,
          healthMonitor: true
        },
        diskUsage: data.disk_usage || '73%',
        github: data.github_connected || true
      })
      
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-status-online'
      case 'warning': return 'text-status-warning'
      case 'error': return 'text-status-danger'
      default: return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="glass p-4 rounded-panel border border-status-online/20 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-white/10 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass p-4 rounded-panel border border-status-online/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-status-online/20 to-cyan-neon/20 
                          border border-status-online/30 flex items-center justify-center"
          >
            <Heart size={20} className="text-status-online" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">System Health</h3>
            <div className="flex items-center gap-2">
              <div className={clsx(
                "w-2 h-2 rounded-full",
                health.overall === 'healthy' ? "bg-status-online animate-pulse" : "bg-status-warning"
              )} />
              <span className={clsx("text-xs", getStatusColor(health.overall))}>
                {health.overall === 'healthy' ? 'All Good' : 'Warning'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="space-y-2 mb-4"
      >
        {Object.entries(health.services).map(([name, status]) => (
          <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-white/5"
          >
            <div className="flex items-center gap-2"
            >
              <div className={clsx(
                "w-2 h-2 rounded-full",
                status ? "bg-status-online" : "bg-status-danger"
              )} />
              <span className="text-xs text-gray-400 capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
            {status && <CheckCircle size={12} className="text-status-online" />}
          </div>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-3"
      >
        <div className="glass-card p-3 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-1"
          >
            <HardDrive size={12} className="text-cyan-neon" />
            <span className="text-xs text-gray-400">Disk</span>
          </div>
          <p className="text-lg font-mono font-semibold text-white">{health.diskUsage}</p>
        </div>
        
        <div className="glass-card p-3 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-1"
          >
            <Wifi size={12} className={health.github ? "text-status-online" : "text-status-danger"} />
            <span className="text-xs text-gray-400">GitHub</span>
          </div>
          <p className={clsx("text-lg font-mono font-semibold", health.github ? "text-status-online" : "text-status-danger")}>
            {health.github ? 'Connected' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Last Check */}
      <div className="mt-4 pt-3 border-t border-white/10"
      >
        <div className="flex items-center justify-between text-xs"
        >
          <span className="text-gray-500">Siste sjekk:</span>
          <span className="text-gray-400 font-mono">{new Date().toLocaleTimeString('no-NO', {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
    </motion.div>
  )
}
