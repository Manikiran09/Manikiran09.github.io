import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'
import {
  FiCalendar, FiMapPin, FiUsers, FiClock, FiTag, FiDollarSign,
  FiArrowLeft, FiCheckCircle, FiXCircle, FiShare2, FiLink
} from 'react-icons/fi'

const categoryColors = {
  Conference: 'bg-purple-100 text-purple-700',
  Workshop: 'bg-green-100 text-green-700',
  Seminar: 'bg-blue-100 text-blue-700',
  Hackathon: 'bg-orange-100 text-orange-700',
  Cultural: 'bg-pink-100 text-pink-700',
  Sports: 'bg-yellow-100 text-yellow-700',
  Networking: 'bg-indigo-100 text-indigo-700',
  Webinar: 'bg-teal-100 text-teal-700',
  Exhibition: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
}

export default function EventDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [customResponses, setCustomResponses] = useState([])
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`)
        setEvent(data.event)
        // Init custom responses
        if (data.event.customFields?.length > 0) {
          setCustomResponses(data.event.customFields.map((f) => ({ label: f.label, value: '' })))
        }
      } catch {
        toast.error('Event not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    const checkRegistration = async () => {
      if (!user) return
      try {
        const { data } = await api.get('/registrations/my', { params: { limit: 100 } })
        const reg = data.registrations.find((r) => r.event?._id === id)
        if (reg) setRegistration(reg)
      } catch { /* ignore */ }
    }

    fetchEvent()
    checkRegistration()
  }, [id, user, navigate])

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } })
      return
    }

    if (event.customFields?.length > 0 && !showForm) {
      setShowForm(true)
      return
    }

    setRegistering(true)
    try {
      const { data } = await api.post('/registrations', {
        eventId: id,
        customFieldResponses: customResponses.filter((r) => r.value),
      })
      setRegistration(data.registration)
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount + 1 }))
      toast.success('Successfully registered! 🎉')
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleCancel = async () => {
    try {
      await api.put(`/registrations/${registration._id}/cancel`)
      setRegistration({ ...registration, status: 'cancelled' })
      setEvent((prev) => ({ ...prev, registeredCount: Math.max(0, prev.registeredCount - 1) }))
      toast.success('Registration cancelled')
      setCancelConfirm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!event) return null

  const isFull = event.registeredCount >= event.capacity
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline)
  const isRegistered = registration && registration.status !== 'cancelled'
  const availableSlots = event.capacity - event.registeredCount
  const fillPercent = Math.min((event.registeredCount / event.capacity) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700">
        {event.banner && <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 w-full">
            <Link to="/" className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3">
              <FiArrowLeft size={14} /> Back to Events
            </Link>
            <div className="flex items-start gap-3 flex-wrap">
              <span className={`badge ${categoryColors[event.category] || 'bg-gray-100 text-gray-700'}`}>
                {event.category}
              </span>
              {event.isFree ? (
                <span className="badge bg-green-500 text-white">FREE</span>
              ) : (
                <span className="badge bg-blue-500 text-white">₹{event.fee}</span>
              )}
              {event.status === 'cancelled' && (
                <span className="badge bg-red-500 text-white">CANCELLED</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <button onClick={handleShare} className="text-gray-400 hover:text-blue-600 flex-shrink-0">
                  <FiShare2 size={20} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">by <span className="font-medium">{event.organizer?.name}</span>
                {event.organizer?.organization && ` · ${event.organizer.organization}`}
              </p>
              <div className="mt-4 prose max-w-none text-gray-700 whitespace-pre-line">
                {event.description}
              </div>
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      <FiTag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Agenda */}
            {event.agenda?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Agenda</h2>
                <div className="space-y-3">
                  {event.agenda.map((item, i) => (
                    <div key={i} className="flex gap-4 pb-3 border-b border-gray-100 last:border-0">
                      <div className="text-blue-600 font-mono text-sm w-20 flex-shrink-0">{item.time}</div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.speaker && <p className="text-sm text-gray-500">Speaker: {item.speaker}</p>}
                        {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {event.speakers?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Speakers</h2>
                <div className="grid grid-cols-2 gap-4">
                  {event.speakers.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-blue-700 font-bold text-lg">{s.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.designation}</p>
                        {s.bio && <p className="text-xs text-gray-500 mt-1">{s.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Registration</h2>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiCalendar className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{format(new Date(event.startDate), 'EEEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-gray-500">{format(new Date(event.startDate), 'h:mm a')} – {format(new Date(event.endDate), 'h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMapPin className="text-red-400 flex-shrink-0" />
                  <div>
                    {event.venue?.isOnline ? (
                      <>
                        <p className="font-medium">Online Event</p>
                        {event.venue.onlineLink && isRegistered && (
                          <a href={event.venue.onlineLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                            <FiLink size={12} /> Join Link
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium">{event.venue?.name}</p>
                        <p className="text-sm text-gray-500">{event.venue?.address}, {event.venue?.city}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiUsers className="text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{event.registeredCount} / {event.capacity} registered</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${fillPercent > 80 ? 'bg-red-400' : fillPercent > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiClock className="text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Registration deadline</p>
                    <p className="font-medium">{format(new Date(event.registrationDeadline), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiDollarSign className="text-purple-500 flex-shrink-0" />
                  <p className="font-medium">{event.isFree ? 'Free' : `₹${event.fee}`}</p>
                </div>
              </div>

              {/* Custom field form */}
              {showForm && event.customFields?.length > 0 && (
                <div className="mb-4 space-y-3 border-t pt-4">
                  <p className="text-sm font-medium text-gray-700">Additional Information</p>
                  {event.customFields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.fieldType === 'select' ? (
                        <select
                          className="input-field text-sm"
                          required={field.required}
                          value={customResponses[i]?.value || ''}
                          onChange={(e) => {
                            const updated = [...customResponses]
                            updated[i] = { label: field.label, value: e.target.value }
                            setCustomResponses(updated)
                          }}
                        >
                          <option value="">Select...</option>
                          {field.options.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.fieldType === 'number' ? 'number' : 'text'}
                          required={field.required}
                          className="input-field text-sm"
                          value={customResponses[i]?.value || ''}
                          onChange={(e) => {
                            const updated = [...customResponses]
                            updated[i] = { label: field.label, value: e.target.value }
                            setCustomResponses(updated)
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Registration status */}
              {isRegistered ? (
                <div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3 mb-3">
                    <FiCheckCircle />
                    <div>
                      <p className="font-medium text-sm">You're registered!</p>
                      <p className="text-xs text-gray-500">ID: {registration.registrationId}</p>
                    </div>
                  </div>
                  {cancelConfirm ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 font-medium text-center">Cancel your registration?</p>
                      <div className="flex gap-2">
                        <button onClick={handleCancel} className="flex-1 btn-danger text-sm py-2">Yes, Cancel</button>
                        <button onClick={() => setCancelConfirm(false)} className="flex-1 btn-secondary text-sm py-2">Keep It</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setCancelConfirm(true)} className="w-full btn-danger text-sm py-2">
                      Cancel Registration
                    </button>
                  )}
                </div>
              ) : event.status === 'cancelled' ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
                  <FiXCircle /> <span className="text-sm font-medium">Event Cancelled</span>
                </div>
              ) : isFull ? (
                <div className="text-center py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  Event is Full
                </div>
              ) : isDeadlinePassed ? (
                <div className="text-center py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium">
                  Registration Closed
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="btn-primary w-full py-2.5"
                >
                  {registering ? 'Registering...' : showForm ? 'Confirm Registration' : 'Register Now'}
                </button>
              )}

              {availableSlots > 0 && availableSlots <= 10 && !isFull && (
                <p className="text-xs text-orange-500 text-center mt-2 font-medium">
                  Only {availableSlots} spots left!
                </p>
              )}
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Organized by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">{event.organizer?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizer?.name}</p>
                  {event.organizer?.organization && (
                    <p className="text-sm text-gray-500">{event.organizer.organization}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
