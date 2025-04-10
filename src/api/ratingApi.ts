import ky from 'ky'

const RATING_BASE_URL =
  process.env.NEXT_PUBLIC_RATING_BASE_URL ?? 'http://localhost:3001'

const ratingApi = ky.create({
  prefixUrl: RATING_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default ratingApi
