import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  Battery, Thermometer, Wifi, Cpu, Activity, Clock,
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Zap, Crosshair, Radio, Eye, Terminal, ArrowUpRight
} from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CyberTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-lg border border-cyan-neon/20 text-xs">
      <p className="text-gray-400 mb-1 font-mono">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono font-medium">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.name === 'battery' ? '%' : p.name === 'temp' ? '°C' : p.name === 'latency' ? 'ms' : '%'}
        </p>
      ))}
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, unit, sub, color = 'cyan', trend, sparkData, sparkKey }) {
  const colorMap = {
    cyan: { text: 'text-cyan-neon', bg: 'bg-cyan-neon/10', border: 'border-cyan-neon/20', stroke: '#00d4ff' },
    green: { text: 'text-status-online', bg: 'bg-status-online/10', border: 'border-status-online/20', stroke: '#00ff88' },
    amber: { text: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/20', stroke: '#ffaa00' },
    red: { text: 'text-status-danger', bg: 'bg-status-danger/10', border: 'border-status-danger/20', stroke: '#ff3366' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', stroke: '#9d5ff0' },
  }
  const c = colorMap[color] || colorMap.cyan

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={clsx('card p-4 border', c.border)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon size={15} className={c.text} />
        </div>
        {trend !== undefined && (
          <div className={clsx('flex items-center gap-0.5 text-[10px] font-mono', trend >= 0 ? 'text-status-online' : 'text-status-danger')}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mb-1">
        <span className={clsx('text-2xl font-bold font-mono', c.text)}>{value}</span>
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}

      {/* Mini sparkline */}
      {sparkData && sparkData.length > 2 && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={sparkKey}
                stroke={c.stroke}
                strokeWidth={1.5}
                fill={`url(#spark-${label})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}

// ─── Radar-style position widget ─────────────────────────────────────────────
function PositionRadar({ position }) {
  const cx = 80, cy = 80, r = 60
  const px = cx + (position?.x || 0) * 2.5
  const py = cy - (position?.y || 0) * 2.5

  return (
    <div className="flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0.02)" />
          </radialGradient>
        </defs>

        {/* Rings */}
        {[20, 40, 60].map((ring) => (
          <circle key={ring} cx={cx} cy={cy} r={ring}
            fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" strokeDasharray="2 4" />
        ))}

        {/* Crosshairs */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="rgba(0,212,255,0.1)" strokeWidth="0.5" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="rgba(0,212,255,0.1)" strokeWidth="0.5" />

        {/* Radar fill */}
        <circle cx={cx} cy={cy} r={r} fill="url(#radarBg)" />

        {/* Sweep animation */}
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} className="animate-radar-sweep">
          <path
            d={`M ${cx} ${cy} L ${cx} ${cy - r}`}
            stroke="rgba(0,212,255,0.5)" strokeWidth="1.5"
          />
          <path
            d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * Math.sin(Math.PI / 6)} ${cy - r * Math.cos(Math.PI / 6)}`}
            fill="rgba(0,212,255,0.05)" stroke="none"
          />
        </g>

        {/* Robot position dot */}
        <circle cx={px} cy={py} r={5} fill="#00d4ff" opacity={0.9}>
          <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={px} cy={py} r={12} fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="1">
          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Labels */}
        <text x={cx} y={14} textAnchor="middle" fill="rgba(0,212,255,0.4)" fontSize="8" fontFamily="monospace">N</text>
        <text x={cx} y={152} textAnchor="middle" fill="rgba(0,212,255,0.4)" fontSize="8" fontFamily="monospace">S</text>
        <text x={10} y={cy + 3} textAnchor="middle" fill="rgba(0,212,255,0.4)" fontSize="8" fontFamily="monospace">W</text>
        <text x={152} y={cy + 3} textAnchor="middle" fill="rgba(0,212,255,0.4)" fontSize="8" fontFamily="monospace">E</text>
      </svg>
    </div>
  )
}

// ─── Activity Timeline ─────────────────────────────────────────────────────
function ActivityTimeline() {
  const commandHistory = useRobotStore((s) => s.commandHistory)
  const alerts = useRobotStore((s) => s.alerts)
  const voiceLogs = useRobotStore((s) => s.voiceLogs)

  const events = useMemo(() => {
    const all = [
      ...commandHistory.slice(0, 5).map((c) => ({ ...c, type: 'command' })),
      ...alerts.slice(0, 3).map((a) => ({ ...a, type: 'alert' })),
      ...voiceLogs.slice(0, 2).map((v) => ({ ...v, type: 'voice' })),
    ]
    return all.sort((a, b) =>
      new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0)
    ).slice(0, 8)
  }, [commandHistory, alerts, voiceLogs])

  const items = events.length > 0 ? events : [
    { id: 'seed-1', type: 'alert', severity: 'info', message: 'System initialized — all systems nominal', timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: 'seed-2', type: 'command', payload: { type: 'HOME' }, created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 'seed-3', type: 'alert', severity: 'success', message: 'Telemetry stream established', timestamp: new Date(Date.now() - 900000).toISOString() },
  ]

  return (
    <div className="space-y-2">
      {items.map((event, i) => {
        const ts = event.timestamp || event.created_at || new Date().toISOString()
        return (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3 items-start"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center flex-shrink-0 mt-1">
              <div className={clsx('w-1.5 h-1.5 rounded-full', {
                'bg-status-danger': event.type === 'alert' && event.severity === 'critical',
                'bg-status-warning': event.type === 'alert' && event.severity === 'warning',
                'bg-cyan-neon': event.type === 'command',
                'bg-violet-400': event.type === 'voice',
                'bg-status-online': event.type === 'alert' && (event.severity === 'info' || event.severity === 'success'),
              })} />
              {i < items.length - 1 && <div className="w-px flex-1 bg-white/5 mt-1 mb-1 min-h-[10px]" />}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-xs text-gray-300 leading-relaxed truncate">
                {event.type === 'command'
                  ? `Command: ${event.payload?.type || 'UNKNOWN'}`
                  : event.type === 'voice'
                  ? `Voice: "${event.transcript?.slice(0, 40) || 'command received'}"`
                  : event.message?.slice(0, 60) || 'System event'
                }
              </p>
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                {format(new Date(ts), 'HH:mm:ss')}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Joint positions widget ────────────────────────────────────────────────
function JointPositions({ joints }) {
  const joints_data = joints || { shoulder: 45, elbow: -30, wrist: 15, claw: 72 }
  const items = [
    { label: 'Shoulder', value: joints_data.shoulder, min: -90, max: 90, color: '#00d4ff' },
    { label: 'Elbow', value: joints_data.elbow, min: -60, max: 120, color: '#7c3aed' },
    { label: 'Wrist', value: joints_data.wrist, min: -45, max: 90, color: '#00ff88' },
    { label: 'Claw', value: joints_data.claw, min: 0, max: 100, color: '#ffaa00' },
  ]
  return (
    <div className="space-y-3">
      {items.map(({ label, value, min, max, color }) => {
        const pct = ((value - min) / (max - min)) * 100
        return (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-mono" style={{ color }}>{value?.toFixed(1)}°</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill rounded-full transition-all duration-700"
                style={{ width: `${Math.max(2, Math.min(100, pct))}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const telemetry = useRobotStore((s) => s.liveTelemetry)
  const history = useRobotStore((s) => s.telemetryHistory)
  const robots = useRobotStore((s) => s.robots)
  const activeRobotId = useRobotStore((s) => s.activeRobotId)
  const robot = robots.find((r) => r.id === activeRobotId) || robots[0]
  const tasks = useRobotStore((s) => s.tasks)
  const navigate = useNavigate()

  const chartData = useMemo(() =>
    history.slice(-30).map((t, i) => ({
      t: format(new Date(t.timestamp), 'HH:mm:ss'),
      battery: parseFloat(t.battery?.toFixed(1)),
      temp: parseFloat(t.temperature?.toFixed(1)),
      cpu: parseFloat(t.cpu_load?.toFixed(1)),
      latency: parseFloat(t.network_latency?.toFixed(1)),
    })), [history])

  const pendingTasks = tasks.filter((t) => t.status === 'in-progress' || t.status === 'pending').length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const battery = robot?.battery || telemetry?.battery || 0
  const batteryColor = battery < 20 ? 'red' : battery < 50 ? 'amber' : 'green'

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 lg:p-5 space-y-4">

      {/* ── Hero status bar ── */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {[
          { icon: Battery, label: 'Battery', value: `${Math.round(battery)}`, unit: '%', color: batteryColor, sparkData: chartData, sparkKey: 'battery' },
          { icon: Thermometer, label: 'Temperature', value: `${Math.round(telemetry?.temperature || 38)}`, unit: '°C', color: telemetry?.temperature > 50 ? 'red' : 'cyan', sparkData: chartData, sparkKey: 'temp' },
          { icon: Cpu, label: 'CPU Load', value: `${Math.round(telemetry?.cpu_load || 32)}`, unit: '%', color: telemetry?.cpu_load > 80 ? 'red' : 'violet', sparkData: chartData, sparkKey: 'cpu' },
          { icon: Wifi, label: 'Latency', value: `${Math.round(telemetry?.network_latency || 12)}`, unit: 'ms', color: telemetry?.network_latency > 100 ? 'red' : 'cyan', sparkData: chartData, sparkKey: 'latency' },
          { icon: CheckCircle, label: 'Tasks Done', value: `${completedTasks}`, unit: '', color: 'green', sub: `${pendingTasks} active` },
          { icon: Zap, label: 'Claw Pressure', value: `${Math.round(telemetry?.claw_pressure || 450)}`, unit: 'N', color: 'cyan' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-[160px] flex-shrink-0"
          >
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Telemetry chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 panel p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity size={14} className="text-cyan-neon" />
                Live Telemetry
              </h2>
              <p className="text-[10px] text-gray-600 mt-0.5">Last 30 samples · 2s intervals</p>
            </div>
            <div className="flex gap-3">
              {[
                { key: 'battery', color: '#00ff88', label: 'Battery' },
                { key: 'temp', color: '#ffaa00', label: 'Temp' },
                { key: 'cpu', color: '#7c3aed', label: 'CPU' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-[10px] text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  {[
                    { id: 'battery', color: '#00ff88' },
                    { id: 'temp', color: '#ffaa00' },
                    { id: 'cpu', color: '#7c3aed' },
                  ].map(({ id, color }) => (
                    <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CyberTooltip />} />
                <Area type="monotone" dataKey="battery" name="battery" stroke="#00ff88" strokeWidth={1.5} fill="url(#grad-battery)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="temp" name="temp" stroke="#ffaa00" strokeWidth={1.5} fill="url(#grad-temp)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="cpu" name="cpu" stroke="#7c3aed" strokeWidth={1.5} fill="url(#grad-cpu)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Position radar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="panel p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Crosshair size={14} className="text-cyan-neon" />
              Position
            </h2>
            <span className="tag-cyan">LIVE</span>
          </div>
          <PositionRadar position={telemetry?.position} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="glass-card rounded-lg p-2 text-center">
              <p className="text-[9px] text-gray-600 uppercase">X Pos</p>
              <p className="text-sm font-mono text-cyan-neon">{(telemetry?.position?.x || 0).toFixed(2)}m</p>
            </div>
            <div className="glass-card rounded-lg p-2 text-center">
              <p className="text-[9px] text-gray-600 uppercase">Y Pos</p>
              <p className="text-sm font-mono text-cyan-neon">{(telemetry?.position?.y || 0).toFixed(2)}m</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Second row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Joint positions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel p-4"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Radio size={14} className="text-cyan-neon" />
            Joint Positions
          </h2>
          <JointPositions joints={telemetry?.joint_positions} />
        </motion.div>

        {/* ── Activity timeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="panel p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={14} className="text-cyan-neon" />
              Activity
            </h2>
            <button onClick={() => navigate('/logs')} className="text-[10px] text-cyan-neon/60 hover:text-cyan-neon flex items-center gap-0.5 transition-colors">
              View all <ArrowUpRight size={10} />
            </button>
          </div>
          <ActivityTimeline />
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="panel p-4"
        >
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Terminal size={14} className="text-cyan-neon" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Emergency Stop', action: () => navigate('/commands'), icon: '⚠', color: 'btn-danger' },
              { label: 'Command Center', action: () => navigate('/commands'), icon: '🎮', color: 'btn-cyber-primary' },
              { label: 'View Telemetry', action: () => navigate('/telemetry'), icon: '📡', color: 'btn-cyber' },
              { label: 'Manage Tasks', action: () => navigate('/tasks'), icon: '📋', color: 'btn-cyber' },
              { label: 'Voice Control', action: () => navigate('/voice'), icon: '🎙', color: 'btn-cyber' },
            ].map(({ label, action, icon, color }) => (
              <button key={label} onClick={action} className={`${color} w-full text-left flex items-center gap-2.5 py-2 px-3`}>
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Status footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4 px-4 py-2.5 rounded-lg border border-white/5 bg-white/2"
      >
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-online animate-pulse-slow" />
          <span className="text-[11px] text-gray-400">Robot: <span className="text-white font-medium">{robot?.name}</span></span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[11px] text-gray-500 font-mono">FW: {robot?.firmware_version || '3.4.1'}</span>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[11px] text-gray-500 font-mono">IP: {robot?.ip_address || '192.168.1.45'}</span>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[11px] text-gray-500">{robot?.location || 'Lab 1 — Bay A'}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-[11px] text-gray-600">
          <Eye size={10} />
          <span>Monitoring active · 2s refresh</span>
        </div>
      </motion.div>
    </div>
  )
}
