import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Battery, Thermometer, Wifi, MapPin, Clock, Activity, Plus, ChevronDown, ChevronUp, Circle } from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { format, formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const STATUS_CONFIG = {
  online:      { color: '#00ff88', label: 'Online',      dot: 'bg-status-online'  },
  idle:        { color: '#00d4ff', label: 'Idle',        dot: 'bg-cyan-neon'      },
  busy:        { color: '#ffaa00', label: 'Busy',        dot: 'bg-status-warning' },
  error:       { color: '#ff4444', label: 'Error',       dot: 'bg-status-danger'  },
  offline:     { color: '#555',    label: 'Offline',     dot: 'bg-gray-600'       },
  maintenance: { color: '#7c3aed', label: 'Maintenance', dot: 'bg-violet-neon'    },
}

const DEMO_FLEET = [
  { id: 'robot-001', name: 'ClawBot Alpha',  model: 'KimiClaw MK-III', status: 'online',      battery: 78, temperature: 38, cpu_load: 42, network_latency: 12, location: 'Lab 1 — Bay A', ip_address: '192.168.1.45', firmware_version: '3.4.1', serial_number: 'KB-2024-001', last_seen: new Date(Date.now() - 5000).toISOString(),  uptime: 14400, tasks_completed: 142, tasks_failed: 3  },
  { id: 'robot-002', name: 'ClawBot Beta',   model: 'KimiClaw MK-III', status: 'idle',        battery: 94, temperature: 31, cpu_load: 8,  network_latency: 9,  location: 'Lab 1 — Bay B', ip_address: '192.168.1.46', firmware_version: '3.4.1', serial_number: 'KB-2024-002', last_seen: new Date(Date.now() - 2000).toISOString(),  uptime: 86400, tasks_completed: 89,  tasks_failed: 1  },
  { id: 'robot-003', name: 'ClawBot Gamma',  model: 'KimiClaw MK-IV',  status: 'busy',        battery: 52, temperature: 47, cpu_load: 71, network_latency: 22, location: 'Lab 2 — Bay C', ip_address: '192.168.1.47', firmware_version: '3.5.0', serial_number: 'KB-2024-003', last_seen: new Date(Date.now() - 1000).toISOString(),  uptime: 3600,  tasks_completed: 31,  tasks_failed: 0  },
  { id: 'robot-004', name: 'ClawBot Delta',  model: 'KimiClaw MK-II',  status: 'maintenance', battery: 100,temperature: 25, cpu_load: 3,  network_latency: 0,  location: 'Maintenance Bay', ip_address: '192.168.1.48', firmware_version: '3.3.2', serial_number: 'KB-2023-004', last_seen: new Date(Date.now() - 300000).toISOString(), uptime: 0,     tasks_completed: 512, tasks_failed: 12 },
  { id: 'robot-005', name: 'ClawBot Epsilon',model: 'KimiClaw MK-IV',  status: 'error',       battery: 18, temperature: 68, cpu_load: 95, network_latency: 340,location: 'Lab 3 — Bay A', ip_address: '192.168.1.49', firmware_version: '3.5.0', serial_number: 'KB-2024-005', last_seen: new Date(Date.now() - 45000).toISOString(), uptime: 7200,  tasks_completed: 7,   tasks_failed: 5  },
  { id: 'robot-006', name: 'ClawBot Zeta',   model: 'KimiClaw MK-III', status: 'offline',     battery: 0,  temperature: 22, cpu_load: 0,  network_latency: 0,  location: 'Storage',        ip_address: '—',             firmware_version: '3.4.0', serial_number: 'KB-2023-006', last_seen: new Date(Date.now() - 86400000).toISOString(),uptime: 0,     tasks_completed: 203, tasks_failed: 7  },
]

function formatUptime(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function MiniBar({ value, max = 100, color }) {
  return (
    <div className="progress-track w-16">
      <div className="progress-fill-cyan" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  )
}

function StatusDot({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  return (
    <span className="relative flex h-2 w-2">
      {(status === 'online' || status === 'busy') && (
        <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', cfg.dot)} />
      )}
      <span className={clsx('relative inline-flex rounded-full h-2 w-2', cfg.dot)} />
    </span>
  )
}

function RobotCard({ robot, isActive, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[robot.status] || STATUS_CONFIG.offline

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'panel overflow-hidden cursor-pointer transition-all duration-200',
        isActive ? 'border-cyan-neon/40 shadow-neon-cyan' : 'hover:border-white/15',
        robot.status === 'error' && 'border-status-danger/30'
      )}
      onClick={() => onSelect(robot.id)}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusDot status={robot.status} />
            <div>
              <h3 className="text-sm font-semibold text-white">{robot.name}</h3>
              <p className="text-[10px] text-gray-500">{robot.model} · {robot.serial_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}12` }}
            >
              {cfg.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              className="text-gray-600 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Battery,     val: `${robot.battery}%`,            color: robot.battery < 20 ? '#ff4444' : '#00ff88' },
            { icon: Thermometer, val: `${robot.temperature}°C`,       color: robot.temperature > 55 ? '#ff4444' : '#ffaa00' },
            { icon: Cpu,         val: `${robot.cpu_load}%`,           color: robot.cpu_load > 80 ? '#ff4444' : '#7c3aed' },
            { icon: Wifi,        val: `${robot.network_latency}ms`,   color: robot.network_latency > 100 ? '#ff4444' : '#00d4ff' },
          ].map(({ icon: Icon, val, color }, i) => (
            <div key={i} className="text-center">
              <Icon size={10} className="mx-auto mb-0.5" style={{ color }} />
              <p className="text-[10px] font-mono" style={{ color }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2">
          <MapPin size={9} className="text-gray-600" />
          <span className="text-[10px] text-gray-500">{robot.location}</span>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/6 pt-3 space-y-3">
              {/* Battery bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Battery</span>
                  <span className="font-mono text-status-online">{robot.battery}%</span>
                </div>
                <div className="progress-track">
                  <div className="h-full rounded-full transition-all" style={{ width: `${robot.battery}%`, background: robot.battery < 20 ? '#ff4444' : '#00ff88' }} />
                </div>
              </div>
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  ['IP Address',     robot.ip_address],
                  ['Firmware',       robot.firmware_version],
                  ['Uptime',         formatUptime(robot.uptime)],
                  ['Last Seen',      formatDistanceToNow(new Date(robot.last_seen), { addSuffix: true })],
                  ['Tasks Done',     robot.tasks_completed],
                  ['Tasks Failed',   robot.tasks_failed],
                ].map(([k, v]) => (
                  <div key={k} className="p-2 rounded bg-white/3">
                    <p className="text-gray-600 mb-0.5">{k}</p>
                    <p className="font-mono text-white">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FleetMapDot({ robot, isActive, onSelect }) {
  const cfg = STATUS_CONFIG[robot.status] || STATUS_CONFIG.offline
  // Deterministic position from serial number
  const hash = robot.serial_number.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const x = 5 + (hash % 80)
  const y = 10 + ((hash * 7) % 70)

  return (
    <g
      onClick={() => onSelect(robot.id)}
      className="cursor-pointer"
      transform={`translate(${x}%, ${y}%)`}
      style={{ transform: `translate(${x}%, ${y}%)` }}
    >
      <circle
        cx="0" cy="0" r={isActive ? '8' : '6'}
        fill={cfg.color}
        opacity={robot.status === 'offline' ? 0.3 : 0.9}
        stroke={isActive ? 'white' : cfg.color}
        strokeWidth={isActive ? '2' : '1'}
        style={{ transition: 'all 0.2s' }}
      />
      {(robot.status === 'online' || robot.status === 'busy') && (
        <circle cx="0" cy="0" r="14" fill="none" stroke={cfg.color} strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="6;18" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <text x="10" y="4" fontSize="8" fill="white" opacity="0.7" fontFamily="monospace">{robot.name.split(' ')[1]}</text>
    </g>
  )
}

export default function FleetOverview() {
  const storeRobots = useRobotStore((s) => s.robots)
  const activeRobotId = useRobotStore((s) => s.activeRobotId)
  const setActiveRobot = useRobotStore((s) => s.setActiveRobot)

  // Merge store robots with demo fleet (demo first, store overrides)
  const fleet = DEMO_FLEET.map((dr) => {
    const storeRobot = storeRobots.find((r) => r.id === dr.id)
    return storeRobot ? { ...dr, ...storeRobot } : dr
  })

  const [filter, setFilter] = useState('all')

  const statusCounts = fleet.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const filtered = filter === 'all' ? fleet : fleet.filter((r) => r.status === filter)

  const activeRobot = fleet.find((r) => r.id === activeRobotId) || fleet[0]

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-4">

      {/* Fleet summary bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { key: 'all',         label: 'Total',       count: fleet.length,              color: '#00d4ff' },
          { key: 'online',      label: 'Online',      count: statusCounts.online || 0,  color: '#00ff88' },
          { key: 'busy',        label: 'Busy',        count: statusCounts.busy || 0,    color: '#ffaa00' },
          { key: 'idle',        label: 'Idle',        count: statusCounts.idle || 0,    color: '#00d4ff' },
          { key: 'error',       label: 'Error',       count: statusCounts.error || 0,   color: '#ff4444' },
          { key: 'offline',     label: 'Offline',     count: statusCounts.offline || 0, color: '#555'    },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'card p-3 text-center transition-all duration-150',
              filter === key ? 'border-cyan-neon/40' : 'hover:border-white/12'
            )}
          >
            <p className="text-xl font-bold font-mono" style={{ color }}>{count}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fleet map */}
        <div className="panel p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <MapPin size={13} className="text-cyan-neon" /> Lab Map
          </h3>
          <div className="relative rounded-lg overflow-hidden bg-white/3 border border-white/6" style={{ aspectRatio: '4/3' }}>
            {/* Grid overlay */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="fleet-grid" width="10%" height="10%" patternUnits="objectBoundingBox">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fleet-grid)" />
              {/* Room labels */}
              {[
                { x: '8%', y: '15%', label: 'Lab 1' },
                { x: '55%', y: '15%', label: 'Lab 2' },
                { x: '8%', y: '65%', label: 'Lab 3' },
                { x: '55%', y: '65%', label: 'Storage' },
              ].map(({ x, y, label }) => (
                <text key={label} x={x} y={y} fontSize="8" fill="rgba(255,255,255,0.2)" fontFamily="monospace">{label}</text>
              ))}
              {/* Room borders */}
              <rect x="5%" y="8%" width="38%" height="38%" rx="2" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
              <rect x="52%" y="8%" width="43%" height="38%" rx="2" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
              <rect x="5%" y="55%" width="38%" height="38%" rx="2" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
              <rect x="52%" y="55%" width="43%" height="38%" rx="2" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
              {/* Robot dots */}
              {fleet.map((robot) => (
                <FleetMapDot
                  key={robot.id}
                  robot={robot}
                  isActive={robot.id === activeRobotId}
                  onSelect={setActiveRobot}
                />
              ))}
            </svg>
          </div>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(STATUS_CONFIG).slice(0, 4).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                <span className="text-[9px] text-gray-500 capitalize">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Robot cards grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          {filtered.map((robot) => (
            <RobotCard
              key={robot.id}
              robot={robot}
              isActive={robot.id === activeRobotId}
              onSelect={setActiveRobot}
            />
          ))}
        </div>
      </div>

      {/* Fleet aggregate stats */}
      <div className="panel p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={13} className="text-cyan-neon" /> Fleet Performance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Avg Battery',
              value: `${Math.round(fleet.filter(r=>r.status!=='offline').reduce((a,r)=>a+r.battery,0)/Math.max(1,fleet.filter(r=>r.status!=='offline').length))}%`,
              color: '#00ff88',
            },
            {
              label: 'Avg CPU',
              value: `${Math.round(fleet.filter(r=>r.status!=='offline').reduce((a,r)=>a+r.cpu_load,0)/Math.max(1,fleet.filter(r=>r.status!=='offline').length))}%`,
              color: '#7c3aed',
            },
            {
              label: 'Total Tasks Done',
              value: fleet.reduce((a,r)=>a+r.tasks_completed,0),
              color: '#00d4ff',
            },
            {
              label: 'Total Failures',
              value: fleet.reduce((a,r)=>a+r.tasks_failed,0),
              color: '#ff4444',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-3">
              <p className="text-[10px] text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
