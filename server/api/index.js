import 'dotenv/config'
import { app } from '../src/app.js'
import { ensureDatabaseConnected } from '../src/db.js'

export default async function handler(req, res) {
  try {
    await ensureDatabaseConnected()
    return app(req, res)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message || 'Server error' })
  }
}

