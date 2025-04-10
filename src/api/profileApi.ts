import ky from 'ky'

const PROFILE_BASE_URL =
  process.env.NEXT_PUBLIC_PROFILE_BASE_URL ?? 'http://localhost:3001'

const profileApi = ky.create({
  prefixUrl: PROFILE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default profileApi
