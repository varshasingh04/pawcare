import mongoose from 'mongoose'

const helpPostSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['lost_pet', 'found_pet', 'medical_help', 'adoption', 'foster', 'general'],
      default: 'general',
    },
    urgent: { type: Boolean, default: false },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    contactPhone: { type: String, trim: true },
    petType: { type: String, trim: true },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  },
  { timestamps: true },
)

helpPostSchema.index({ status: 1, createdAt: -1 })
helpPostSchema.index({ 'location.lat': 1, 'location.lng': 1 })

export const HelpPost = mongoose.models.HelpPost || mongoose.model('HelpPost', helpPostSchema)
