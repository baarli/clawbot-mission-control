import { createClient } from '@supabase/supabase-js'

// ─── Configuration ────────────────────────────────────────────────────────────
// Set these in your .env file:
//   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// ─── Client ───────────────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ─── Robot Operations ─────────────────────────────────────────────────────────

/** Get all registered robots */
export async function getRobots() {
  const { data, error } = await supabase
    .from('robots')
    .select('*')
    .order('last_seen', { ascending: false })
  if (error) throw error
  return data
}

/** Get a single robot by ID */
export async function getRobot(id) {
  const { data, error } = await supabase
    .from('robots')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/** Register or update a robot */
export async function upsertRobot(robot) {
  const { data, error } = await supabase
    .from('robots')
    .upsert(robot, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Update robot status */
export async function updateRobotStatus(id, status) {
  const { error } = await supabase
    .from('robots')
    .update({ status, last_seen: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ─── Task Operations ──────────────────────────────────────────────────────────

/** Get all tasks (optionally filtered by robot) */
export async function getTasks(robotId = null) {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (robotId) query = query.eq('robot_id', robotId)
  const { data, error } = await query
  if (error) throw error
  return data
}

/** Create a new task */
export async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Update task status */
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Delete a task */
export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// ─── Command Operations ───────────────────────────────────────────────────────

/** Send a command to a robot */
export async function sendCommand(robotId, payload) {
  const { data, error } = await supabase
    .from('commands')
    .insert({
      robot_id: robotId,
      payload,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Get command history for a robot */
export async function getCommandHistory(robotId, limit = 50) {
  const { data, error } = await supabase
    .from('commands')
    .select('*')
    .eq('robot_id', robotId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// ─── Telemetry Operations ─────────────────────────────────────────────────────

/** Insert a telemetry record */
export async function insertTelemetry(record) {
  const { error } = await supabase.from('telemetry').insert(record)
  if (error) throw error
}

/** Get telemetry for a robot within a time range */
export async function getTelemetry(robotId, minutesBack = 30) {
  const since = new Date(Date.now() - minutesBack * 60000).toISOString()
  const { data, error } = await supabase
    .from('telemetry')
    .select('*')
    .eq('robot_id', robotId)
    .gte('timestamp', since)
    .order('timestamp', { ascending: true })
  if (error) throw error
  return data
}

// ─── Alert Operations ─────────────────────────────────────────────────────────

/** Get alerts (optionally filtered by robot) */
export async function getAlerts(robotId = null, limit = 100) {
  let query = supabase
    .from('alerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  if (robotId) query = query.eq('robot_id', robotId)
  const { data, error } = await query
  if (error) throw error
  return data
}

/** Acknowledge an alert */
export async function acknowledgeAlert(id) {
  const { error } = await supabase
    .from('alerts')
    .update({ acknowledged: true })
    .eq('id', id)
  if (error) throw error
}

/** Create an alert */
export async function createAlert(alert) {
  const { error } = await supabase.from('alerts').insert(alert)
  if (error) throw error
}

// ─── Voice Log Operations ─────────────────────────────────────────────────────

/** Log a voice interaction */
export async function logVoice(entry) {
  const { data, error } = await supabase
    .from('voice_logs')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Get voice logs */
export async function getVoiceLogs(robotId = null, limit = 50) {
  let query = supabase
    .from('voice_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  if (robotId) query = query.eq('robot_id', robotId)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Real-time Subscriptions ──────────────────────────────────────────────────

/** Subscribe to robot status changes */
export function subscribeToRobot(robotId, callback) {
  return supabase
    .channel(`robot:${robotId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'robots',
      filter: `id=eq.${robotId}`,
    }, callback)
    .subscribe()
}

/** Subscribe to live telemetry */
export function subscribeToTelemetry(robotId, callback) {
  return supabase
    .channel(`telemetry:${robotId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'telemetry',
      filter: `robot_id=eq.${robotId}`,
    }, callback)
    .subscribe()
}

/** Subscribe to commands */
export function subscribeToCommands(robotId, callback) {
  return supabase
    .channel(`commands:${robotId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'commands',
      filter: `robot_id=eq.${robotId}`,
    }, callback)
    .subscribe()
}

/** Subscribe to alerts */
export function subscribeToAlerts(robotId, callback) {
  return supabase
    .channel(`alerts:${robotId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'alerts',
      filter: `robot_id=eq.${robotId}`,
    }, callback)
    .subscribe()
}

/** Subscribe to task changes */
export function subscribeToTasks(robotId, callback) {
  return supabase
    .channel(`tasks:${robotId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `robot_id=eq.${robotId}`,
    }, callback)
    .subscribe()
}

/** Unsubscribe from all channels */
export function unsubscribeAll() {
  return supabase.removeAllChannels()
}
