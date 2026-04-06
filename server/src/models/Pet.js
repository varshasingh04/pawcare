import mongoose from 'mongoose'

const historySchema = new mongoose.Schema(
  {
    date: String,
    title: String,
    detail: String,
  },
  { _id: false },
)

const scheduleSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['vaccine', 'medicine'] },
    label: String,
    when: String,
  },
  { _id: false },
)

const heatCycleSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { _id: true, timestamps: true },
)

const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    /** URL-safe token for public QR / lost-pet contact (unique, not the Mongo _id). */
    shareToken: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    breed: String,
    photoEmoji: { type: String, default: '🐾' },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    reproductiveStatus: { type: String, enum: ['intact', 'spayed', 'neutered', 'unknown'], default: 'unknown' },
    heatCycles: { type: [heatCycleSchema], default: [] },
    medicalHistory: { type: [historySchema], default: [] },
    schedules: { type: [scheduleSchema], default: [] },
  },
  { timestamps: true },
)

export const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema)
