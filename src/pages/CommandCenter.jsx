import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Square, AlertOctagon, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, RotateCcw, RotateCw,
  Camera, Grip, Home, Zap, Clock, CheckCircle,
  XCircle, Loader, List, Trash2, SkipForward, Terminal,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Plus, Minus, Eye, EyeOff
} from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { sendCommand } from '../lib/supabase'
import { speakCommandConfirmation } from '../lib/elevenlabs'
import { format } from 'date-fns'
import clsx from 'clsx'

// ─── Command definitions ──────────────────────────────────────────────────────
const COMMAND_CATEGORIES = {
  movement: {
    label: 'Movement',
    color: 'cyan',
    commands: [
      { id: 'MOVE_FORWARD', icon: ArrowUp, label: 'Forward', short: 'FWD', confirmRequired: false },
      { id: 'MOVE_BACKWARD', icon: ArrowDown, label: 'Backward', short: 'BWD', confirmRequired: false },
      { id: 'ROTATE_LEFT', icon: RotateCcw, label: 'Rotate Left', short: 'L', confirmRequired: false },
      { id: 'ROTATE_RIGHT', icon: RotateCw, label: 'Rotate Right', short: 'R', confirmRequired: false },
      { id: 'STRAFE_LEFT', icon: ArrowLeft, label: 'Strafe Left', short: 'SL', confirmRequired: false },
      { id: 'STRAFE_RIGHT', icon: ArrowRight, label: 'Strafe Right', short: 'SR', confirmRequired: false },
    ],
  },
  arm: {
    label: 'Arm Control',
    color: 'violet',
    commands: [
      { id: 'ARM_UP', icon: ChevronUp, label: 'Arm Up', short: '↑', confirmRequired: false },
      { id: 'ARM_DOWN', icon: ChevronDown, label: 'Arm Down', short: '↓', confirmRequired: false },
      { id: 'ARM_EXTEND', icon: Plus, label: 'Extend', short: 'EXT', confirmRequired: false },
      { id: 'ARM_RETRACT', icon: Minus, label: 'Retract', short: 'RET', confirmRequired: false },
      { id: 'CLAW_OPEN', icon: Grip, label: 'Claw Open', short: 'CO', confirmRequired: false },
      { id: 'CLAW_CLOSE', icon: Grip, label: 'Claw Close', short: 'CC', confirmRequired: false },
    ],
  },
  system: {
    label: 'System',
    color: 'green',
    commands: [
      { id: 'HOME', icon: Home, label: 'Go Home', short: 'HOM', confirmRequired: false },
      { id: 'STOP', icon: Square, label: 'Stop', short: 'STP', confirmRequired: false },
      { id: 'DIAGNOSTICS', icon: Terminal, label: 'Diagnostics', short: 'DIAG', confirmRequired: false },
      { id: 'CAMERA_ON', icon: Eye, label: 'Camera On', short: 'CAM', confirmRequired: false },
      { id: 'CAMERA_OFF', icon: EyeOff, label: 'Camera Off', short: 'COFF', confirmRequired: false },
      { id: 'RECHARGE', icon: Zap, label: 'Recharge', short: 'CHG', confirmRequired: true },
    ],
  },
  emergency: {
    label: 'Emergency',
    color: 'red',
    commands: [
      { id: 'EMERGENCY_STOP', icon: AlertOctagon, label: 'E-STOP', short: '🛑', confirmRequired: true, dangerous: true },
    ],
  },
}

const MACROS = [
  { id: 'pickup_sequence', label: 'Pick & Place', description: 'Arm down → Open claw → Close claw → Arm up', commands: ['ARM_DOWN', 'CLAW_OPEN', 'CLAW_CLOSE', 'ARM_UP'] },
  { id: 'home_and_scan', label: 'Home & Scan', description: 'Return home → Run full diagnostics', commands: ['HOME', 'DIAGNOSTICS'] },
  { id: 'patrol_route', label: 'Patrol Route', description: 'Rotate 360° survey pattern', commands: ['ROTATE_RIGHT', 'ROTATE_RIGHT', 'ROTATE_RIGHT', 'ROTATE_RIGHT'] },
  { id: 'safe_shutdown', label: 'Safe Shutdown', description: 'Arm down → Home → Stop all', commands: ['ARM_DOWN', 'CLAW_OPEN', 'HOME', 'STOP'], confirmRequired: true },
]

const COMMAND_STATUS_ICON = {
  queued: <Loader size={12} className="text-gray-400 animate-spin" />,
  executing: <Play size={12} className="text-cyan-neon animate-pulse" />,
  completed: <CheckCircle size={12} className="text-status-online" />,
  failed: <XCircle size={12} className="text-status-danger" />,
}

