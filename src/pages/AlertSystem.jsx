import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Bell, BellOff, Filter, Clock, ChevronRight, Trash2, RefreshCw } from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'

const SEVERITY_CONFIG = {
  critical: { color: '#ff4444', bg: 'bg-status-danger/10', border: 'border-status-danger/30', icon: AlertCircle,  label: 'Critical' },
  warning:  { color: '#ffaa00', bg: 'bg-status-warning/10',border: 'border-status-warning/30',icon: AlertTriangle, label: 'Warning'  },
  info:     { color: '#00d4ff', bg: 'bg-cyan-neon/10',     border: 'border-cyan-neon/30',    icon: Info,          label: 'Info'     },
  success:  { color: '#00ff88', bg: 'bg-status-online/10', border: 'border-status-online/30',icon: CheckCircle,   label: 'Success'  },
}

const DEMO_EXTRA_ALERTS = [
  { id: 'alert-4',  robot_id: 'robot-003', severity: 'warning',  message: 'High CPU load detected — 71% sustained for >5 minutes',             timestamp: new Date(Date.now() - 180000).toISOString(),   acknowledged: false },
  { id: 'alert-5',  robot_id: 'robot-005', severity: 'critical', message: 'Temperature overload — 68°C, exceeds safe operating threshold',       timestamp: new Date(Date.now() - 45000).toISOString(),    acknowledged: false },
  { id: 'alert-6',  robot_id: 'robot-005', severity: 'critical', message: 'Network timeout — latency 340ms, robot unresponsive',                 timestamp: new Date(Date.now() - 60000).toISOString(),    acknowledged: false },
  { id: 'alert-7',  robot_id: 'robot-002', severity: 'info',     message: 'Scheduled maintenance completed — all joints calibrated',             timestamp: new Date(Date.now() - 7200000).toISOString(),  acknowledged: true  },
  { id: 'alert-8',  robot_id: 'robot-001', severity: 'info',     message: 'Firmware update available: v3.4.2 — minor bug fixes',                 timestamp: new Date(Date.now() - 14400000).toISOString(), acknowledged: true  },
  { id: 'alert-9',  robot_id: 'robot-001', severity: 'success',  message: 'Task "Assemble components #3" completed successfully in 88 minutes',  timestamp: new Date(Date.now() - 1800000).toISOString(),  acknowledged: true  },
  { id: 'alert-10', robot_id: 'robot-003', severity: 'warning',  message: 'Battery at 52% — below recommended 60% for extended operations',     timestamp: new Date(Date.now() - 900000).toISOString(),   acknowledged: false },
  { id: 'alert-11', robot_id: 'robot-006', severity: 'warning',  message: 'Robot went offline unexpectedly — last heartbeat 24h ago',           timestamp: new Date(Date.now() - 86400000).toISOString(), acknowledged: false },
]

