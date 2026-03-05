import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Download, Search, Filter, ChevronDown, Clock, CheckCircle, XCircle, AlertCircle, Info, Zap, Mic, Activity, BarChart3 } from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { format, formatDistanceToNow, subHours, isAfter } from 'date-fns'
import clsx from 'clsx'

const LOG_TYPE_CONFIG = {
  command:   { icon: Zap,          color: '#00d4ff', label: 'Command'   },
  task:      { icon: Activity,     color: '#7c3aed', label: 'Task'      },
  alert:     { icon: AlertCircle,  color: '#ffaa00', label: 'Alert'     },
  voice:     { icon: Mic,          color: '#00ff88', label: 'Voice'     },
  system:    { icon: Terminal,     color: '#555',    label: 'System'    },
  telemetry: { icon: BarChart3,    color: '#00ff88', label: 'Telemetry' },
}

const STATUS_CONFIG = {
  success:   { color: '#00ff88', icon: CheckCircle },
  completed: { color: '#00ff88', icon: CheckCircle },
  failed:    { color: '#ff4444', icon: XCircle     },
  error:     { color: '#ff4444', icon: XCircle     },
  warning:   { color: '#ffaa00', icon: AlertCircle },
  info:      { color: '#00d4ff', icon: Info        },
  sent:      { color: '#7c3aed', icon: Zap         },
  executed:  { color: '#00ff88', icon: CheckCircle },
  queued:    { color: '#555',    icon: Clock       },
}

function buildLogEntry(type, status, message, timestamp, extra = {}) {
  return { id: `log-${Math.random().toString(36).slice(2)}`, type, status, message, timestamp, ...extra }
}