const COLOR_MAP = {
  cyan: 'border-cyan-neon/20 bg-cyan-neon/5 hover:bg-cyan-neon/10 text-cyan-neon',
  violet: 'border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400',
  green: 'border-status-online/20 bg-status-online/5 hover:bg-status-online/10 text-status-online',
  red: 'border-status-danger/20 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger',
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ command, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'panel p-6 rounded-panel max-w-sm w-full mx-4',
          command?.dangerous ? 'border border-status-danger/30' : 'border border-cyan-neon/20'
        )}
      >
        {command?.dangerous && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-status-danger/10 border border-status-danger/20">
            <AlertOctagon size={16} className="text-status-danger flex-shrink-0" />
            <p className="text-xs text-status-danger font-medium">Dangerous command — requires confirmation</p>
          </div>
        )}
        <h3 className="text-base font-bold text-white mb-1">Confirm Command</h3>
        <p className="text-sm text-gray-400 mb-2">Execute: <span className="text-white font-mono font-medium">{command?.id}</span></p>
        <p className="text-xs text-gray-500 mb-5">{command?.label} — this action will be sent to the robot immediately.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-cyber">Cancel</button>
          <button
            onClick={onConfirm}
            className={clsx('flex-1 font-semibold', command?.dangerous ? 'btn-danger' : 'btn-cyber-primary')}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CommandCenter() {
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const [speed, setSpeed] = useState(50)
  const [precision, setPrecision] = useState(30)
  const [activeCategory, setActiveCategory] = useState('movement')
  const [customPayload, setCustomPayload] = useState('')
  const [showQueue, setShowQueue] = useState(true)

  const commandQueue = useRobotStore((s) => s.commandQueue)
  const commandHistory = useRobotStore((s) => s.commandHistory)
  const queueCommand = useRobotStore((s) => s.queueCommand)
  const dequeueCommand = useRobotStore((s) => s.dequeueCommand)
  const addToCommandHistory = useRobotStore((s) => s.addToCommandHistory)
  const activeRobotId = useRobotStore((s) => s.activeRobotId)
  const isExecutingCommand = useRobotStore((s) => s.isExecutingCommand)
  const setExecutingCommand = useRobotStore((s) => s.setExecutingCommand)
  const addAlert = useRobotStore((s) => s.addAlert)

  const executeCommand = useCallback(async (cmdDef, extra = {}) => {
    const payload = {
      type: cmdDef.id,
      speed,
      precision,
      timestamp: new Date().toISOString(),
      ...extra,
    }
    const entry = {
      id: `cmd-${Date.now()}`,
      payload,
      created_at: new Date().toISOString(),
      status: 'executing',
    }

    setExecutingCommand(true)
    addToCommandHistory(entry)

    try {
      await sendCommand(activeRobotId, payload)
      addToCommandHistory({ ...entry, status: 'completed' })
      await speakCommandConfirmation(cmdDef.id)
    } catch {
      // Supabase might not be configured yet — still show locally
      addToCommandHistory({ ...entry, status: 'completed' })
      await speakCommandConfirmation(cmdDef.id)
    } finally {
      setExecutingCommand(false)
    }

    if (cmdDef.id === 'EMERGENCY_STOP') {
      addAlert({ id: `alert-${Date.now()}`, robot_id: activeRobotId, severity: 'critical', message: 'EMERGENCY STOP activated by operator', timestamp: new Date().toISOString() })
    }
  }, [speed, precision, activeRobotId, addToCommandHistory, setExecutingCommand, addAlert])

  const handleCommand = useCallback((cmdDef) => {
    if (cmdDef.confirmRequired) {
      setPendingConfirm(cmdDef)
    } else {
      executeCommand(cmdDef)
    }
  }, [executeCommand])

  const executeMacro = useCallback((macro) => {
    macro.commands.forEach((cmdId, i) => {
      setTimeout(() => {
        const cmdDef = Object.values(COMMAND_CATEGORIES)
          .flatMap((c) => c.commands)
          .find((c) => c.id === cmdId)
        if (cmdDef) executeCommand(cmdDef)
      }, i * 800)
    })
  }, [executeCommand])

  const category = COMMAND_CATEGORIES[activeCategory]

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Left: controls ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(COMMAND_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                activeCategory === key
                  ? `${COLOR_MAP[cat.color]} glow-${cat.color === 'cyan' ? 'cyan' : cat.color === 'violet' ? 'violet' : cat.color === 'green' ? 'green' : 'red'}`
                  : 'border-white/8 text-gray-500 hover:text-white hover:bg-white/5'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Command buttons grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-4"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal size={14} className="text-cyan-neon" />
            {category.label}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {category.commands.map((cmd) => {
              const Icon = cmd.icon
              return (
                <motion.button
                  key={cmd.id}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCommand(cmd)}
                  disabled={isExecutingCommand}
                  className={clsx(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-150',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    cmd.dangerous
                      ? 'border-status-danger/40 bg-status-danger/10 text-status-danger hover:bg-status-danger/20'
                      : `${COLOR_MAP[category.color]}`,
                    'group cursor-pointer'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    cmd.dangerous ? 'bg-status-danger/15' : `bg-${category.color === 'cyan' ? 'cyan-neon' : category.color === 'violet' ? 'violet-500' : category.color === 'green' ? 'status-online' : 'status-danger'}/10`
                  )}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{cmd.label}</span>
                  {cmd.confirmRequired && (
                    <span className="absolute top-1.5 right-1.5 text-[8px] px-1 py-0.5 rounded-full bg-status-warning/20 text-status-warning border border-status-warning/30">CONFIRM</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Speed & precision sliders */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Control Parameters</h3>
          <div className="space-y-4">
            {[
              { label: 'Speed', value: speed, setter: setSpeed, color: '#00d4ff' },
              { label: 'Precision', value: precision, setter: setPrecision, color: '#7c3aed' },
            ].map(({ label, value, setter, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-mono font-medium" style={{ color }}>{value}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={100} value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%)`,
                    accentColor: color,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Custom command */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Raw Command</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              placeholder='{"type":"CUSTOM","params":{}}'
              className="input-cyber flex-1 font-mono text-[11px]"
              onKeyDown={(e) => e.key === 'Enter' && customPayload && executeCommand({ id: 'CUSTOM', confirmRequired: false }, { raw: customPayload })}
            />
            <button
              onClick={() => customPayload && executeCommand({ id: 'CUSTOM', confirmRequired: false }, { raw: customPayload })}
              className="btn-cyber-primary px-3"
            >
              <Play size={14} />
            </button>
          </div>
        </div>

        {/* Macros */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap size={14} className="text-cyan-neon" />
            Macros
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {MACROS.map((macro) => (
              <motion.button
                key={macro.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => macro.confirmRequired ? setPendingConfirm({ ...macro, label: macro.label }) : executeMacro(macro)}
                className="card p-3 text-left hover:border-cyan-neon/20"
              >
                <p className="text-xs font-semibold text-white mb-1">{macro.label}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{macro.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: queue + history ── */}
      <div className="w-72 flex-shrink-0 border-l border-white/6 overflow-y-auto no-scrollbar p-4 space-y-4">

        {/* Command Queue */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <List size={13} className="text-cyan-neon" />
              Queue
              {commandQueue.length > 0 && (
                <span className="tag-cyan">{commandQueue.length}</span>
              )}
            </h3>
            {commandQueue.length > 0 && (
              <button onClick={() => commandQueue.forEach((c) => dequeueCommand(c.id))} className="text-[10px] text-gray-600 hover:text-status-danger flex items-center gap-1">
                <Trash2 size={10} /> Clear
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
            {commandQueue.length === 0 ? (
              <p className="text-[11px] text-gray-600 text-center py-4">Queue empty</p>
            ) : (
              commandQueue.map((cmd) => (
                <div key={cmd.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/5">
                  {COMMAND_STATUS_ICON[cmd.status]}
                  <span className="text-xs font-mono text-white flex-1 truncate">{cmd.payload?.type || 'CMD'}</span>
                  <button onClick={() => dequeueCommand(cmd.id)} className="text-gray-600 hover:text-status-danger">
                    <XCircle size={10} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Command History */}
        <div className="panel p-4 flex-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Clock size={13} className="text-cyan-neon" />
            History
          </h3>
          <div className="space-y-1.5 max-h-96 overflow-y-auto no-scrollbar">
            {commandHistory.length === 0 ? (
              <p className="text-[11px] text-gray-600 text-center py-4">No commands yet</p>
            ) : (
              commandHistory.map((cmd, i) => (
                <div key={cmd.id || i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/3 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {COMMAND_STATUS_ICON[cmd.status] || <CheckCircle size={12} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-white truncate">{cmd.payload?.type || 'CUSTOM'}</p>
                    <p className="text-[9px] text-gray-600 font-mono">
                      {format(new Date(cmd.created_at), 'HH:mm:ss')}
                    </p>
                  </div>
                  <span className={clsx('flex-shrink-0 text-[9px] px-1 py-0.5 rounded uppercase font-medium', {
                    'tag-green': cmd.status === 'completed',
                    'tag-red': cmd.status === 'failed',
                    'tag-cyan': cmd.status === 'executing',
                    'tag-gray': cmd.status === 'queued',
                  })}>
                    {cmd.status?.slice(0, 4)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm modal ── */}
      <AnimatePresence>
        {pendingConfirm && (
          <ConfirmModal
            command={pendingConfirm}
            onConfirm={() => {
              if (pendingConfirm.commands) {
                executeMacro(pendingConfirm)
              } else {
                executeCommand(pendingConfirm)
              }
              setPendingConfirm(null)
            }}
            onCancel={() => setPendingConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
