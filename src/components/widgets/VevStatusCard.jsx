import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function VevStatusCard() {
  const [status, setStatus] = useState({
    overall: 'healthy',
    services: {},
    lastCheck: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      // Check all Vev services
      const services = {
        telegram: await checkTelegram(),
        fileWatcher: await checkFileWatcher(),
        learning: true,
        health: true
      }
      
      const allHealthy = Object.values(services).every(s => s)
      
      setStatus({
        overall: allHealthy ? 'healthy' : 'warning',
        services,
        lastCheck: new Date().toISOString()
      })
      setLoading(false)
    } catch (e) {
      setStatus({ overall: 'error', services: {}, lastCheck: null })
      setLoading(false)
    }
  }

  const checkTelegram = async () => {
    try {
      const response = await fetch('http://localhost:8765/api/telegram/status')
      const data = await response.json()
      return data.status === 'online'
    } catch {
      return false
    }
  }

  const checkFileWatcher = async () => {
    // Check if file watcher service is running
    return true // Simplified for now
  }

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    )
  }

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
                            status.overall === 'warning' ? 'bg-status-warning/20' : 'bg-status-danger/20'}`}
          >
            <StatusIcon size={20} className={status.overall === 'healthy' ? 'text-status-online' : 
                                            status.overall === 'warning' ? 'text-status-warning' : 'text-status-danger'} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Vev Status</h3>
            <p className="text-xs capitalize">{status.overall}</p>
          </div>
        </div>
        
        {status.lastCheck && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{new Date(status.lastCheck).toLocaleTimeString('no-NO', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        )}
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
