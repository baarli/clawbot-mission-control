import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Activity, Battery, Thermometer, Wifi, Cpu, Zap, Clock, Download } from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { format } from 'date-fns'
import clsx from 'clsx'

const METRICS = [
  { key: 'battery',         label: 'Battery',   unit: '%',  color: '#00ff88', icon: Battery },
  { key: 'temperature',     label: 'Temp',      unit: '°C', color: '#ffaa00', icon: Thermometer },
  { key: 'cpu_load',        label: 'CPU',       unit: '%',  color: '#7c3aed', icon: Cpu },
  { key: 'network_latency', label: 'Latency',   unit: 'ms', color: '#00d4ff', icon: Wifi },
]

function CyberTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-lg border border-cyan-neon/20 text-xs shadow-neon-cyan">
      <p className="text-gray-400 mb-1 font-mono text-[10px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono font-medium">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit, color, min, max, avg }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="mb-3">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{value}</span>
        <span className="text-xs text-gray-600 ml-1">{unit}</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[['Min', min], ['Max', max], ['Avg', avg]].map(([l, v]) => (
          <div key={l} className="text-center py-1 rounded bg-white/3">
            <p className="text-[9px] text-gray-600">{l}</p>
            <p className="text-[10px] font-mono text-white">{typeof v === 'number' ? v.toFixed(1) : '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TelemetryTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/8">
            {['Timestamp', 'Battery', 'Temp', 'CPU', 'Latency', 'Pos X', 'Pos Y'].map((h) => (
              <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(-50).reverse().map((row, i) => (
            <tr key={i} className="border-b border-white/4 hover:bg-white/2 transition-colors">
              <td className="py-2 px-3 font-mono text-gray-500 text-[10px] whitespace-nowrap">
                {format(new Date(row.timestamp), 'HH:mm:ss')}
              </td>
              <td className="py-2 px-3 font-mono text-status-online">{row.battery?.toFixed(1)}%</td>
              <td className={clsx('py-2 px-3 font-mono', row.temperature > 55 ? 'text-status-danger' : 'text-status-warning')}>
                {row.temperature?.toFixed(1)}°C
              </td>
              <td className={clsx('py-2 px-3 font-mono', row.cpu_load > 80 ? 'text-status-danger' : 'text-violet-400')}>
                {row.cpu_load?.toFixed(1)}%
              </td>
              <td className={clsx('py-2 px-3 font-mono', row.network_latency > 100 ? 'text-status-danger' : 'text-cyan-neon')}>
                {row.network_latency?.toFixed(1)}ms
              </td>
              <td className="py-2 px-3 font-mono text-gray-400">{row.position?.x?.toFixed(2)}</td>
              <td className="py-2 px-3 font-mono text-gray-400">{row.position?.y?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TelemetryCenter() {
  const [activeView, setActiveView] = useState('charts')
  const [timeWindow, setTimeWindow] = useState(30)
  const history = useRobotStore((s) => s.telemetryHistory)
  const live = useRobotStore((s) => s.liveTelemetry)

  const chartData = useMemo(() =>
    history.slice(-timeWindow).map((t) => ({
      t: format(new Date(t.timestamp), 'HH:mm:ss'),
      battery: parseFloat((t.battery || 0).toFixed(2)),
      temp: parseFloat((t.temperature || 0).toFixed(2)),
      cpu: parseFloat((t.cpu_load || 0).toFixed(2)),
      latency: parseFloat((t.network_latency || 0).toFixed(2)),
    })), [history, timeWindow])

  const stats = useMemo(() => {
    if (!history.length) return {}
    const compute = (key) => {
      const vals = history.map((h) => h[key] || 0)
      return {
        min: Math.min(...vals),
        max: Math.max(...vals),
        avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      }
    }
    return {
      battery: compute('battery'),
      temperature: compute('temperature'),
      cpu_load: compute('cpu_load'),
      network_latency: compute('network_latency'),
    }
  }, [history])

  const radarData = [
    { metric: 'Battery', value: live?.battery || 0, max: 100 },
    { metric: 'CPU', value: 100 - (live?.cpu_load || 0), max: 100 },
    { metric: 'Temp OK', value: Math.max(0, 100 - (live?.temperature - 20) * 2), max: 100 },
    { metric: 'Network', value: Math.max(0, 100 - live?.network_latency), max: 100 },
    { metric: 'Pressure', value: Math.min(100, (live?.claw_pressure || 0) / 10), max: 100 },
  ]

  const exportCSV = () => {
    const rows = [
      ['timestamp', 'battery', 'temperature', 'cpu_load', 'network_latency', 'position_x', 'position_y'],
      ...history.map((h) => [
        h.timestamp, h.battery?.toFixed(2), h.temperature?.toFixed(2),
        h.cpu_load?.toFixed(2), h.network_latency?.toFixed(2),
        h.position?.x?.toFixed(2), h.position?.y?.toFixed(2),
      ])
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `telemetry-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/8">
          {['charts', 'table', 'health'].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 capitalize',
                activeView === v ? 'bg-cyan-neon/15 text-cyan-neon border border-cyan-neon/20' : 'text-gray-500 hover:text-white'
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/8">
          {[10, 30, 60, 120].map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={clsx(
                'px-2 py-1 rounded-md text-[10px] font-mono transition-all',
                timeWindow === w ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-white'
              )}
            >
              {w}s
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-gray-600">{history.length} samples</span>
          <button onClick={exportCSV} className="btn-cyber flex items-center gap-1.5 py-1.5 text-xs">
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Charts view ── */}
      {activeView === 'charts' && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <motion.div key={m.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <StatCard
                  icon={m.icon}
                  label={m.label}
                  unit={m.unit}
                  color={m.color}
                  value={live?.[m.key]?.toFixed(1) || '—'}
                  min={stats[m.key]?.min}
                  max={stats[m.key]?.max}
                  avg={stats[m.key]?.avg}
                />
              </motion.div>
            ))}
          </div>

          {/* Main charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="panel p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <m.icon size={12} style={{ color: m.color }} />
                    {m.label}
                  </h3>
                  <span className="text-xs font-mono font-bold" style={{ color: m.color }}>
                    {live?.[m.key]?.toFixed(1)}{m.unit}
                  </span>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`g-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={m.color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="t" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CyberTooltip />} />
                      <Area
                        type="monotone"
                        dataKey={m.key === 'battery' ? 'battery' : m.key === 'temperature' ? 'temp' : m.key === 'cpu_load' ? 'cpu' : 'latency'}
                        name={m.label}
                        stroke={m.color}
                        strokeWidth={1.5}
                        fill={`url(#g-${m.key})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Table view ── */}
      {activeView === 'table' && (
        <div className="panel overflow-hidden">
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity size={14} className="text-cyan-neon" /> Raw Telemetry Data
            </h3>
            <span className="tag-cyan">{history.length} records</span>
          </div>
          <TelemetryTable data={history} />
        </div>
      )}

      {/* ── Health radar ── */}
      {activeView === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={14} className="text-cyan-neon" /> System Health Radar
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)' }} />
                  <Radar name="Health" dataKey="value" stroke="#00d4ff" fill="rgba(0,212,255,0.15)" strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="panel p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Joint Status</h3>
            <div className="space-y-3">
              {Object.entries(live?.joint_positions || { shoulder: 45, elbow: -30, wrist: 15, claw: 72 }).map(([joint, val]) => (
                <div key={joint}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 capitalize">{joint}</span>
                    <span className="font-mono text-cyan-neon">{val?.toFixed(1)}°</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill-cyan" style={{ width: `${((val + 90) / 180) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-white/3 border border-white/6">
              <p className="text-xs text-gray-400 mb-1">Claw Pressure</p>
              <p className="text-xl font-mono font-bold text-cyan-neon">{live?.claw_pressure?.toFixed(0) || 450}<span className="text-sm text-gray-500 ml-1">N</span></p>
              <div className="progress-track mt-2">
                <div className="progress-fill-cyan" style={{ width: `${Math.min(100, (live?.claw_pressure || 0) / 12)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
