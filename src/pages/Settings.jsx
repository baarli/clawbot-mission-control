import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Database, Volume2, Bot, Shield, Bell, Palette, Wifi, Eye, EyeOff, Save, RotateCcw, CheckCircle, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

function SettingSection({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-5"
    >
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Icon size={13} className="text-cyan-neon" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white">{label}</p>
        {description && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={clsx(
        'relative w-9 h-5 rounded-full transition-all duration-200',
        value ? 'bg-cyan-neon/80' : 'bg-white/15'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200',
          value ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

function SecretInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-cyber pr-8 text-xs w-64"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  )
}

const DEFAULT_SETTINGS = {
  // Supabase
  supabaseUrl:       import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey:   import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // ElevenLabs
  elevenLabsKey:     import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  elevenLabsVoiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
  ttsEnabled:        true,
  sttEnabled:        true,

  // Robot
  robotId:           'robot-001',
  telemetryInterval: 2000,
  autoReconnect:     true,
  emergencyStopPin:  false,

  // Alerts
  alertSound:        true,
  desktopAlerts:     false,
  criticalOnly:      false,

  // UI
  reduceMotion:      false,
  compactMode:       false,
  showFpsCounter:    false,
  theme:             'cyber',
}

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }))

  const handleSave = () => {
    // In a real app, persist to localStorage or backend
    localStorage.setItem('clawbot-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('clawbot-settings')
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 space-y-4">

      {/* Supabase */}
      <SettingSection icon={Database} title="Supabase Configuration">
        <SettingRow
          label="Project URL"
          description="Your Supabase project URL. Found in Settings → API."
        >
          <input
            type="url"
            value={settings.supabaseUrl}
            onChange={(e) => update('supabaseUrl', e.target.value)}
            placeholder="https://xxxx.supabase.co"
            className="input-cyber text-xs w-64"
          />
        </SettingRow>
        <SettingRow
          label="Anonymous Key"
          description="Your Supabase anon/public key. Safe to expose in client apps."
        >
          <SecretInput
            value={settings.supabaseAnonKey}
            onChange={(v) => update('supabaseAnonKey', v)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
          />
        </SettingRow>
        <div className="p-3 rounded-lg bg-cyan-neon/5 border border-cyan-neon/15 text-xs text-gray-400 leading-relaxed">
          <span className="text-cyan-neon font-medium">💡 Tip:</span> Set these as environment variables in a <code className="font-mono bg-white/8 px-1 rounded">.env</code> file
          using the <code className="font-mono bg-white/8 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-white/8 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> keys
          for automatic loading. Values set here take precedence at runtime.
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-neon ml-2 hover:underline"
          >
            Supabase Docs <ExternalLink size={9} />
          </a>
        </div>
      </SettingSection>

      {/* ElevenLabs / Voice */}
      <SettingSection icon={Volume2} title="Voice & Speech">
        <SettingRow
          label="ElevenLabs API Key"
          description="Used for high-quality text-to-speech. Falls back to browser TTS if not set."
        >
          <SecretInput
            value={settings.elevenLabsKey}
            onChange={(v) => update('elevenLabsKey', v)}
            placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxx"
          />
        </SettingRow>
        <SettingRow
          label="Voice ID"
          description="ElevenLabs voice ID for robot status announcements."
        >
          <input
            type="text"
            value={settings.elevenLabsVoiceId}
            onChange={(e) => update('elevenLabsVoiceId', e.target.value)}
            placeholder="pNInz6obpgDQGcFmaJgB"
            className="input-cyber text-xs w-48 font-mono"
          />
        </SettingRow>
        <SettingRow label="Text-to-Speech" description="Speak robot status updates and command confirmations.">
          <Toggle value={settings.ttsEnabled} onChange={(v) => update('ttsEnabled', v)} />
        </SettingRow>
        <SettingRow label="Speech-to-Text" description="Enable microphone input in the Voice Command Center.">
          <Toggle value={settings.sttEnabled} onChange={(v) => update('sttEnabled', v)} />
        </SettingRow>
      </SettingSection>

      {/* Robot config */}
      <SettingSection icon={Bot} title="Robot Configuration">
        <SettingRow
          label="Active Robot ID"
          description="The primary robot this dashboard controls."
        >
          <input
            type="text"
            value={settings.robotId}
            onChange={(e) => update('robotId', e.target.value)}
            className="input-cyber text-xs w-36 font-mono"
          />
        </SettingRow>
        <SettingRow
          label="Telemetry Interval"
          description="How often to receive telemetry data (milliseconds). Minimum 500ms."
        >
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={settings.telemetryInterval}
              onChange={(e) => update('telemetryInterval', parseInt(e.target.value))}
              className="w-28 accent-cyan-400"
            />
            <span className="text-xs font-mono text-cyan-neon w-12 text-right">{settings.telemetryInterval}ms</span>
          </div>
        </SettingRow>
        <SettingRow label="Auto-Reconnect" description="Automatically reconnect when the robot goes offline.">
          <Toggle value={settings.autoReconnect} onChange={(v) => update('autoReconnect', v)} />
        </SettingRow>
        <SettingRow
          label="Emergency Stop Shortcut"
          description="Enable Shift+E keyboard shortcut for immediate emergency stop."
        >
          <Toggle value={settings.emergencyStopPin} onChange={(v) => update('emergencyStopPin', v)} />
        </SettingRow>
      </SettingSection>

      {/* Alerts */}
      <SettingSection icon={Bell} title="Notifications & Alerts">
        <SettingRow label="Alert Sound" description="Play audio cues when new alerts are received.">
          <Toggle value={settings.alertSound} onChange={(v) => update('alertSound', v)} />
        </SettingRow>
        <SettingRow label="Desktop Notifications" description="Show OS-level notifications for critical alerts.">
          <Toggle value={settings.desktopAlerts} onChange={(v) => update('desktopAlerts', v)} />
        </SettingRow>
        <SettingRow label="Critical Alerts Only" description="Only show critical severity alerts in the notification panel.">
          <Toggle value={settings.criticalOnly} onChange={(v) => update('criticalOnly', v)} />
        </SettingRow>
      </SettingSection>

      {/* UI */}
      <SettingSection icon={Palette} title="Appearance & Performance">
        <SettingRow label="Reduce Motion" description="Disable animations and transitions for better performance.">
          <Toggle value={settings.reduceMotion} onChange={(v) => update('reduceMotion', v)} />
        </SettingRow>
        <SettingRow label="Compact Mode" description="Reduce padding and font sizes for smaller screens.">
          <Toggle value={settings.compactMode} onChange={(v) => update('compactMode', v)} />
        </SettingRow>
        <SettingRow label="Show FPS Counter" description="Display a performance overlay for debugging.">
          <Toggle value={settings.showFpsCounter} onChange={(v) => update('showFpsCounter', v)} />
        </SettingRow>
      </SettingSection>

      {/* Save bar */}
      <div className="flex items-center justify-between p-4 panel">
        <p className="text-xs text-gray-500">
          Settings are saved to <code className="font-mono bg-white/8 px-1 rounded text-[11px]">localStorage</code>.
          Environment variables in <code className="font-mono bg-white/8 px-1 rounded text-[11px]">.env</code> take priority on fresh load.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="btn-cyber flex items-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            <RotateCcw size={11} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="btn-cyber-primary flex items-center gap-1.5 py-2 text-xs"
          >
            {saved ? (
              <><CheckCircle size={12} className="text-status-online" /> Saved!</>
            ) : (
              <><Save size={12} /> Save Settings</>
            )}
          </button>
        </div>
      </div>

      {/* Build info */}
      <div className="text-center py-2">
        <p className="text-[10px] text-gray-700 font-mono">
          ClawBot Mission Control v1.0.0 · KimiClaw MK-III SDK · Built with React + Vite + Supabase
        </p>
      </div>
    </div>
  )
}
