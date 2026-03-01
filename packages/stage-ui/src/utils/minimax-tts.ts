export interface MiniMaxTTSOptions {
  text: string
  voiceId?: string
  speed?: number
  emotion?: string
  apiKey?: string
  groupId?: string
}

export async function generateSpeechMiniMax(options: MiniMaxTTSOptions): Promise<ArrayBuffer> {
  const { text, voiceId = 'Calm_Woman', speed = 1.0, emotion = 'happy', apiKey, groupId } = options

  const API_KEY = apiKey || import.meta.env.VITE_MINIMAX_API_KEY
  const GROUP_ID = groupId || import.meta.env.VITE_MINIMAX_GROUP_ID

  if (!API_KEY || !GROUP_ID) {
    throw new Error('MiniMax API key or Group ID not configured.')
  }

  const res = await fetch(`https://api.minimax.io/v1/t2a_v2?GroupId=${GROUP_ID}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'speech-02-hd',
      text,
      voice_setting: {
        voice_id: voiceId,
        speed,
        vol: 1.0,
        pitch: 0,
      },
      audio_setting: {
        audio_sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
      },
    }),
  })

  const data = await res.json()

  if (data.base_resp?.status_code !== 0) {
    throw new Error(`MiniMax TTS error: ${data.base_resp?.status_msg}`)
  }

  // hex → ArrayBuffer
  const hex = data.data?.audio as string
  if (!hex) {
    throw new Error('MiniMax TTS error: no audio data in response')
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16)
  }

  return bytes.buffer
}
