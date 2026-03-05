import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Search, User, Clock, Wifi, WifiOff, Shield,
  ChevronDown, X, AlertTriangle, Info, CheckCircle, AlertOctagon,
  RefreshCw, Moon
} from 'lucide-react'
import { useRobotStore } from '../../stores/robotStore'
import { format } from 'date-fns'
import clsx from 'clsx'

const SEVERITY_CONFIG = {
  critical: { icon: AlertOctagon, color: 'text-status-danger', bg: 'bg-status-danger/10', border: 'border-status-danger/30' },
  warning:  { icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30' },
  info:     { icon: Info, color: 'text-cyan-neon', bg: 'bg-cyan-neon/10', border: 'border-cyan-neon/30' },
  success:  { icon: CheckCircle, color: 'text-status-online', bg: 'bg-status-online/10', border: 'border-status-online/30' },
}

function NotificationPanel({ onClose }) {
  const notifications = useRobotStore((s) => s.notifications)
  const dismissNotification = useRobotStore((s) => s.dismissNotification)
  const clearUnreadAlerts = useRobotStore((s) => s.clearUnreadAlerts)

  useEffect(() => {
    clearUnreadAlerts()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-full mt-2 w-80 glass rounded-panel border border-white/8 overflow-hidden"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div>
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          <p className="text-[10px] text-gray-500">{notifications.length} messages</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-white/8 text-gray-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Items */}
      <div className="max-h-80 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <CheckCircle size={28} className="text-status-online/40 mx-auto mb-2" />
            <p className="text-sm text-gray-500">All clear. No alerts.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = SEVERITY_CONFIG[n.severity] || SEVERITY_CONFIG.info
            const Icon = cfg.icon
            return (
              <div
                key={n.id}
                className={clsx(
                  'flex gap-3 px-4 py-3 border-b border-white/4 hover:bg-white/3 transition-colors group',
                  cfg.bg
                )}
              >
                <div className={clsx('flex-shrink-0 mt-0.5', cfg.color)}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                    {format(new Date(n.timestamp), 'HH:mm:ss')}
                  </p>
                </div>
                <button
                  onClick={() => dismissNotification(n.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-600 hover:text-white transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

export default function TopBar({ pageTitle }) {
  const [now, setNow] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadAlerts = useRobotStore((s) => s.unreadAlerts)
  const robots = useRobotStore((s) => s.robots)
  const activeRobotId = useRobotStore((s) => s.activeRobotId)
  const setActiveRobot = useRobotStore((s) => s.setActiveRobot)
  const robot = robots.find((r) => r.id === activeRobotId) || robots[0]
  const isOnline = robot?.status === 'online'
  const uptimeSeconds = useRobotStore((s) => s.uptimeSeconds)

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <header
      className="flex items-center h-14 px-4 border-b border-white/5 flex-shrink-0 relative"
      style={{ background: 'rgba(5,8,16,0.97)' }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 text-gray-600 text-xs">
          <span className="text-[10px] uppercase tracking-wider">Mission Control</span>
          <span>/</span>
        </div>
        <h1 className="text-sm font-semibold text-white truncate">{pageTitle}</h1>
      </div>

      {/* Center: mission clock */}
      <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
        {/* Uptime */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/6 bg-white/3">
          <RefreshCw size={10} className="text-cyan-neon animate-spin" style={{ animationDuration: '4s' }} />
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider leading-none mb-0.5">Uptime</p>
            <p className="text-xs font-mono text-white leading-none">{formatUptime(uptimeSeconds)}</p>
          </div>
        </div>

        {/* UTC Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/6 bg-white/3">
          <Clock size={10} className="text-gray-500" />
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider leading-none mb-0.5">
              {format(now, 'zzz')} Time
            </p>
            <p className="text-xs font-mono text-white leading-none">{format(now, 'HH:mm:ss')}</p>
          </div>
        </div>

        {/* Connection */}
        <div className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
          isOnline
            ? 'border-status-online/20 bg-status-online/5'
            : 'border-gray-700/50 bg-gray-900/30'
        )}>
          {isOnline
            ? <Wifi size={10} className="text-status-online" />
            : <WifiOff size={10} className="text-gray-600" />
          }
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider leading-none mb-0.5">Status</p>
            <p className={clsx(
              'text-xs font-semibold leading-none',
              isOnline ? 'text-status-online' : 'text-gray-500'
            )}>
              {isOnline ? 'CONNECTED' : 'OFFLINE'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Robot selector */}
        {robots.length > 1 && (
          <select
            value={activeRobotId}
            onChange={(e) => setActiveRobot(e.target.value)}
            className="hidden md:block input-cyber text-xs py-1 px-2 w-36"
          >
            {robots.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}

        {/* Security badge */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md border border-cyan-neon/15 bg-cyan-neon/5">
          <Shield size={10} className="text-cyan-neon" />
          <span className="text-[10px] text-cyan-neon font-medium">SECURE</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={clsx(
              'relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150',
              showNotifications
                ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/30'
                : 'text-gray-500 hover:text-white hover:bg-white/8'
            )}
          >
            <Bell size={15} />
            {unreadAlerts > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-status-danger rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              >
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </motion.span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-neon/20 to-violet-neon/20 border border-cyan-neon/20 flex items-center justify-center cursor-pointer hover:border-cyan-neon/40 transition-colors">
          <User size={14} className="text-cyan-neon" />
        </div>
      </div>
    </header>
  )
}
