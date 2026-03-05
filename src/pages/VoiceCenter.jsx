import React from 'react'
import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

export default function VoiceCenter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center">
        <Mic size={48} className="text-cyan-neon mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Voice Center</h2>
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </motion.div>
  )
}
