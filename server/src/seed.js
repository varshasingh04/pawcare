import bcrypt from 'bcryptjs'
import { User } from './models/User.js'
import { Pet } from './models/Pet.js'
import { Reminder } from './models/Reminder.js'
import { Vet } from './models/Vet.js'
import { createUniqueShareToken } from './lib/shareToken.js'

const DEMO_EMAIL = 'john@example.com'
const DEMO_PASSWORD = 'password123'

async function ensureDemoUser() {
  let user = await User.findOne({ email: DEMO_EMAIL })
  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
    user = await User.create({
      email: DEMO_EMAIL,
      passwordHash,
      name: 'John',
      phone: '+1 555 0199',
    })
  } else if (!user.phone || !String(user.phone).trim()) {
    user.phone = '+1 555 0199'
    await user.save()
  }
  return user
}

async function ensurePetShareTokens() {
  const missing = await Pet.find({
    $or: [{ shareToken: { $exists: false } }, { shareToken: null }, { shareToken: '' }],
  })
  for (const pet of missing) {
    pet.shareToken = await createUniqueShareToken()
    await pet.save()
  }
}

export async function seedIfEmpty() {
  const vetCount = await Vet.countDocuments()
  if (vetCount === 0) {
    await Vet.insertMany([
      {
        name: 'BrightPaws Animal Hospital',
        address: '12 Maple Ave, Downtown',
        rating: 4.9,
        distanceKm: 1.2,
        availability: 'Open today · until 8 PM',
        availableToday: true,
        emergency: true,
        phone: '+1 555 0101',
        hours: '24/7 ER',
      },
      {
        name: 'Greenfield Vet Clinic',
        address: '88 River Rd',
        rating: 4.7,
        distanceKm: 3.4,
        availability: 'Next slot: tomorrow 10 AM',
        availableToday: false,
        emergency: true,
        phone: '+1 555 0102',
        hours: '24/7',
      },
      {
        name: 'Sunrise Pet Wellness',
        address: '400 Oak St',
        rating: 4.8,
        distanceKm: 2.1,
        availability: 'Open today · walk-ins OK',
        availableToday: true,
        emergency: false,
        phone: '+1 555 0103',
      },
      {
        name: 'Harbor Veterinary Center',
        address: '2 Harbor View',
        rating: 4.6,
        distanceKm: 4.8,
        availability: 'Open today · until 6 PM',
        availableToday: true,
        emergency: false,
        phone: '+1 555 0104',
      },
    ])
  }

  const demoUser = await ensureDemoUser()

  await Pet.updateMany(
    { $or: [{ owner: { $exists: false } }, { owner: null }] },
    { $set: { owner: demoUser._id } },
  )
  await Reminder.updateMany(
    { $or: [{ owner: { $exists: false } }, { owner: null }] },
    { $set: { owner: demoUser._id } },
  )

  const petCount = await Pet.countDocuments()
  if (petCount === 0) {
    await Pet.create({
      owner: demoUser._id,
      shareToken: await createUniqueShareToken(),
      name: 'Luna',
      type: 'Dog',
      age: 3,
      weight: 12.5,
      breed: 'Golden Retriever',
      photoEmoji: '🐕',
      medicalHistory: [
        { date: 'Dec 2024', title: 'Annual exam', detail: 'All vitals normal; diet adjusted.' },
        { date: 'Aug 2024', title: 'DHPP vaccine', detail: 'No adverse reactions.' },
      ],
      schedules: [
        { type: 'vaccine', label: 'Bordetella', when: 'Mar 28, 2025' },
        { type: 'medicine', label: 'Heartworm preventive', when: 'Monthly — due in 5 days' },
      ],
    })
    await Pet.create({
      owner: demoUser._id,
      shareToken: await createUniqueShareToken(),
      name: 'Milo',
      type: 'Cat',
      age: 5,
      weight: 4.2,
      breed: 'Domestic Shorthair',
      photoEmoji: '🐱',
      medicalHistory: [
        { date: 'Nov 2024', title: 'Dental cleaning', detail: 'Minor tartar; home brushing advised.' },
      ],
      schedules: [
        { type: 'vaccine', label: 'FVRCP booster', when: 'Overdue — book soon' },
        { type: 'medicine', label: 'Deworming', when: 'Due in 3 days' },
      ],
    })
  }

  await ensurePetShareTokens()

  const remCount = await Reminder.countDocuments()
  if (remCount === 0) {
    await Reminder.insertMany([
      {
        owner: demoUser._id,
        title: 'Deworming',
        petName: 'Milo',
        kind: 'deworming',
        dueLabel: 'Due in 3 days',
        urgent: false,
        status: 'upcoming',
      },
      {
        owner: demoUser._id,
        title: 'Rabies vaccination',
        petName: 'Luna',
        kind: 'vaccination',
        dueLabel: 'Due next month',
        urgent: false,
        status: 'upcoming',
      },
      {
        owner: demoUser._id,
        title: 'FVRCP vaccination',
        petName: 'Milo',
        kind: 'vaccination',
        dueLabel: 'Vaccination overdue',
        urgent: true,
        status: 'upcoming',
      },
    ])
  }
}
