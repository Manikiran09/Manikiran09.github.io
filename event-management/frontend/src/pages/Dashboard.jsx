import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { FiCalendar, FiMapPin, FiCheckCircle, FiXCircle, FiClock, FiUser } from 'react-icons/fi'

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  attended: 'bg-blue-100 text-blue-700',
  waitlisted: 'bg-orange-100 text-orange-700',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [cancelConfirmId, setCancelConfirmId] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = { limit: 50 }
        if (filter) params.status = filter
        const { data } = await api.get('/registrations/my', { params })
        setRegistrations(data.registrations)
      } catch {
        toast.error('Failed to load registrations')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filter])

  const handleCancel = async (reg) => {
    if (cancelConfirmId !== reg._id) {
      setCancelConfirmId(reg._id)
      return
    }
    try {
      await api.put(`/registrations/${reg._id}/cancel`)
      setRegistrations((prev) =>
        prev.map((r) => r._id === reg._id ? { ...r, status: 'cancelled' } : r)
      )
      toast.success('Registration cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancelConfirmId(null)
    }
  }

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter((r) => r.status === 'confirmed').length,
    attended: registrations.filter((r) => r.status === 'attended').length,
    cancelled: registrations.filter((r) => r.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-700 font-bold text-lg">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Confirmed', value: stats.confirmed, color: 'bg-green-50 text-green-700' },
            { label: 'Attended', value: stats.attended, color: 'bg-purple-50 text-purple-700' },
            { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 text-red-600' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'confirmed', 'attended', 'cancelled', 'waitlisted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
            >
              {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner size="lg" className="py-20" />
        ) : registrations.length === 0 ? (
          <div className="text-center py-20">
            <FiCalendar size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-lg">No registrations found</p>
            <Link to="/" className="mt-3 inline-block btn-primary text-sm">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => {
              const event = reg.event
              if (!event) return null
              const isPast = new Date() > new Date(event.endDate)
              return (
                <div key={reg._id} className="bg-white rounded-xl shadow-sm p-5 flex gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="text-white text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link to={`/events/${event._id}`} className="font-bold text-gray-900 hover:text-blue-600 text-lg">
                          {event.title}
                        </Link>
                        <span className={`badge ml-2 ${statusColors[reg.status] || 'bg-gray-100 text-gray-600'}`}>
                          {reg.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{reg.registrationId}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={13} className="text-blue-500" />
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin size={13} className="text-red-400" />
                        {event.venue?.isOnline ? 'Online' : `${event.venue?.city}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock size={13} className="text-gray-400" />
                        Registered {format(new Date(reg.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {reg.status === 'attended' && reg.checkInTime && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                        <FiCheckCircle size={12} />
                        Checked in at {format(new Date(reg.checkInTime), 'h:mm a, MMM d')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {reg.status === 'confirmed' && !isPast && (
                      <button
                        onClick={() => handleCancel(reg)}
                        onBlur={() => setCancelConfirmId(null)}
                        className={`text-xs py-1.5 px-3 rounded-lg font-semibold transition-colors ${cancelConfirmId === reg._id ? 'bg-red-100 text-red-700 border border-red-300' : 'btn-danger'}`}
                      >
                        {cancelConfirmId === reg._id ? 'Confirm?' : 'Cancel'}
                      </button>
                    )}
                    <Link to={`/events/${event._id}`} className="btn-secondary text-xs py-1.5 px-3 text-center">
                      View
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
