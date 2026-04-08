import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiUsers, FiCalendar, FiBarChart2,
  FiCheckSquare, FiEye, FiAlertCircle
} from 'react-icons/fi'

const statusColors = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')
  const [participants, setParticipants] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          api.get('/events/my-events'),
          api.get('/events/stats'),
        ])
        setEvents(eventsRes.data.events)
        setStats(statsRes.data.stats)
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (eventId) => {
    if (deleteConfirmId !== eventId) {
      setDeleteConfirmId(eventId)
      return
    }
    try {
      await api.delete(`/events/${eventId}`)
      setEvents((prev) => prev.filter((e) => e._id !== eventId))
      toast.success('Event deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleViewParticipants = async (event) => {
    setSelectedEvent(event)
    setActiveTab('participants')
    setLoadingParticipants(true)
    try {
      const { data } = await api.get(`/events/${event._id}/participants`, { params: { limit: 100 } })
      setParticipants(data.registrations)
    } catch {
      toast.error('Failed to load participants')
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleCheckIn = async (eventId, registrationId, regId) => {
    try {
      await api.put(`/events/${eventId}/checkin/${registrationId}`)
      setParticipants((prev) =>
        prev.map((r) => r._id === regId ? { ...r, status: 'attended', checkInTime: new Date().toISOString() } : r)
      )
      toast.success('Participant checked in!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Admin' : 'Organizer'} Dashboard
            </h1>
            <p className="text-gray-500">Manage your events and registrations</p>
          </div>
          <Link to="/admin/events/new" className="btn-primary flex items-center gap-2">
            <FiPlus /> Create Event
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Events', value: stats.totalEvents, icon: FiCalendar, color: 'text-blue-600 bg-blue-50' },
              { label: 'Published', value: stats.publishedEvents, icon: FiCheckSquare, color: 'text-green-600 bg-green-50' },
              { label: 'Upcoming', value: stats.upcomingEvents, icon: FiBarChart2, color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Registrations', value: stats.totalRegistrations, icon: FiUsers, color: 'text-purple-600 bg-purple-50' },
              { label: 'Confirmed', value: stats.confirmedRegistrations, icon: FiCheckSquare, color: 'text-teal-600 bg-teal-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
                <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-2`}>
                  <s.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {['events', 'participants'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Registrations</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <FiCalendar size={40} className="mx-auto mb-2" />
                      No events yet. <Link to="/admin/events/new" className="text-blue-600 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.category} · {event.isFree ? 'Free' : `₹${event.fee}`}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{event.registeredCount}/{event.capacity}</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-400"
                            style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[event.status] || 'bg-gray-100 text-gray-600'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewParticipants(event)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Participants"
                        >
                          <FiUsers size={15} />
                        </button>
                        <Link
                          to={`/events/${event._id}`}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="View"
                        >
                          <FiEye size={15} />
                        </Link>
                        <Link
                          to={`/admin/events/${event._id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className={`p-1.5 rounded-lg text-sm transition-colors ${deleteConfirmId === event._id ? 'bg-red-100 text-red-700 font-medium px-2' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                          title={deleteConfirmId === event._id ? 'Click again to confirm' : 'Delete'}
                          onBlur={() => setDeleteConfirmId(null)}
                        >
                          {deleteConfirmId === event._id ? '⚠️ Confirm' : <FiTrash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div>
            {selectedEvent ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setActiveTab('events')} className="text-gray-400 hover:text-gray-600">←</button>
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedEvent.title}</h2>
                    <p className="text-sm text-gray-500">{participants.length} participants</p>
                  </div>
                </div>
                {loadingParticipants ? (
                  <Spinner size="lg" className="py-12" />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Participant</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Organization</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reg ID</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {participants.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-400">No participants yet</td>
                          </tr>
                        ) : participants.map((reg) => (
                          <tr key={reg._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{reg.participant?.name}</p>
                              <p className="text-xs text-gray-500">{reg.participant?.email}</p>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">
                              {reg.participant?.organization || '—'}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-600">{reg.registrationId}</td>
                            <td className="px-4 py-3">
                              <span className={`badge ${statusColors[reg.status] || 'bg-gray-100 text-gray-600'}`}>
                                {reg.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {reg.status === 'confirmed' && (
                                <button
                                  onClick={() => handleCheckIn(selectedEvent._id, reg.registrationId, reg._id)}
                                  className="text-xs btn-primary py-1 px-2"
                                >
                                  Check In
                                </button>
                              )}
                              {reg.status === 'attended' && (
                                <span className="text-xs text-green-600 font-medium">✓ Attended</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FiUsers size={40} className="mx-auto mb-2" />
                <p>Select an event from the Events tab to view participants</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
