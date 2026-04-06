import mongoose from 'mongoose'

const sightingSchema = new mongoose.Schema(
  {
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    notes: { type: String, trim: true },
    reportedBy: { type: String, trim: true },
    contactInfo: { type: String, trim: true },
  },
  { timestamps: true },
)

const lostPetReportSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['lost', 'found', 'reunited'],
      default: 'lost',
    },
    lastSeenLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      address: { type: String, required: true },
    },
    lastSeenDate: { type: Date, required: true },
    description: { type: String, trim: true },
    wearing: { type: String, trim: true },
    behaviorNotes: { type: String, trim: true },
    reward: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    contactWhatsApp: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    sightings: { type: [sightingSchema], default: [] },
    resolvedAt: { type: Date },
    resolvedNotes: { type: String, trim: true },
  },
  { timestamps: true },
)

lostPetReportSchema.index({ pet: 1 })
lostPetReportSchema.index({ owner: 1 })
lostPetReportSchema.index({ status: 1 })
lostPetReportSchema.index({ 'lastSeenLocation.lat': 1, 'lastSeenLocation.lng': 1 })

export const LostPetReport =
  mongoose.models.LostPetReport || mongoose.model('LostPetReport', lostPetReportSchema)
