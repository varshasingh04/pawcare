import 'dotenv/config'
import { app } from './app.js'
import { ensureDatabaseConnected } from './db.js'

const PORT = process.env.PORT || 4000

async function main() {
  await ensureDatabaseConnected()
  app.listen(PORT, () => {
    console.log(`API http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
