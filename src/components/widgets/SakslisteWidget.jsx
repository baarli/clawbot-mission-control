import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, ChevronLeft, ChevronRight, ExternalLink,
  CheckCircle, Circle, Clock, Tag
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, addDays, subDays } from 'date-fns'
import { nb } from 'date-fns/locale'
import clsx from 'clsx'

export default function SakslisteWidget({ detailed = false }) {
  const [items, setItems] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0 })

  useEffect(() => {
    loadSaksliste()
  }, [selectedDate])

  const loadSaksliste = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      const { data, error } = await supabase
        .from('agenda_items')
        .select('*')
        .eq('date', dateStr)
        .order('position', { ascending: true })
      
      if (error) throw error
      
      setItems(data || [])
      
      // Calculate stats
      const published = data?.filter(i => i.status === 'published').length || 0
      setStats({
        total: data?.length || 0,
        published,
        pending: (data?.length || 0) - published
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading saksliste:', error)
      setIsLoading(false)
    }
  }

  const changeDate = (days) => {
    setSelectedDate(prev => days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days)))
  }

  const getCategoryColor = (category) => {
    const colors = {
      breaking: 'bg-status-danger/20 text-status-danger border-status-danger/30',
      news: 'bg-cyan-neon/20 text-cyan-neon border-cyan-neon/30',
      trending: 'bg-violet-neon/20 text-violet-neon border-violet-neon/30',
      entertainment: 'bg-status-warning/20 text-status-warning border-status-warning/30',
      sports: 'bg-status-online/20 text-status-online border-status-online/30'
    }
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (isLoading) {
    return (
      <div className={`
        glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse
        ${detailed ? 'h-full' : ''}
      `}>
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        glass rounded-panel border border-cyan-neon/20 overflow-hidden
        ${detailed ? 'h-full flex flex-col' : ''}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-neon/20 to-violet-neon/20 
                            border border-cyan-neon/30 flex items-center justify-center"
            >
              <Calendar size={20} className="text-cyan-neon" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Saksliste</h3>
              <p className="text-xs text-gray-500">NRJ Morgen</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-neon">{stats.total}</span>
            <span className="text-xs text-gray-500">saker</span>
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => changeDate(-1)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              {format(selectedDate, 'EEEE d. MMMM', { locale: nb })}
            </p>
            <p className="text-xs text-gray-500">
              {format(selectedDate, 'yyyy')}
            </p>
          </div>
          
          <button 
            onClick={() => changeDate(1)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-px border-b border-white/10">
        <div className="p-3 bg-status-online/5">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-status-online" />
            <span className="text-xs text-gray-400">Publisert</span>
          </div>
          <p className="text-lg font-mono font-semibold text-status-online">{stats.published}</p>
        </div>
        
        <div className="p-3 bg-status-warning/5">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-status-warning" />
            <span className="text-xs text-gray-400">Venter</span>
          </div>
          <p className="text-lg font-mono font-semibold text-status-warning">{stats.pending}</p>
        </div>
      </div>
      
      {/* Items List */}
      <div className={`
        overflow-y-auto
        ${detailed ? 'flex-1' : 'max-h-64'}
      `}
      >
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <Circle size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Ingen saker for denne dagen</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-start gap-3"
                >
                  {/* Number */}
                  <span className="text-xs font-mono text-cyan-neon w-5">
                    {index + 1}
                  </span>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`
                        text-sm font-medium truncate
                        ${item.status === 'published' ? 'text-white' : 'text-gray-300'}
                      `}>
                        {item.title}
                      </p>
                      
                      {item.link_url && (
                        <a 
                          href={item.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-cyan-neon transition-colors flex-shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    
                    {detailed && item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-2">
                      {item.category && (
                        <span className={`
                          text-[9px] px-1.5 py-0.5 rounded border
                          ${getCategoryColor(item.category)}
                        `}
                        >
                          {item.category}
                        </span>
                      )}
                      
                      <span className={`
                        text-[9px] px-1.5 py-0.5 rounded
                        ${item.status === 'published' 
                          ? 'bg-status-online/20 text-status-online' 
                          : 'bg-status-warning/20 text-status-warning'}
                      `}>
                        {item.status === 'published' ? '✓ Publisert' : '⏳ Venter'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
