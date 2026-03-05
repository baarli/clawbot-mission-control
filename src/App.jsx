import React, { useEffect, useRef } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import { useRobotStore } from './stores/robotStore'

// Pages (lazy-loaded)
import Dashboard from './pages/Dashboard'
import CommandCenter from './pages/CommandCenter'
import TaskBoard from './pages/TaskBoard'
import VoiceCenter from './pages/VoiceCenter'
import TelemetryCenter from './pages/TelemetryCenter'
import FleetOverview from './pages/FleetOverview'
import AlertSystem from './pages/AlertSystem'
import MissionLogs from './pages/MissionLogs'
import Settings from './pages/Settings'
import Saksliste from './pages/Saksliste'

// ─── Page meta ────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/':          'Mission Control Dashboard',
  '/commands':  'Command Center',
  '/tasks':     'Task Board',
  '/voice':     'Voice Command Center',
  '/telemetry': 'Telemetry & Data Center',
  '/fleet':     'Robot Fleet',
  '/alerts':    'Alert & Incident System',
  '/logs':      'Mission History',
  '/settings':  'System Settings',
  '/saksliste': 'Saksliste & Kanban',
}

// ─── Page transition ──────────────────────────────────────────────────────────
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

// ─── Inner app (needs router context) ────────────────────────────────────────
function AppInner() {
  const location = useLocation()
  const tickTelemetry = useRobotStore((s) => s.tickTelemetry)
  const addAlert = useRobotStore((s) => s.addAlert)
  const alerts = useRobotStore((s) => s.alerts)
  const tickRef = useRef(null)

  // ── Telemetry simulation loop ──
  useEffect(() => {
    tickRef.current = setInterval(tickTelemetry, 2000)
    return () => clearInterval(tickRef.current)
  }, [tickTelemetry])

  // ── Seed demo tasks ──
  useEffect(() => {
    const store = useRobotStore.getState()
    if (store.tasks.length === 0) {
      store.setTasks(DEMO_TASKS)
    }
    if (store.alerts.length === 0) {
      DEMO_ALERTS.forEach((a) => store.addAlert(a))
    }
  }, [])

  const pageTitle = PAGE_TITLES[location.pathname] || 'Mission Control'

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Space grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: '#050810',
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar pageTitle={pageTitle} />

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/commands" element={<PageTransition><CommandCenter /></PageTransition>} />
              <Route path="/tasks" element={<PageTransition><TaskBoard /></PageTransition>} />
              <Route path="/voice" element={<PageTransition><VoiceCenter /></PageTransition>} />
              <Route path="/telemetry" element={<PageTransition><TelemetryCenter /></PageTransition>} />
              <Route path="/fleet" element={<PageTransition><FleetOverview /></PageTransition>} />
              <Route path="/alerts" element={<PageTransition><AlertSystem /></PageTransition>} />
              <Route path="/logs" element={<PageTransition><MissionLogs /></PageTransition>} />
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
      <AppInner />
    </Router>
  )
}

// ─── Demo seed data ───────────────────────────────────────────────────────────
const DEMO_TASKS = [
  { id: 'task-1', robot_id: 'robot-001', title: 'Pick up object A', command: 'PICK_OBJECT', status: 'in-progress', priority: 'high', created_at: new Date(Date.now() - 120000).toISOString(), updated_at: new Date(Date.now() - 60000).toISOString(), tags: ['pickup', 'lab'], assignee: 'auto', estimated_duration: 30 },
  { id: 'task-2', robot_id: 'robot-001', title: 'Navigate to Station 2', command: 'NAVIGATE', status: 'pending', priority: 'medium', created_at: new Date(Date.now() - 300000).toISOString(), updated_at: new Date(Date.now() - 300000).toISOString(), tags: ['nav'], assignee: 'operator', estimated_duration: 60 },
  { id: 'task-3', robot_id: 'robot-001', title: 'Run diagnostic scan', command: 'DIAGNOSTICS', status: 'planned', priority: 'low', created_at: new Date(Date.now() - 600000).toISOString(), updated_at: new Date(Date.now() - 600000).toISOString(), tags: ['diagnostics'], assignee: 'scheduled', estimated_duration: 120 },
  { id: 'task-4', robot_id: 'robot-001', title: 'Assemble components #3', command: 'ASSEMBLE', status: 'completed', priority: 'high', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date(Date.now() - 1800000).toISOString(), tags: ['assembly'], assignee: 'auto', estimated_duration: 90 },
  { id: 'task-5', robot_id: 'robot-001', title: 'Inspect Zone Alpha', command: 'INSPECT', status: 'completed', priority: 'medium', created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 5400000).toISOString(), tags: ['inspection'], assignee: 'auto', estimated_duration: 45 },
  { id: 'task-6', robot_id: 'robot-001', title: 'Emergency cooldown procedure', command: 'COOLDOWN', status: 'failed', priority: 'critical', created_at: new Date(Date.now() - 9000000).toISOString(), updated_at: new Date(Date.now() - 8400000).toISOString(), tags: ['emergency'], assignee: 'operator', estimated_duration: 15, error: 'Temperature sensor failure' },
  { id: 'task-7', robot_id: 'robot-001', title: 'Battery recharge cycle', command: 'RECHARGE', status: 'pending', priority: 'high', created_at: new Date(Date.now() - 180000).toISOString(), updated_at: new Date(Date.now() - 180000).toISOString(), tags: ['maintenance'], assignee: 'scheduled', estimated_duration: 180 },
]

const DEMO_ALERTS = [
  { id: 'alert-1', robot_id: 'robot-001', severity: 'warning', message: 'Battery level below 80% — consider scheduling recharge', timestamp: new Date(Date.now() - 60000).toISOString(), acknowledged: false },
  { id: 'alert-2', robot_id: 'robot-001', severity: 'info', message: 'Telemetry sync established — streaming at 2s intervals', timestamp: new Date(Date.now() - 300000).toISOString(), acknowledged: true },
  { id: 'alert-3', robot_id: 'robot-001', severity: 'critical', message: 'Task failure: Emergency cooldown — temperature sensor fault', timestamp: new Date(Date.now() - 8400000).toISOString(), acknowledged: false },
]
