import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, TrendingUp, Calendar, Clock } from 'lucide-react'

export default function VoiceMessagesCounter() {
  const [stats, setStats] = useState({
    total: 276,
    today: 8,
    thisWeek: 45,
    avgDuration: 12.5
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse h-48">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-white/10 rounded"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20 h-48"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic size={18} className="text-cyan-neon" />
          <h3 className="text-sm font-semibold text-white">Voice Messages</h3>
        </div>
        <span className="text-2xl font-bold font-mono text-cyan-neon">{stats.total}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-cyan-neon/5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-[10px] text-gray-400">I dag</span>
          </div>
          <p className="text-lg font-semibold text-white">{stats.today}</p>
        </div>

        <div className="p-3 rounded-lg bg-violet-neon/5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={12} className="text-gray-400" />
            <span className="text-[10px] text-gray-400">Denne uken</span>
          </div>
          <p className="text-lg font-semibold text-white">{stats.thisWeek}</p>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-space-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">Gjennomsnittlig varighet</span>
          </div>
          <span className="text-sm font-mono text-cyan-neon">{stats.avgDuration}s</span>
        </div>
      </div>
    </motion.div>
  )
}
