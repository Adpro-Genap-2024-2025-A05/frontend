import ky from 'ky'

const CHAT_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_BASE_URL ?? 'http://localhost:3001'

const chatApi = ky.create({
  prefixUrl: CHAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default chatApi
