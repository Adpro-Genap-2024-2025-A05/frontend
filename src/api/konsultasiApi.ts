import ky from 'ky'

const KONSULTASI_BASE_URL =
  process.env.NEXT_PUBLIC_KONSULTASI_BASE_URL ?? 'http://localhost:3001'

const konsultasiApi = ky.create({
  prefixUrl: KONSULTASI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default konsultasiApi
