import mongoose from 'mongoose'

const vetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    rating: { type: Number, default: 4.5 },
    distanceKm: { type: Number, default: 2 },
    availability: String,
    availableToday: { type: Boolean, default: true },
    emergency: { type: Boolean, default: false },
    phone: String,
    hours: String,
  },
  { timestamps: true },
)

export const Vet = mongoose.models.Vet || mongoose.model('Vet', vetSchema)
