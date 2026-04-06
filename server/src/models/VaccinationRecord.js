import mongoose from 'mongoose'

const vaccinationRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vaccineType: {
      type: String,
      required: true,
      enum: [
        'rabies',
        'dhpp',
        'bordetella',
        'leptospirosis',
        'lyme',
        'canine_influenza',
        'fvrcp',
        'felv',
        'deworming',
        'flea_tick',
        'other',
      ],
    },
    vaccineName: { type: String, trim: true },
    dateGiven: { type: Date, required: true },
    nextDueDate: { type: Date, required: true },
    vetName: { type: String, required: true, trim: true },
    proofImage: { type: String, required: true },
    proofMimeType: { type: String, required: true },
    notes: { type: String, trim: true },
    reminder: { type: mongoose.Schema.Types.ObjectId, ref: 'Reminder' },
  },
  { timestamps: true },
)

vaccinationRecordSchema.index({ pet: 1, dateGiven: -1 })
vaccinationRecordSchema.index({ owner: 1 })

export const VaccinationRecord =
  mongoose.models.VaccinationRecord || mongoose.model('VaccinationRecord', vaccinationRecordSchema)
