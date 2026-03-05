import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, BookOpen } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function LearningProgressChart() {
  const [data, setData] = useState([])
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, patterns: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate sample data for last 7 days
    const generateData = () => {
      const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
      return days.map((day, i) => ({
        day,
        learnings: [3, 5, 2, 7, 4, 1, 3][i],
        patterns: [1, 2, 0, 3, 1, 0, 1][i]
      }))
    }
    
    setData(generateData())
    setStats({ total: 47, thisWeek: 25, patterns: 5 })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-violet-neon/20 animate-pulse h-64">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-white/5 rounded"></div>
      </div>
    )
  }

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
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold font-mono text-violet-neon">{stats.total}</p>
            <p className="text-[10px] text-gray-500">total</p>
          </div>
        </div>
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLearnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(8,13,26,0.95)', 
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '8px'
              }}
            />
            
            <Area 
              type="monotone" 
              dataKey="learnings" 
              stroke="#7c3aed" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorLearnings)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-neon/5">
          <TrendingUp size={14} className="text-violet-neon" />
          <div>
            <p className="text-[10px] text-gray-400">Denne uken</p>
            <p className="text-sm font-semibold text-white">{stats.thisWeek} nye</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-neon/5">
          <BookOpen size={14} className="text-cyan-neon" />
          <div>
            <p className="text-[10px] text-gray-400">Mønstre</p>
            <p className="text-sm font-semibold text-white">{stats.patterns} funnet</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
