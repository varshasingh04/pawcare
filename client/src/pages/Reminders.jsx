import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Syringe,
  Pill,
  AlertTriangle,
  Bell,
  Plus,
  Calendar,
  Scissors,
  ShoppingBag,
  CheckCircle,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react'
import { api } from '../api'
import { EmptyState } from '../components/EmptyState'

const KIND_CONFIG = {
  vaccination: { icon: Syringe, label: 'Vaccination', color: 'sky' },
  deworming: { icon: Pill, label: 'Deworming', color: 'violet' },
  medicine: { icon: Pill, label: 'Medicine', color: 'emerald' },
  appointment: { icon: Calendar, label: 'Appointment', color: 'blue' },
  grooming: { icon: Scissors, label: 'Grooming', color: 'pink' },
  food: { icon: ShoppingBag, label: 'Food/Supplies', color: 'amber' },
  custom: { icon: Bell, label: 'Custom', color: 'slate' },
}

export function Reminders() {
  const [reminders, setReminders] = useState([])
  const [pets, setPets] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    petId: '',
    kind: 'custom',
    dueDate: '',
    notes: '',
    urgent: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [remindersData, petsData] = await Promise.all([
        api.getReminders(),
        api.getPets(),
      ])
      setReminders(remindersData)
      setPets(petsData)
    } catch {
      setReminders([])
      setPets([])
    }
  }

  function openAddModal() {
    setForm({
      title: '',
      petId: '',
      kind: 'custom',
      dueDate: '',
      notes: '',
      urgent: false,
    })
    setShowAddModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return

    setSaving(true)
    try {
      await api.createReminder({
        title: form.title.trim(),
        petId: form.petId || null,
        kind: form.kind,
        dueDate: form.dueDate || null,
        notes: form.notes.trim(),
        urgent: form.urgent,
      })
      setShowAddModal(false)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to create reminder')
    }
    setSaving(false)
  }

  async function handleComplete(id) {
    try {
      await api.completeReminder(id)
      setReminders((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to complete reminder')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this reminder?')) return
    try {
      await api.deleteReminder(id)
      setReminders((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete reminder')
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Reminders</h1>
          <p className="mt-2 text-slate-600">Keep track of everything your pets need.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      <ul className="space-y-4">
        {reminders.length === 0 && (
          <li className="rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-emerald-50/50 to-white p-6">
            <EmptyState 
              type="reminders"
              action={
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
                >
                  <Plus className="w-5 h-5" />
                  Create your first reminder
                </button>
              }
            />
          </li>
        )}
        {reminders.map((r) => {
          const config = KIND_CONFIG[r.kind] || KIND_CONFIG.custom
          const Icon = config.icon
          const urgent = r.urgent
          const isOverdue = r.dueLabel?.toLowerCase().includes('overdue')

          return (
            <li
              key={r._id}
              className={`rounded-3xl border p-6 shadow-card transition-all ${
                urgent || isOverdue
                  ? 'bg-red-50/90 border-red-200 ring-1 ring-red-100'
                  : 'bg-white border-slate-100/90 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    urgent || isOverdue
                      ? 'bg-red-100 text-red-600'
                      : `bg-${config.color}-100 text-${config.color}-700`
                  }`}
                  style={
                    !urgent && !isOverdue
                      ? {
                          backgroundColor: `var(--color-${config.color}-100, #f0f9ff)`,
                          color: `var(--color-${config.color}-700, #0369a1)`,
                        }
                      : undefined
                  }
                >
                  <Icon className="w-6 h-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`font-display font-bold text-lg ${
                        urgent || isOverdue ? 'text-red-900' : 'text-slate-900'
                      }`}
                    >
                      {r.title}
                    </h2>
                    {(urgent || isOverdue) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white text-xs font-bold px-2.5 py-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {isOverdue ? 'Overdue' : 'Urgent'}
                      </span>
                    )}
                  </div>
                  {r.petName && (
                    <p className={`text-sm mt-1 ${urgent || isOverdue ? 'text-red-800/90' : 'text-slate-500'}`}>
                      {r.petName}
                    </p>
                  )}
                  {r.notes && (
                    <p className="text-sm text-slate-600 mt-1">{r.notes}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {r.dueLabel && (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                          urgent || isOverdue ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.dueLabel}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 capitalize">{config.label}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleComplete(r._id)}
                    className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Mark as done"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900">Add Reminder</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  What do you need to remember? *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g., Give medicine, Vet appointment"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <div>
                <label htmlFor="petId" className="block text-sm font-semibold text-slate-700 mb-2">
                  For which pet?
                </label>
                <select
                  id="petId"
                  value={form.petId}
                  onChange={(e) => setForm((f) => ({ ...f, petId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="">General (no specific pet)</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.photoEmoji} {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kind" className="block text-sm font-semibold text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    id="kind"
                    value={form.kind}
                    onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="custom">Custom</option>
                    <option value="medicine">Medicine</option>
                    <option value="appointment">Appointment</option>
                    <option value="grooming">Grooming</option>
                    <option value="food">Food/Supplies</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="deworming">Deworming</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-2">
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="notes"
                  type="text"
                  placeholder="Any extra details"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) => setForm((f) => ({ ...f, urgent: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-300"
                />
                <span className="text-sm font-medium text-slate-700">Mark as urgent</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Add Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
