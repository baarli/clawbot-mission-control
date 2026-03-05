import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// ─── Mock data generators ─────────────────────────────────────────────────────
function generateTelemetry(robotId) {
  return {
    robot_id: robotId,
    timestamp: new Date().toISOString(),
    battery: Math.max(5, Math.min(100, 75 + (Math.random() - 0.5) * 4)),
    temperature: 38 + (Math.random() - 0.5) * 6,
    cpu_load: Math.random() * 60 + 10,
    network_latency: Math.random() * 40 + 8,
    joint_positions: {
      shoulder: Math.random() * 180 - 90,
      elbow: Math.random() * 120 - 60,
      wrist: Math.random() * 90 - 45,
      claw: Math.random() * 100,
    },
    claw_pressure: Math.random() * 800 + 100,
    position: {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
    },
    errors: [],
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────
const INITIAL_ROBOT = {
  id: 'robot-001',
  name: 'ClawBot Alpha',
  status: 'online',
  model: 'KimiClaw MK-III',
  firmware_version: '3.4.1',
  serial_number: 'KB-2024-001',
  battery: 78,
  last_seen: new Date().toISOString(),
  uptime: 0,
  location: 'Lab 1 — Bay A',
  ip_address: '192.168.1.45',
  connected: true,
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useRobotStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Robots ──
    robots: [INITIAL_ROBOT],
    activeRobotId: 'robot-001',
    robotLoading: false,

    // ── Telemetry ──
    telemetryHistory: [],
    liveTelemetry: generateTelemetry('robot-001'),

    // ── Commands ──
    commandQueue: [],
    commandHistory: [],
    isExecutingCommand: false,

    // ── Tasks ──
    tasks: [],

    // ── Alerts ──
    alerts: [],
    unreadAlerts: 0,

    // ── Voice ──
    voiceLogs: [],
    isListening: false,
    isSpeaking: false,

    // ── UI State ──
    activePage: 'dashboard',
    sidebarCollapsed: false,
    notifications: [],

    // ── Uptime Counter ──
    uptimeSeconds: 0,

    // ─ Actions ───────────────────────────────────────────────────────────────

    setActivePage: (page) => set({ activePage: page }),

    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

    setActiveRobot: (id) => set({ activeRobotId: id }),

    updateRobot: (id, updates) =>
      set((s) => ({
        robots: s.robots.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),

    addRobot: (robot) =>
      set((s) => ({ robots: [...s.robots, robot] })),

    // Telemetry
    updateLiveTelemetry: (data) =>
      set((s) => ({
        liveTelemetry: data,
        telemetryHistory: [
          ...s.telemetryHistory.slice(-299), // keep last 300 points
          data,
        ],
      })),

    // Commands
    queueCommand: (command) =>
      set((s) => ({
        commandQueue: [...s.commandQueue, {
          id: `cmd-${Date.now()}`,
          ...command,
          status: 'queued',
          created_at: new Date().toISOString(),
        }],
      })),

    dequeueCommand: (id) =>
      set((s) => ({
        commandQueue: s.commandQueue.filter((c) => c.id !== id),
      })),

    addToCommandHistory: (command) =>
      set((s) => ({
        commandHistory: [command, ...s.commandHistory.slice(0, 99)],
      })),

    setExecutingCommand: (val) => set({ isExecutingCommand: val }),

    // Tasks
    setTasks: (tasks) => set({ tasks }),

    addTask: (task) =>
      set((s) => ({ tasks: [task, ...s.tasks] })),

    updateTask: (id, updates) =>
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),

    removeTask: (id) =>
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

    // Alerts
    addAlert: (alert) =>
      set((s) => ({
        alerts: [alert, ...s.alerts.slice(0, 199)],
        unreadAlerts: s.unreadAlerts + 1,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            ...alert,
            read: false,
          },
          ...s.notifications.slice(0, 9),
        ],
      })),

    acknowledgeAlert: (id) =>
      set((s) => ({
        alerts: s.alerts.map((a) =>
          a.id === id ? { ...a, acknowledged: true } : a
        ),
        unreadAlerts: Math.max(0, s.unreadAlerts - 1),
      })),

    clearUnreadAlerts: () => set({ unreadAlerts: 0 }),

    // Voice
    addVoiceLog: (entry) =>
      set((s) => ({ voiceLogs: [entry, ...s.voiceLogs.slice(0, 99)] })),

    setListening: (val) => set({ isListening: val }),
    setSpeaking: (val) => set({ isSpeaking: val }),

    // Notifications
    dismissNotification: (id) =>
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      })),

    // Getters
    getActiveRobot: () => {
      const { robots, activeRobotId } = get()
      return robots.find((r) => r.id === activeRobotId) || robots[0]
    },

    // Simulate telemetry tick (used in demo/development mode)
    tickTelemetry: () => {
      const { activeRobotId, liveTelemetry } = get()
      const newData = {
        ...generateTelemetry(activeRobotId),
        battery: Math.max(5, (liveTelemetry?.battery || 75) - Math.random() * 0.1),
      }
      get().updateLiveTelemetry(newData)
      set((s) => ({
        uptimeSeconds: s.uptimeSeconds + 1,
        robots: s.robots.map((r) =>
          r.id === activeRobotId
            ? { ...r, battery: Math.round(newData.battery), last_seen: new Date().toISOString() }
            : r
        ),
      }))
    },
  }))
)
