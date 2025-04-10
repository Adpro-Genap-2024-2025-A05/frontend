import ky from 'ky'

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? 'http://localhost:3001'

const authApi = ky.create({
  prefixUrl: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default authApi
