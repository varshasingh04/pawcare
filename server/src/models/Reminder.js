import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    title: { type: String, required: true },
    petName: { type: String, default: '' },
    kind: {
      type: String,
      enum: ['vaccination', 'deworming', 'medicine', 'appointment', 'grooming', 'food', 'custom'],
      default: 'custom',
    },
    dueDate: { type: Date },
    dueLabel: { type: String, default: '' },
    notes: { type: String, trim: true, default: '' },
    urgent: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
  },
  { timestamps: true },
)

reminderSchema.index({ owner: 1, status: 1 })
reminderSchema.index({ owner: 1, dueDate: 1 })

export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema)