function AlertCard({ alert, onAcknowledge, onDismiss }) {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'flex gap-3 p-3 rounded-lg border transition-all',
        cfg.bg,
        cfg.border,
        alert.acknowledged && 'opacity-50'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={14} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-white leading-relaxed">{alert.message}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!alert.acknowledged && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
              >
                ACK
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-gray-600 hover:text-status-danger transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider"
            style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10` }}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-gray-600 font-mono">{alert.robot_id}</span>
          <span className="text-[10px] text-gray-600 flex items-center gap-1">
            <Clock size={8} /> {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
          </span>
          {alert.acknowledged && (
            <span className="text-[9px] text-gray-600 flex items-center gap-1">
              <CheckCircle size={8} className="text-status-online" /> Acknowledged
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function IncidentTimeline({ alerts }) {
  const sorted = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20)

  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white/8" />
      {sorted.map((alert, i) => {
        const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
        const Icon = cfg.icon
        return (
          <div key={alert.id} className="relative mb-4 last:mb-0">
            <div
              className="absolute -left-4 w-2 h-2 rounded-full border border-space-900 -translate-x-[3px] mt-1"
              style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }}
            />
            <div className="pl-3">
              <div className="flex items-center gap-2 mb-0.5">
                <Icon size={10} style={{ color: cfg.color }} />
                <span className="text-[10px] text-gray-500 font-mono">{format(new Date(alert.timestamp), 'HH:mm:ss')}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-600">{alert.robot_id}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AlertSystem() {
  const storeAlerts = useRobotStore((s) => s.alerts)
  const acknowledgeAlert = useRobotStore((s) => s.acknowledgeAlert)
  const clearUnreadAlerts = useRobotStore((s) => s.clearUnreadAlerts)

  const [dismissedIds, setDismissedIds] = useState(new Set())
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterAcknowledged, setFilterAcknowledged] = useState('all')
  const [activeView, setActiveView] = useState('feed')

  // Merge store alerts + demo extras
  const allAlerts = useMemo(() => {
    const storeIds = new Set(storeAlerts.map((a) => a.id))
    const extra = DEMO_EXTRA_ALERTS.filter((a) => !storeIds.has(a.id))
    return [...storeAlerts, ...extra].filter((a) => !dismissedIds.has(a.id))
  }, [storeAlerts, dismissedIds])

  const handleDismiss = (id) => setDismissedIds((prev) => new Set([...prev, id]))

  const filtered = useMemo(() => {
    let list = allAlerts
    if (filterSeverity !== 'all') list = list.filter((a) => a.severity === filterSeverity)
    if (filterAcknowledged === 'unacked') list = list.filter((a) => !a.acknowledged)
    if (filterAcknowledged === 'acked')   list = list.filter((a) => a.acknowledged)
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [allAlerts, filterSeverity, filterAcknowledged])

  const counts = useMemo(() => ({
    critical: allAlerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
    warning:  allAlerts.filter((a) => a.severity === 'warning'  && !a.acknowledged).length,
    info:     allAlerts.filter((a) => a.severity === 'info'     && !a.acknowledged).length,
    success:  allAlerts.filter((a) => a.severity === 'success'  && !a.acknowledged).length,
    unread:   allAlerts.filter((a) => !a.acknowledged).length,
  }), [allAlerts])

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { severity: 'critical', label: 'Critical', count: counts.critical },
          { severity: 'warning',  label: 'Warning',  count: counts.warning  },
          { severity: 'info',     label: 'Info',     count: counts.info     },
          { severity: 'success',  label: 'Success',  count: counts.success  },
        ].map(({ severity, label, count }) => {
          const cfg = SEVERITY_CONFIG[severity]
          const Icon = cfg.icon
          return (
            <motion.button
              key={severity}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setFilterSeverity(filterSeverity === severity ? 'all' : severity)}
              className={clsx('card p-3 text-left transition-all', filterSeverity === severity && 'border-opacity-60')}
              style={filterSeverity === severity ? { borderColor: cfg.color } : {}}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={12} style={{ color: cfg.color }} />
                {count > 0 && <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: cfg.color, color: '#000' }}>{count}</span>}
              </div>
              <p className="text-xl font-bold font-mono" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[10px] text-gray-500">{label} unread</p>
            </motion.button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/8">
          {['feed', 'timeline'].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                activeView === v ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/20' : 'text-gray-500 hover:text-white'
              )}
            >
              {v === 'feed' ? 'Alert Feed' : 'Timeline'}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/8">
          {[
            { key: 'all',    label: 'All' },
            { key: 'unacked',label: 'Unread' },
            { key: 'acked',  label: 'Acknowledged' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterAcknowledged(key)}
              className={clsx(
                'px-2 py-1 rounded-md text-[10px] font-medium transition-all',
                filterAcknowledged === key ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-gray-600">{filtered.length} alerts</span>
          <button
            onClick={clearUnreadAlerts}
            className="btn-cyber flex items-center gap-1.5 py-1.5 text-xs"
          >
            <CheckCircle size={11} /> Ack All
          </button>
        </div>
      </div>

      {/* Views */}
      {activeView === 'feed' && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="panel p-12 text-center">
              <BellOff size={32} className="mx-auto text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">No alerts matching your filters</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onDismiss={handleDismiss}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {activeView === 'timeline' && (
        <div className="panel p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={13} className="text-cyan-neon" /> Incident Timeline
          </h3>
          <IncidentTimeline alerts={allAlerts} />
        </div>
      )}
    </div>
  )
}
