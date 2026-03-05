import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, Send, Mic, User, Bot, 
  TrendingUp, Clock, CheckCircle, AlertCircle 
} from 'lucide-react'
import clsx from 'clsx'

// Telegram Widget Component
export default function TelegramWidget() {
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    voice: 0,
    status: 'online'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTelegramData()
    const interval = setInterval(fetchTelegramData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTelegramData = async () => {
    try {
      const response = await fetch('http://localhost:8765/api/telegram/status')
      const data = await response.json()
      
      setStats({
        total: data.total_messages || 0,
        today: Math.floor(Math.random() * 20) + 5, // Simulated for now
        voice: data.voice_messages_sent || 0,
        status: data.status || 'online'
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch Telegram data:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-white/10 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-neon/20 to-violet-neon/20 
                          border border-cyan-neon/30 flex items-center justify-center">
            <MessageCircle size={20} className="text-cyan-neon" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Telegram Bot</h3>
            <div className="flex items-center gap-2">
              <div className={clsx(
                "w-2 h-2 rounded-full",
                stats.status === 'online' ? "bg-status-online shadow-neon-green" : "bg-status-danger"
              )} />
              <span className={clsx(
                "text-xs",
                stats.status === 'online' ? "text-status-online" : "text-status-danger"
              )}>
                {stats.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold font-mono text-cyan-neon">{stats.total}</p>
          <p className="text-xs text-gray-500">total meldinger</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-cyan-neon" />
            <span className="text-xs text-gray-400">I dag</span>
          </div>
          <p className="text-lg font-mono font-semibold text-white">{stats.today}</p>
        </div>
        
        <div className="glass-card p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Mic size={12} className="text-violet-neon" />
            <span className="text-xs text-gray-400">Voice</span>
          </div>
          <p className="text-lg font-mono font-semibold text-white">{stats.voice}</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle size={12} className="text-status-online" />
          <span>AI-baserte svar</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle size={12} className="text-status-online" />
          <span>Samtale-historikk</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle size={12} className="text-status-online" />
          <span>Emosjonell stemme</span>
        </div>
      </div>

      {/* Bot Info */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Bot:</span>
          <span className="text-cyan-neon font-mono">@Vev_kompis_bot</span>
        </div>
      </div>
    </motion.div>
  )
}
