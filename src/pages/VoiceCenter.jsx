import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Volume2, VolumeX, Send, Bot, User,
  Loader, CheckCircle, AlertTriangle, Radio, Zap, Info
} from 'lucide-react'
import { useRobotStore } from '../stores/robotStore'
import { speak, speakStatusBriefing } from '../lib/elevenlabs'
import { logVoice } from '../lib/supabase'
import { format } from 'date-fns'
import clsx from 'clsx'

// ─── Voice command parser ─────────────────────────────────────────────────────
function parseVoiceCommand(transcript) {
  const t = transcript.toLowerCase()
  const cmds = [
    { patterns: ['stop', 'halt', 'emergency', 'e-stop'], command: 'EMERGENCY_STOP', response: 'Emergency stop activated. All systems halted.' },
    { patterns: ['move forward', 'go forward', 'advance'], command: 'MOVE_FORWARD', response: 'Moving forward.' },
    { patterns: ['move back', 'go back', 'reverse', 'backward'], command: 'MOVE_BACKWARD', response: 'Reversing.' },
    { patterns: ['rotate left', 'turn left'], command: 'ROTATE_LEFT', response: 'Rotating left.' },
    { patterns: ['rotate right', 'turn right'], command: 'ROTATE_RIGHT', response: 'Rotating right.' },
    { patterns: ['open claw', 'release'], command: 'CLAW_OPEN', response: 'Claw opening.' },
    { patterns: ['close claw', 'grab', 'grip', 'pick up'], command: 'CLAW_CLOSE', response: 'Claw closing — object gripped.' },
    { patterns: ['arm up', 'raise arm', 'lift arm'], command: 'ARM_UP', response: 'Arm raised.' },
    { patterns: ['arm down', 'lower arm'], command: 'ARM_DOWN', response: 'Arm lowered.' },
    { patterns: ['go home', 'return home', 'home position'], command: 'HOME', response: 'Returning to home position.' },
    { patterns: ['diagnostic', 'system check', 'run diagnostic'], command: 'DIAGNOSTICS', response: 'Running system diagnostics. All sensors nominal.' },
    { patterns: ['status', 'how are you', "what's your status"], command: 'STATUS', response: 'Systems operational. Battery at 78%. All sensors online.' },
    { patterns: ['battery', 'power level'], command: 'BATTERY_CHECK', response: 'Battery level is at 78%. Estimated 4.2 hours of operation remaining.' },
    { patterns: ['camera on', 'activate camera'], command: 'CAMERA_ON', response: 'Camera feed activated.' },
    { patterns: ['camera off', 'deactivate camera'], command: 'CAMERA_OFF', response: 'Camera feed deactivated.' },
  ]
  for (const { patterns, command, response } of cmds) {
    if (patterns.some((p) => t.includes(p))) {
      return { command, response }
    }
  }
  return { command: null, response: `Received: "${transcript}". Command not recognized. Please try again.` }
}

