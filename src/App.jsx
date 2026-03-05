import React, { useEffect, useRef } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Vev Pages ONLY - No robot pages
import Dashboard from './pages/Dashboard'
import TaskBoard from './pages/TaskBoard'
import VoiceCenter from './pages/VoiceCenter'
import Settings from './pages/Settings'
import Saksliste from './pages/Saksliste'

// Page titles
const PAGE_TITLES = {
  '/': 'Vev Mission Control',
  '/tasks': 'Task Board',
  '/voice': 'Voice Center',
  '/settings': 'Settings',
  '/saksliste': 'Saksliste & Kanban',
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  )
}

function AppContent() {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Vev Control'
  
  useEffect(() => {
    document.title = `${pageTitle} — Vev Mission Control`
  }, [pageTitle])

  return (
    <div className="h-screen w-full flex overflow-hidden bg-space-900 text-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={pageTitle} />
        
        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/tasks" element={<PageTransition><TaskBoard /></PageTransition>} />
              <Route path="/voice" element={<PageTransition><VoiceCenter /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              <Route path="/saksliste" element={<PageTransition><Saksliste /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
