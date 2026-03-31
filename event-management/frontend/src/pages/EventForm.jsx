import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'
import { FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi'

const CATEGORIES = ['Conference', 'Workshop', 'Seminar', 'Hackathon', 'Cultural', 'Sports', 'Networking', 'Webinar', 'Exhibition', 'Other']

const defaultForm = {
  title: '', description: '', category: 'Conference', fee: 0, isFree: true,
  startDate: '', endDate: '', registrationDeadline: '', capacity: 100,
  status: 'published', tags: '',
  venue: { name: '', address: '', city: '', state: '', country: 'India', isOnline: false, onlineLink: '' },
  agenda: [],
  speakers: [],
  customFields: [],
}

export default function EventForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`)
        const e = data.event
        setForm({
          ...e,
          tags: e.tags?.join(', ') || '',
          startDate: e.startDate ? e.startDate.slice(0, 16) : '',
          endDate: e.endDate ? e.endDate.slice(0, 16) : '',
          registrationDeadline: e.registrationDeadline ? e.registrationDeadline.slice(0, 16) : '',
        })
      } catch {
        toast.error('Failed to load event')
        navigate('/admin')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id, isEdit, navigate])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setVenue = (key, value) => setForm((f) => ({ ...f, venue: { ...f.venue, [key]: value } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        fee: Number(form.fee),
        capacity: Number(form.capacity),
        isFree: Number(form.fee) === 0,
      }

      if (isEdit) {
        await api.put(`/events/${id}`, payload)
        toast.success('Event updated!')
      } else {
        await api.post('/events', payload)
        toast.success('Event created!')
      }
      navigate('/admin')
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to save'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const addAgendaItem = () => set('agenda', [...form.agenda, { time: '', title: '', speaker: '', description: '' }])
  const removeAgendaItem = (i) => set('agenda', form.agenda.filter((_, idx) => idx !== i))
  const updateAgendaItem = (i, key, value) => {
    const updated = [...form.agenda]
    updated[i] = { ...updated[i], [key]: value }
    set('agenda', updated)
  }

  const addSpeaker = () => set('speakers', [...form.speakers, { name: '', designation: '', bio: '', photo: '' }])
  const removeSpeaker = (i) => set('speakers', form.speakers.filter((_, idx) => idx !== i))
  const updateSpeaker = (i, key, value) => {
    const updated = [...form.speakers]
    updated[i] = { ...updated[i], [key]: value }
    set('speakers', updated)
  }

  const addCustomField = () => set('customFields', [...form.customFields, { label: '', fieldType: 'text', options: [], required: false }])
  const removeCustomField = (i) => set('customFields', form.customFields.filter((_, idx) => idx !== i))
  const updateCustomField = (i, key, value) => {
    const updated = [...form.customFields]
    updated[i] = { ...updated[i], [key]: value }
    set('customFields', updated)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. React Developer Conference 2024" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="Describe your event in detail..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input type="number" min="1" required value={form.capacity} onChange={(e) => set('capacity', e.target.value)}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹, 0 for free)</label>
                <input type="number" min="0" value={form.fee} onChange={(e) => set('fee', e.target.value)}
                  className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)}
                placeholder="e.g. react, javascript, frontend" className="input-field" />
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Date & Time</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                <input type="datetime-local" required value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                <input type="datetime-local" required value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline *</label>
                <input type="datetime-local" required value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Venue</h2>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isOnline" checked={form.venue.isOnline} onChange={(e) => setVenue('isOnline', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">This is an online event</label>
            </div>
            {form.venue.isOnline ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Online Meeting Link</label>
                <input type="url" value={form.venue.onlineLink} onChange={(e) => setVenue('onlineLink', e.target.value)}
                  placeholder="https://meet.google.com/..." className="input-field" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                  <input type="text" required={!form.venue.isOnline} value={form.venue.name} onChange={(e) => setVenue('name', e.target.value)}
                    placeholder="e.g. HICC Convention Center" className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={form.venue.address} onChange={(e) => setVenue('address', e.target.value)}
                    placeholder="Street address" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" required={!form.venue.isOnline} value={form.venue.city} onChange={(e) => setVenue('city', e.target.value)}
                    placeholder="Hyderabad" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={form.venue.state} onChange={(e) => setVenue('state', e.target.value)}
                    placeholder="Telangana" className="input-field" />
                </div>
              </div>
            )}
          </div>

          {/* Agenda */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Agenda</h2>
              <button type="button" onClick={addAgendaItem} className="btn-secondary text-sm py-1.5 flex items-center gap-1">
                <FiPlus size={14} /> Add Item
              </button>
            </div>
            {form.agenda.map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg relative">
                <button type="button" onClick={() => removeAgendaItem(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <FiTrash2 size={10} />
                </button>
                <input type="text" placeholder="Time (e.g. 10:00 AM)" value={item.time} onChange={(e) => updateAgendaItem(i, 'time', e.target.value)} className="input-field text-sm" />
                <input type="text" placeholder="Session Title" value={item.title} onChange={(e) => updateAgendaItem(i, 'title', e.target.value)} className="input-field text-sm" />
                <input type="text" placeholder="Speaker name" value={item.speaker} onChange={(e) => updateAgendaItem(i, 'speaker', e.target.value)} className="input-field text-sm" />
                <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateAgendaItem(i, 'description', e.target.value)} className="input-field text-sm" />
              </div>
            ))}
            {form.agenda.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No agenda items. Click "Add Item" to add.</p>}
          </div>

          {/* Speakers */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Speakers</h2>
              <button type="button" onClick={addSpeaker} className="btn-secondary text-sm py-1.5 flex items-center gap-1">
                <FiPlus size={14} /> Add Speaker
              </button>
            </div>
            {form.speakers.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg relative">
                <button type="button" onClick={() => removeSpeaker(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <FiTrash2 size={10} />
                </button>
                <input type="text" placeholder="Name" value={s.name} onChange={(e) => updateSpeaker(i, 'name', e.target.value)} className="input-field text-sm" />
                <input type="text" placeholder="Designation / Title" value={s.designation} onChange={(e) => updateSpeaker(i, 'designation', e.target.value)} className="input-field text-sm" />
                <input type="text" placeholder="Short bio" value={s.bio} onChange={(e) => updateSpeaker(i, 'bio', e.target.value)} className="input-field text-sm col-span-2" />
              </div>
            ))}
            {form.speakers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No speakers added.</p>}
          </div>

          {/* Custom Fields */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-900">Custom Registration Fields</h2>
              <button type="button" onClick={addCustomField} className="btn-secondary text-sm py-1.5 flex items-center gap-1">
                <FiPlus size={14} /> Add Field
              </button>
            </div>
            {form.customFields.map((field, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg relative">
                <button type="button" onClick={() => removeCustomField(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <FiTrash2 size={10} />
                </button>
                <input type="text" placeholder="Field Label" value={field.label} onChange={(e) => updateCustomField(i, 'label', e.target.value)} className="input-field text-sm" />
                <select value={field.fieldType} onChange={(e) => updateCustomField(i, 'fieldType', e.target.value)} className="input-field text-sm">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="select">Dropdown</option>
                </select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`req-${i}`} checked={field.required} onChange={(e) => updateCustomField(i, 'required', e.target.checked)} />
                  <label htmlFor={`req-${i}`} className="text-sm text-gray-600">Required</label>
                </div>
                {field.fieldType === 'select' && (
                  <div className="col-span-3">
                    <input type="text" placeholder="Options (comma separated): Option 1, Option 2"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateCustomField(i, 'options', e.target.value.split(',').map((o) => o.trim()).filter(Boolean))}
                      className="input-field text-sm" />
                  </div>
                )}
              </div>
            ))}
            {form.customFields.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No custom fields added.</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
