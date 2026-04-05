import 'dotenv/config'
import mongoose from 'mongoose'

const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/petcare'
const mongoPassword = (process.env.MONGO_PASSWORD || '').trim()

if (!mongoPassword) {
  throw new Error('MONGO_PASSWORD is missing in server/.env')
}

const atlasUri = `mongodb+srv://chouhanvarsha222_db_user:${encodeURIComponent(
  mongoPassword,
)}@petcare.k98c0a1.mongodb.net/petcare?retryWrites=true&w=majority&appName=petcare`

const LOCAL_DB_NAME = 'petcare'
const ATLAS_DB_NAME = 'petcare'

async function migrate() {
  const localConn = await mongoose.createConnection(localUri).asPromise()
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise()

  try {
    const localDb = localConn.useDb(LOCAL_DB_NAME).db
    const atlasDb = atlasConn.useDb(ATLAS_DB_NAME).db

    const collections = await localDb.listCollections().toArray()
    const names = collections.map((c) => c.name).filter(Boolean)

    if (names.length === 0) {
      console.log('No local collections found in petcare DB. Nothing to migrate.')
      return
    }

    console.log(`Migrating ${names.length} collections: ${names.join(', ')}`)

    for (const name of names) {
      const source = localDb.collection(name)
      const target = atlasDb.collection(name)

      const docs = await source.find({}).toArray()
      await target.deleteMany({})

      if (docs.length > 0) {
        await target.insertMany(docs, { ordered: false })
      }

      const srcCount = await source.countDocuments()
      const dstCount = await target.countDocuments()
      console.log(`${name}: local=${srcCount}, atlas=${dstCount}`)
    }

    console.log('Migration completed successfully.')
  } finally {
    await localConn.close()
    await atlasConn.close()
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})

