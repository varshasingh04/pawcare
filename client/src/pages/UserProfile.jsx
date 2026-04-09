import { useState } from 'react'
import { User, Mail, Bell, Shield, ChevronRight, X, Check, Save, Phone } from 'lucide-react'
import { useAuth } from '../AuthContext.jsx'
import { useTheme } from '../ThemeContext'
import { api } from '../api'

function EditModal({ isOpen, onClose, title, children }) {
  const { theme } = useTheme()
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-display text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function UserProfile() {
  const { user, refreshUser } = useAuth()
  const { theme } = useTheme()
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'
  
  const [activeModal, setActiveModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    notifications: {
      emailReminders: true,
      vaccineAlerts: true,
      appointmentReminders: true
    }
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('notifications.')) {
      const key = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: checked }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleSavePersonalDetails = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.updateProfile({ name: formData.name, phone: formData.phone })
      if (refreshUser) await refreshUser()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => {
        setActiveModal(null)
        setMessage({ type: '', text: '' })
      }, 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmail = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.updateProfile({ email: formData.email })
      if (refreshUser) await refreshUser()
      setMessage({ type: 'success', text: 'Email updated successfully!' })
      setTimeout(() => {
        setActiveModal(null)
        setMessage({ type: '', text: '' })
      }, 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update email' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await api.updateProfile({ notifications: formData.notifications })
      setMessage({ type: 'success', text: 'Notification preferences saved!' })
      setTimeout(() => {
        setActiveModal(null)
        setMessage({ type: '', text: '' })
      }, 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save preferences' })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      const data = await api.exportUserData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pawcare-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: 'Data exported successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to export data' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-colors ${
    theme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-primary-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500'
  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`

  const buttonClass = `flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold transition-all ${
    loading ? 'opacity-50 cursor-not-allowed' : ''
  } bg-primary-500 hover:bg-primary-600 text-white`

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className={`font-display text-3xl font-bold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>Profile</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          Account and notification preferences.
        </p>
      </div>

      <div className={`rounded-3xl border shadow-card overflow-hidden divide-y ${
        theme === 'dark' 
          ? 'bg-slate-800 border-slate-700 divide-slate-700' 
          : 'bg-white border-slate-100/90 divide-slate-100'
      }`}>
        <div className="p-6 sm:p-8 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-display font-bold shadow-lg">
            {initial}
          </div>
          <div>
            <p className={`font-display font-bold text-xl ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>{user?.name || 'Member'}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Pet parent · PawCare member
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, name: user?.name || '', phone: user?.phone || '' }))
            setActiveModal('personal')
          }}
          className={`w-full flex items-center gap-4 p-5 sm:px-8 text-left transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80'
          }`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            theme === 'dark' ? 'bg-sky-900/50 text-sky-400' : 'bg-sky-50 text-sky-600'
          }`}>
            <User className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Personal details
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Name, phone number
            </p>
          </div>
          <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-300'}`} />
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, email: user?.email || '' }))
            setActiveModal('email')
          }}
          className={`w-full flex items-center gap-4 p-5 sm:px-8 text-left transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80'
          }`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            theme === 'dark' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Mail className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Email
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              {user?.email || '—'}
            </p>
          </div>
          <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-300'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('notifications')}
          className={`w-full flex items-center gap-4 p-5 sm:px-8 text-left transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80'
          }`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            theme === 'dark' ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-50 text-amber-600'
          }`}>
            <Bell className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Notifications
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Reminders for vaccines & meds
            </p>
          </div>
          <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-300'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('privacy')}
          className={`w-full flex items-center gap-4 p-5 sm:px-8 text-left transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80'
          }`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            theme === 'dark' ? 'bg-slate-700 text-gray-400' : 'bg-slate-100 text-slate-600'
          }`}>
            <Shield className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Privacy & data
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Export or delete your data
            </p>
          </div>
          <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-300'}`} />
        </button>
      </div>

      {/* Personal Details Modal */}
      <EditModal
        isOpen={activeModal === 'personal'}
        onClose={() => setActiveModal(null)}
        title="Edit Personal Details"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Enter your phone number"
            />
          </div>
          {message.text && (
            <p className={`text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : null}
              {message.text}
            </p>
          )}
          <button
            onClick={handleSavePersonalDetails}
            disabled={loading}
            className={buttonClass}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </EditModal>

      {/* Email Modal */}
      <EditModal
        isOpen={activeModal === 'email'}
        onClose={() => setActiveModal(null)}
        title="Change Email"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Enter your email"
            />
          </div>
          {message.text && (
            <p className={`text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : null}
              {message.text}
            </p>
          )}
          <button
            onClick={handleSaveEmail}
            disabled={loading}
            className={buttonClass}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Update Email'}
          </button>
        </div>
      </EditModal>

      {/* Notifications Modal */}
      <EditModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        title="Notification Preferences"
      >
        <div className="space-y-4">
          <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${
            theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Email Reminders
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Receive reminders via email
              </p>
            </div>
            <input
              type="checkbox"
              name="notifications.emailReminders"
              checked={formData.notifications.emailReminders}
              onChange={handleInputChange}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
            />
          </label>
          
          <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${
            theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Vaccine Alerts
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Get notified about upcoming vaccines
              </p>
            </div>
            <input
              type="checkbox"
              name="notifications.vaccineAlerts"
              checked={formData.notifications.vaccineAlerts}
              onChange={handleInputChange}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
            />
          </label>
          
          <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${
            theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Appointment Reminders
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Remind me of vet appointments
              </p>
            </div>
            <input
              type="checkbox"
              name="notifications.appointmentReminders"
              checked={formData.notifications.appointmentReminders}
              onChange={handleInputChange}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
            />
          </label>

          {message.text && (
            <p className={`text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : null}
              {message.text}
            </p>
          )}
          <button
            onClick={handleSaveNotifications}
            disabled={loading}
            className={buttonClass}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </EditModal>

      {/* Privacy & Data Modal */}
      <EditModal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy & Data"
      >
        <div className="space-y-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your personal data and privacy settings.
          </p>
          
          <button
            onClick={handleExportData}
            disabled={loading}
            className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold transition-all ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Shield className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export My Data'}
          </button>
          
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-100'
          }`}>
            <p className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
              Danger Zone
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-300/70' : 'text-red-600/70'}`}>
              To delete your account, please contact support. This action cannot be undone.
            </p>
          </div>
          
          {message.text && (
            <p className={`text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : null}
              {message.text}
            </p>
          )}
        </div>
      </EditModal>
    </div>
  )
}