function generateDemoLogs() {
  const now = Date.now()
  return [
    buildLogEntry('system',   'info',      'Mission Control System initialized',               new Date(now - 86400000).toISOString(), { robot_id: 'system' }),
    buildLogEntry('system',   'info',      'Supabase realtime channel opened',                 new Date(now - 86390000).toISOString(), { robot_id: 'system' }),
    buildLogEntry('command',  'executed',  'CONNECT — robot-001 registered at 192.168.1.45',  new Date(now - 86380000).toISOString(), { robot_id: 'robot-001', payload: { ip: '192.168.1.45' } }),
    buildLogEntry('telemetry','info',      'Telemetry stream started at 2s intervals',         new Date(now - 86370000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('task',     'completed', 'Task "Inspect Zone Alpha" completed (45m)',        new Date(now - 76800000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('task',     'completed', 'Task "Assemble components #3" completed (88m)',   new Date(now - 72000000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('command',  'executed',  'CLAW_OPEN — gripper opened to 100%',              new Date(now - 68400000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('alert',    'warning',   'Battery level fell below 80%',                    new Date(now - 64800000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('voice',    'success',   'Voice: "open the claw" → CLAW_OPEN executed',     new Date(now - 61200000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('command',  'executed',  'MOVE_FORWARD — speed 0.5, distance 1.2m',        new Date(now - 57600000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('task',     'failed',    'Task "Emergency cooldown" FAILED — sensor fault', new Date(now - 54000000).toISOString(), { robot_id: 'robot-001', error: 'Temperature sensor failure' }),
    buildLogEntry('alert',    'error',     'Critical: Task failure — temperature sensor',     new Date(now - 54000000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('system',   'info',      'Auto-recovery triggered — cooling cycle started', new Date(now - 53000000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('command',  'executed',  'DIAGNOSTICS — full system scan completed',        new Date(now - 50400000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('voice',    'success',   'Voice: "run diagnostics" → DIAGNOSTICS queued',  new Date(now - 50000000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('command',  'executed',  'ROTATE_LEFT — 90° rotation completed',            new Date(now - 46800000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('command',  'executed',  'CLAW_CLOSE — gripper closed at 450N',             new Date(now - 43200000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('task',     'completed', 'Task "Navigate to Station 2" completed (58m)',   new Date(now - 39600000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('alert',    'info',      'Firmware update v3.4.2 available',               new Date(now - 36000000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('system',   'info',      'Scheduled maintenance window triggered',         new Date(now - 32400000).toISOString(), { robot_id: 'system' }),
    buildLogEntry('command',  'executed',  'HOME_POSITION — robot returned to home',         new Date(now - 28800000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('voice',    'success',   'Voice: "go home" → HOME_POSITION dispatched',   new Date(now - 28000000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('task',     'completed', 'Task "Battery recharge cycle" completed (3h)',  new Date(now - 14400000).toISOString(), { robot_id: 'robot-001' }),
    buildLogEntry('command',  'sent',      'PICK_OBJECT — object A, gripper auto',           new Date(now - 7200000).toISOString(),  { robot_id: 'robot-001' }),
    buildLogEntry('task',     'completed', 'Task "Pick up object A" started',               new Date(now - 7200000).toISOString(),  { robot_id: 'robot-001' }),
    buildLogEntry('alert',    'info',      'Telemetry sync established at 2s intervals',    new Date(now - 3600000).toISOString(),  { robot_id: 'robot-001' }),
    buildLogEntry('alert',    'warning',   'Battery below 80% — schedule recharge soon',   new Date(now - 3600000).toISOString(),  { robot_id: 'robot-001' }),
    buildLogEntry('command',  'executed',  'STATUS_REPORT — full briefing generated',       new Date(now - 1800000).toISOString(),  { robot_id: 'robot-001' }),
    buildLogEntry('voice',    'success',   'Voice: "status report" → STATUS_REPORT called', new Date(now - 1800000).toISOString(),  { robot_id: 'robot-001' }),
    buildLogEntry('telemetry','info',      'Telemetry snapshot exported (342 records)',      new Date(now - 900000).toISOString(),   { robot_id: 'robot-001' }),
    buildLogEntry('system',   'info',      'Health check passed — all systems nominal',     new Date(now - 300000).toISOString(),   { robot_id: 'system' }),
    buildLogEntry('command',  'executed',  'SPEED_SET — operating speed set to 0.7',        new Date(now - 120000).toISOString(),   { robot_id: 'robot-001' }),
  ]
}

const DEMO_LOGS = generateDemoLogs()

export default function MissionLogs() {
  const commandHistory = useRobotStore((s) => s.commandHistory)
  const tasks          = useRobotStore((s) => s.tasks)
  const alerts         = useRobotStore((s) => s.alerts)
  const voiceLogs      = useRobotStore((s) => s.voiceLogs)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('24h')

  // Build unified log from all sources + demo
  const allLogs = useMemo(() => {
    const live = [
      ...commandHistory.map((c) => buildLogEntry('command', c.status || 'sent', `${c.command} — ${c.description || ''}`.trim(), c.created_at, { robot_id: c.robot_id || 'robot-001', payload: c.payload })),
      ...tasks.filter((t) => t.status === 'completed' || t.status === 'failed').map((t) => buildLogEntry('task', t.status, `Task "${t.title}" ${t.status}`, t.updated_at, { robot_id: t.robot_id, error: t.error })),
      ...alerts.map((a) => buildLogEntry('alert', a.severity, a.message, a.timestamp, { robot_id: a.robot_id })),
      ...voiceLogs.map((v) => buildLogEntry('voice', 'success', `Voice: "${v.transcript}" → ${v.command}`, v.timestamp, { robot_id: 'robot-001' })),
    ]
    const liveIds = new Set(live.map((l) => l.message + l.timestamp))
    const extra = DEMO_LOGS.filter((d) => !liveIds.has(d.message + d.timestamp))
    return [...live, ...extra].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [commandHistory, tasks, alerts, voiceLogs])

  const filtered = useMemo(() => {
    let list = allLogs
    const cutoff = {
      '1h':  subHours(new Date(), 1),
      '6h':  subHours(new Date(), 6),
      '24h': subHours(new Date(), 24),
      '7d':  subHours(new Date(), 168),
      'all': new Date(0),
    }[timeFilter] || new Date(0)
    list = list.filter((l) => isAfter(new Date(l.timestamp), cutoff))
    if (typeFilter !== 'all') list = list.filter((l) => l.type === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((l) => l.message.toLowerCase().includes(q) || (l.robot_id || '').includes(q))
    }
    return list
  }, [allLogs, typeFilter, timeFilter, search])

  const typeCounts = useMemo(() => allLogs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc }, {}), [allLogs])

  const exportCSV = () => {
    const rows = [
      ['timestamp', 'type', 'status', 'robot_id', 'message'],
      ...filtered.map((l) => [l.timestamp, l.type, l.status, l.robot_id || '', `"${l.message.replace(/"/g, '""')}"`]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mission-logs-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-4">

      {/* Type summary pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
            typeFilter === 'all'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'
          )}
        >
          All ({allLogs.length})
        </button>
        {Object.entries(LOG_TYPE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? 'all' : key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5',
                typeFilter === key
                  ? 'border-opacity-50 text-white'
                  : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'
              )}
              style={typeFilter === key ? { borderColor: cfg.color, background: `${cfg.color}15`, color: cfg.color } : {}}
            >
              <Icon size={10} />
              {cfg.label} ({typeCounts[key] || 0})
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-cyber w-full pl-8 py-1.5 text-xs"
          />
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/8">
          {['1h', '6h', '24h', '7d', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={clsx(
                'px-2 py-1 rounded-md text-[10px] font-mono transition-all',
                timeFilter === t ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600">{filtered.length} entries</span>
          <button onClick={exportCSV} className="btn-cyber flex items-center gap-1.5 py-1.5 text-xs">
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      {/* Log terminal */}
      <div className="panel overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/6 flex items-center gap-2">
          <Terminal size={12} className="text-cyan-neon" />
          <span className="text-xs font-semibold text-white">Mission Log</span>
          <div className="ml-auto flex gap-1">
            {['red', 'yellow', 'green'].map((c) => (
              <div key={c} className={`w-2 h-2 rounded-full bg-${c}-500 opacity-60`} />
            ))}
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto no-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Terminal size={28} className="mx-auto text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">No logs match your filters</p>
            </div>
          ) : (
            filtered.map((log, i) => {
              const typeCfg = LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.system
              const statusCfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.info
              const TypeIcon = typeCfg.icon
              const StatusIcon = statusCfg.icon
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                  className="flex items-start gap-3 px-4 py-2.5 border-b border-white/4 hover:bg-white/2 transition-colors group"
                >
                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-gray-600 whitespace-nowrap flex-shrink-0 mt-0.5 w-16">
                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                  </span>
                  {/* Type badge */}
                  <div
                    className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0"
                    style={{ color: typeCfg.color, borderColor: `${typeCfg.color}30`, background: `${typeCfg.color}10` }}
                  >
                    <TypeIcon size={8} />
                    {typeCfg.label.toUpperCase()}
                  </div>
                  {/* Status icon */}
                  <StatusIcon size={11} style={{ color: statusCfg.color }} className="flex-shrink-0 mt-0.5" />
                  {/* Message */}
                  <span className="text-xs text-gray-300 flex-1 font-mono leading-relaxed">{log.message}</span>
                  {/* Robot ID */}
                  <span className="text-[10px] text-gray-700 font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {log.robot_id || '—'}
                  </span>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
