import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Mic, User, Bot } from 'lucide-react'

export default function TelegramLiveFeed() {
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({ total: 0, today: 0, voice: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, use simulated data
    // In production, this would fetch from Telegram bot logs
    const simulatedMessages = [
      { id: 1, text: "Hei Vev! Kan du hjelpe meg med noe?", from: 'user', time: '14:32', hasVoice: false },
      { id: 2, text: "Hei! Jeg er klar til å hjelpe. Hva trenger du?", from: 'vev', time: '14:32', hasVoice: true },
      { id: 3, text: "Hva er status på NRJ Morgen?", from: 'user', time: '14:35', hasVoice: false },
      { id: 4, text: "Alt ser bra ut! Jeg har oppdatert sakslista med dagens saker.", from: 'vev', time: '14:36', hasVoice: true },
    ]
    
    setMessages(simulatedMessages)
    setStats({ total: 276, today: 12, voice: 45 })
    setLoading(false)
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      // In production: fetch new messages
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="glass p-4 rounded-panel border border-cyan-neon/20 animate-pulse h-80">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-panel border border-cyan-neon/20 h-80 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-cyan-neon" />
          <h3 className="text-sm font-semibold text-white">Telegram Live</h3>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">I dag: <span className="text-cyan-neon font-mono">{stats.today}</span></span>
          <span className="text-gray-500">Voice: <span className="text-violet-neon font-mono">{stats.voice}</span></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.from === 'user' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-2 ${msg.from === 'user' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                              ${msg.from === 'user' ? 'bg-violet-neon/20' : 'bg-cyan-neon/20'}`}
              >
                {msg.from === 'user' ? 
                  <User size={14} className="text-violet-neon" /> : 
                  <Bot size={14} className="text-cyan-neon" />}
              </div>
              
              <div className={`max-w-[80%] p-2.5 rounded-lg text-xs
                              ${msg.from === 'user' 
                                ? 'bg-violet-neon/10 text-white' 
                                : 'bg-cyan-neon/10 text-white'}`}
              >
                <p>{msg.text}</p>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-gray-500">{msg.time}</span>
                  {msg.hasVoice && <Mic size={10} className="text-cyan-neon" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
