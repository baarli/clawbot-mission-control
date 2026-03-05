// ─── ElevenLabs TTS Integration ──────────────────────────────────────────────
// Set VITE_ELEVENLABS_API_KEY in your .env file

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || ''
const DEFAULT_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB' // Adam

const BASE_URL = 'https://api.elevenlabs.io/v1'

// Fallback: Web Speech API TTS (no API key needed)
export function speakFallback(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'))
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 0.9
    // Prefer a lower-pitched voice for robot feel
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Google UK English Male'))
      || voices.find(v => v.name.includes('Male'))
      || voices[0]
    if (preferred) utterance.voice = preferred
    utterance.onend = resolve
    utterance.onerror = reject
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Convert text to speech using ElevenLabs API
 * Falls back to Web Speech API if no API key is configured
 */
export async function speak(text, voiceId = DEFAULT_VOICE_ID) {
  if (!API_KEY) {
    console.warn('[ElevenLabs] No API key — falling back to Web Speech API')
    return speakFallback(text)
  }

  try {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.1,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      }
      audio.onerror = reject
      audio.play()
    })
  } catch (err) {
    console.error('[ElevenLabs] Error:', err)
    // Fallback to Web Speech
    return speakFallback(text)
  }
}

/**
 * List available voices
 */
export async function getVoices() {
  if (!API_KEY) return []
  try {
    const res = await fetch(`${BASE_URL}/voices`, {
      headers: { 'xi-api-key': API_KEY },
    })
    const { voices } = await res.json()
    return voices || []
  } catch {
    return []
  }
}

/**
 * Generate a robot status voice briefing
 */
export async function speakStatusBriefing(robotData) {
  const status = robotData?.status || 'unknown'
  const battery = robotData?.battery || 0
  const name = robotData?.name || 'ClawBot'

  let message = `Mission Control. ${name} status report. `

  if (status === 'online') {
    message += `System is online and operational. Battery at ${battery} percent.`
    if (battery < 20) {
      message += ' Warning: Low battery detected. Recommend return to base.'
    }
  } else if (status === 'offline') {
    message += 'System is offline. No connection established.'
  } else if (status === 'error') {
    message += 'Critical system fault detected. Immediate attention required.'
  } else {
    message += 'Status unknown. Awaiting telemetry.'
  }

  return speak(message)
}

/**
 * Confirm a command via voice
 */
export async function speakCommandConfirmation(command) {
  const messages = {
    CLAW_OPEN: 'Claw open command executed.',
    CLAW_CLOSE: 'Claw close command executed.',
    MOVE_FORWARD: 'Moving forward.',
    MOVE_BACKWARD: 'Reversing.',
    ROTATE_LEFT: 'Rotating left.',
    ROTATE_RIGHT: 'Rotating right.',
    STOP: 'All stop. Robot halted.',
    EMERGENCY_STOP: 'Emergency stop activated. All systems halted.',
    ARM_UP: 'Arm raised.',
    ARM_DOWN: 'Arm lowered.',
    HOME: 'Returning to home position.',
  }
  const text = messages[command] || `Command ${command} transmitted.`
  return speak(text)
}
