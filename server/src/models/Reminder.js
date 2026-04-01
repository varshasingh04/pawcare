import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    petName: { type: String, required: true },
    kind: { type: String, enum: ['vaccination', 'deworming', 'medicine'], required: true },
    dueLabel: { type: String, required: true },
    urgent: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
  },
  { timestamps: true },
)

export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema)
