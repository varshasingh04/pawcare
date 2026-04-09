import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    notifications: {
      emailReminders: { type: Boolean, default: true },
      vaccineAlerts: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