// ─── Audio visualizer bars ────────────────────────────────────────────────────
function AudioBars({ active, count = 12 }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ background: active ? '#00d4ff' : 'rgba(255,255,255,0.15)' }}
          animate={active ? {
            height: [6, Math.random() * 32 + 8, 6],
          } : { height: 4 }}
          transition={{
            duration: active ? 0.4 + Math.random() * 0.3 : 0.2,
            repeat: active ? Infinity : 0,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={clsx('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div className={clsx(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isUser
          ? 'bg-violet-500/20 border border-violet-500/30'
          : 'bg-cyan-neon/15 border border-cyan-neon/30'
      )}>
        {isUser
          ? <User size={12} className="text-violet-400" />
          : <Bot size={12} className="text-cyan-neon" />
        }
      </div>
      <div className={clsx('max-w-[70%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div className={clsx(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-md bg-violet-500/15 border border-violet-500/20 text-white'
            : 'rounded-tl-md bg-cyan-neon/8 border border-cyan-neon/15 text-white'
        )}>
          {message.content}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[9px] text-gray-600 font-mono">
            {format(new Date(message.timestamp), 'HH:mm:ss')}
          </span>
          {message.command && (
            <span className="tag-cyan text-[9px] py-0 px-1.5">
              CMD: {message.command}
            </span>
          )}
          {message.status === 'executed' && (
            <CheckCircle size={9} className="text-status-online" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VoiceCenter() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "ClawBot voice interface online. I'm ready to receive commands. You can say things like 'Move forward', 'Open claw', 'Emergency stop', or ask for 'Status'.",
      timestamp: new Date().toISOString(),
    }
  ])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputText, setInputText] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)
  const scrollRef = useRef(null)
  const addVoiceLog = useRobotStore((s) => s.addVoiceLog)
  const activeRobotId = useRobotStore((s) => s.activeRobotId)
  const addToCommandHistory = useRobotStore((s) => s.addToCommandHistory)

  useEffect(() => {
    setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const processCommand = useCallback(async (text) => {
    if (!text.trim()) return
    setIsProcessing(true)

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    const { command, response } = parseVoiceCommand(text)

    await new Promise((r) => setTimeout(r, 300))

    const botMsg = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content: response,
      command,
      status: command ? 'executed' : 'unknown',
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, botMsg])

    if (command) {
      addToCommandHistory({
        id: `voice-cmd-${Date.now()}`,
        payload: { type: command, source: 'voice' },
        created_at: new Date().toISOString(),
        status: 'completed',
      })
    }

    addVoiceLog({ id: `vlog-${Date.now()}`, robot_id: activeRobotId, transcript: text, response, command, timestamp: new Date().toISOString() })

    try {
      await logVoice({ robot_id: activeRobotId, transcript: text, response, timestamp: new Date().toISOString() })
    } catch {
      // Supabase might not be configured
    }

    setIsSpeaking(true)
    try {
      await speak(response)
    } finally {
      setIsSpeaking(false)
    }
    setIsProcessing(false)
  }, [addToCommandHistory, addVoiceLog, activeRobotId])

  const startListening = useCallback(() => {
    if (!voiceSupported) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e) => {
      const interim = Array.from(e.results).map((r) => r[0].transcript).join('')
      setTranscript(interim)
      if (e.results[e.results.length - 1].isFinal) {
        processCommand(interim)
        setTranscript('')
      }
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => { setIsListening(false); setTranscript('') }

    recognitionRef.current = recognition
    recognition.start()
  }, [voiceSupported, processCommand])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    processCommand(inputText)
    setInputText('')
  }

  const handleBriefing = async () => {
    setIsSpeaking(true)
    try {
      await speakStatusBriefing({ status: 'online', battery: 78, name: 'ClawBot Alpha' })
    } finally {
      setIsSpeaking(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isListening ? 'bg-cyan-neon/20 animate-pulse' : 'bg-cyan-neon/10'
          )}>
            {isListening ? <Mic size={14} className="text-cyan-neon" /> : <Radio size={14} className="text-cyan-neon" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Voice Command Center</p>
            <p className="text-[10px] text-gray-500">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Processing...' : 'Ready'}
            </p>
          </div>
        </div>

        {/* Quick commands */}
        <div className="flex gap-2 ml-4 overflow-x-auto no-scrollbar">
          {['Status', 'Open claw', 'Move forward', 'Go home', 'Emergency stop'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => processCommand(cmd)}
              disabled={isProcessing}
              className="btn-cyber py-1 px-2 text-[10px] whitespace-nowrap flex-shrink-0 disabled:opacity-40"
            >
              {cmd}
            </button>
          ))}
        </div>

        <button onClick={handleBriefing} className="ml-auto btn-cyber flex items-center gap-1.5 py-1.5 text-xs flex-shrink-0">
          <Zap size={12} /> Briefing
        </button>
      </div>

      {/* ── Visualizer ── */}
      <div className="flex items-center justify-center py-4 border-b border-white/5 flex-shrink-0 bg-white/1">
        <div className="flex flex-col items-center gap-2">
          <AudioBars active={isListening || isSpeaking} />
          {transcript && (
            <p className="text-xs text-cyan-neon/70 font-mono animate-pulse">{transcript}</p>
          )}
          {!transcript && (
            <p className="text-[10px] text-gray-600">
              {isListening ? 'Listening for your command...'
                : isSpeaking ? 'Robot is responding...'
                : isProcessing ? 'Processing command...'
                : 'Tap microphone to speak'}
            </p>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-cyan-neon/15 border border-cyan-neon/30 flex items-center justify-center flex-shrink-0">
              <Bot size={12} className="text-cyan-neon" />
            </div>
            <div className="bg-cyan-neon/8 border border-cyan-neon/15 rounded-2xl rounded-tl-md px-4 py-2.5 flex items-center gap-2">
              <Loader size={12} className="text-cyan-neon animate-spin" />
              <span className="text-xs text-gray-400">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-white/5 px-4 py-3 flex-shrink-0">
        {!voiceSupported && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-status-warning/10 border border-status-warning/20">
            <Info size={12} className="text-status-warning flex-shrink-0" />
            <p className="text-[11px] text-status-warning">Voice recognition not supported in this browser. Use text input below.</p>
          </div>
        )}
        <form onSubmit={handleTextSubmit} className="flex gap-3 items-center">
          {/* Mic button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopListening : startListening}
            disabled={!voiceSupported || isProcessing}
            className={clsx(
              'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
              'border-2 disabled:opacity-40 disabled:cursor-not-allowed',
              isListening
                ? 'bg-cyan-neon/20 border-cyan-neon text-cyan-neon glow-cyan'
                : 'bg-white/5 border-white/15 text-gray-400 hover:border-cyan-neon/50 hover:text-cyan-neon'
            )}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
          </motion.button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a command or question..."
            disabled={isProcessing}
            className="input-cyber flex-1 disabled:opacity-50"
          />

          {/* TTS mute */}
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-white/10 text-gray-500 hover:text-white hover:bg-white/8 transition-colors flex-shrink-0"
            title="Toggle voice feedback"
          >
            {isSpeaking ? <Volume2 size={15} className="text-cyan-neon" /> : <VolumeX size={15} />}
          </button>

          {/* Submit */}
          <button type="submit" disabled={!inputText.trim() || isProcessing} className="btn-cyber-primary py-2 px-3 disabled:opacity-40 flex-shrink-0">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
