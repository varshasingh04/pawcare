import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    vetName: String,
  },
  { timestamps: true },
)

export const Appointment =
  mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)
