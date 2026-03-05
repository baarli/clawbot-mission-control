import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Terminal, ListTodo, Mic, Activity,
  Ship, Bell, ScrollText, Settings, ChevronLeft, ChevronRight,
  Bot, Wifi, WifiOff, Battery, BatteryLow, AlertTriangle,
  Cpu, Zap
} from 'lucide-react'
import { useRobotStore } from '../../stores/robotStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { path: '/',          icon: LayoutDashboard, label: 'Mission Control', exact: true },
  { path: '/commands',  icon: Terminal,        label: 'Command Center' },
  { path: '/tasks',     icon: ListTodo,        label: 'Task Board' },
  { path: '/voice',     icon: Mic,             label: 'Voice Center' },
  { path: '/telemetry', icon: Activity,        label: 'Telemetry' },
  { path: '/fleet',     icon: Ship,            label: 'Fleet Overview' },
  { path: '/alerts',    icon: Bell,            label: 'Alert System' },
  { path: '/logs',      icon: ScrollText,      label: 'Mission Logs' },
  { path: '/settings',  icon: Settings,        label: 'Settings' },
]

function RobotStatusWidget({ collapsed, robot, telemetry }) {
  const isOnline = robot?.status === 'online'
  const battery = robot?.battery || telemetry?.battery || 0
  const lowBattery = battery < 20

  return (
    <div className={clsx(
      'mx-3 mb-3 rounded-card border relative overflow-hidden transition-all duration-300',
      isOnline
        ? 'border-status-online/20 bg-status-online/5'
        : 'border-gray-700/50 bg-gray-900/50'
    )}>
      {/* Glow line top */}
      {isOnline && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-status-online/60 to-transparent" />
      )}

      <div className="p-3">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                isOnline ? 'bg-status-online/15' : 'bg-gray-700/50'
              )}>
                <Bot size={14} className={isOnline ? 'text-status-online' : 'text-gray-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{robot?.name || 'ClawBot Alpha'}</p>
                <p className="text-[10px] text-gray-500 font-mono">{robot?.serial_number || 'KB-2024-001'}</p>
              </div>
              <div className="flex items-center gap-1">
                {isOnline
                  ? <Wifi size={10} className="text-status-online" />
                  : <WifiOff size={10} className="text-gray-600" />
                }
              </div>
            </div>

            {/* Battery bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {lowBattery
                    ? <BatteryLow size={10} className="text-status-danger animate-pulse" />
                    : <Battery size={10} className="text-gray-400" />
                  }
                  <span className="text-[10px] text-gray-400">Battery</span>
                </div>
                <span className={clsx(
                  'text-[10px] font-mono font-medium',
                  lowBattery ? 'text-status-danger' : battery < 50 ? 'text-status-warning' : 'text-status-online'
                )}>
                  {Math.round(battery)}%
                </span>
              </div>
              <div className="progress-track h-1">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-1000',
                    lowBattery ? 'progress-fill-red' : battery < 50 ? 'progress-fill-amber' : 'progress-fill-green'
                  )}
                  style={{ width: `${battery}%` }}
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={clsx(
                  'status-dot animate-pulse-slow',
                  isOnline ? 'status-dot-online' : 'status-dot-offline'
                )} />
                <span className={clsx(
                  'text-[10px] font-medium uppercase tracking-wider',
                  isOnline ? 'text-status-online' : 'text-gray-500'
                )}>
                  {robot?.status || 'offline'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              isOnline ? 'bg-status-online/15' : 'bg-gray-700/50'
            )}>
              <Bot size={14} className={isOnline ? 'text-status-online' : 'text-gray-500'} />
            </div>
            <span className={clsx(
              'status-dot animate-pulse-slow',
              isOnline ? 'status-dot-online' : 'status-dot-offline'
            )} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sidebar() {
  const sidebarCollapsed = useRobotStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useRobotStore((s) => s.toggleSidebar)
  const unreadAlerts = useRobotStore((s) => s.unreadAlerts)
  const liveTelemetry = useRobotStore((s) => s.liveTelemetry)
  const robots = useRobotStore((s) => s.robots)
  const activeRobotId = useRobotStore((s) => s.activeRobotId)
  const robot = robots.find((r) => r.id === activeRobotId) || robots[0]
  const location = useLocation()

  const sidebarWidth = sidebarCollapsed ? '64px' : '220px'

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 h-full flex flex-col relative z-20"
      style={{
        background: 'rgba(5,8,16,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-neon/30 to-transparent" />

      {/* ── Logo ── */}
      <div className="flex items-center h-14 px-3 border-b border-white/5">
        <motion.div
          animate={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          className="flex items-center gap-3 w-full overflow-hidden"
        >
          {/* Logo mark */}
          <div className="relative flex-shrink-0 w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-neon/20 to-violet-neon/20 border border-cyan-neon/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={14} className="text-cyan-neon" />
            </div>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                <p className="text-xs font-bold text-white tracking-widest uppercase">ClawBot</p>
                <p className="text-[9px] text-cyan-neon/70 tracking-[0.15em] uppercase font-mono">Mission Control</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Robot Status ── */}
      <div className="mt-3">
        <RobotStatusWidget
          collapsed={sidebarCollapsed}
          robot={robot}
          telemetry={liveTelemetry}
        />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {!sidebarCollapsed && (
          <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-600 mb-1">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path) && item.path !== '/'
              ? true
              : item.path === '/' && location.pathname === '/'

          const showBadge = item.path === '/alerts' && unreadAlerts > 0

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group relative',
                isActive
                  ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan-neon rounded-r-full" />
              )}

              <div className={clsx(
                'flex-shrink-0 w-4 h-4 flex items-center justify-center',
                isActive && 'drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]'
              )}>
                <item.icon size={15} />
              </div>

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 whitespace-nowrap text-[13px] font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Alert badge */}
              {showBadge && (
                <span className={clsx(
                  'flex-shrink-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold',
                  'bg-status-danger text-white',
                  sidebarCollapsed && 'absolute top-0.5 right-0.5 min-w-[14px] h-[14px] text-[8px]'
                )}>
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── System info ── */}
      {!sidebarCollapsed && (
        <div className="mx-3 mb-3 p-2.5 rounded-lg border border-white/5 bg-white/2">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={10} className="text-gray-600" />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">System</span>
          </div>
          <div className="space-y-1">
            {[
              { label: 'CPU', value: `${Math.round(liveTelemetry?.cpu_load || 32)}%` },
              { label: 'Latency', value: `${Math.round(liveTelemetry?.network_latency || 15)}ms` },
              { label: 'Temp', value: `${Math.round(liveTelemetry?.temperature || 38)}°C` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[10px] text-gray-600">{label}</span>
                <span className="text-[10px] font-mono text-gray-400">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ── */}
      <div className="border-t border-white/5 p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all duration-150"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight size={14} />
            : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={14} />
                <span className="text-[11px]">Collapse</span>
              </div>
            )
          }
        </button>
      </div>
    </motion.aside>
  )
}
