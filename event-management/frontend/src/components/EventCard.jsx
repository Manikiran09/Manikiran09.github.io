import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiDollarSign } from 'react-icons/fi'

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

const statusColors = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

export default function EventCard({ event, showStatus = false }) {
  const isFull = event.registeredCount >= event.capacity
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline)
  const availableSlots = event.capacity - event.registeredCount
  const fillPercent = Math.min((event.registeredCount / event.capacity) * 100, 100)

  return (
    <Link to={`/events/${event._id}`} className="card hover:shadow-lg transition-shadow duration-200 flex flex-col group">
      {/* Banner */}
      <div className="relative h-44 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-white px-4">
            <FiCalendar size={36} className="mx-auto mb-2 opacity-80" />
            <span className="text-sm font-medium opacity-80">{event.category}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`badge ${categoryColors[event.category] || 'bg-gray-100 text-gray-700'}`}>
            {event.category}
          </span>
          {showStatus && (
            <span className={`badge ${statusColors[event.status] || 'bg-gray-100 text-gray-600'}`}>
              {event.status}
            </span>
          )}
        </div>
        {event.isFree ? (
          <span className="absolute top-3 right-3 badge bg-green-500 text-white">FREE</span>
        ) : (
          <span className="absolute top-3 right-3 badge bg-blue-600 text-white flex items-center gap-1">
            <FiDollarSign size={10} />₹{event.fee}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 text-sm text-gray-600 flex-1">
          <div className="flex items-center gap-2">
            <FiCalendar size={14} className="text-blue-500 flex-shrink-0" />
            <span>{format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin size={14} className="text-red-400 flex-shrink-0" />
            <span className="truncate">
              {event.venue?.isOnline ? 'Online' : `${event.venue?.name}, ${event.venue?.city}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers size={14} className="text-green-500 flex-shrink-0" />
            <span>
              {isFull ? (
                <span className="text-red-500 font-medium">Full</span>
              ) : (
                <span>{availableSlots} / {event.capacity} slots left</span>
              )}
            </span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${fillPercent > 80 ? 'bg-red-400' : fillPercent > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {isFull || isDeadlinePassed ? (
            <span className="text-xs text-red-500 font-medium">
              {isFull ? 'Event Full' : 'Registration Closed'}
            </span>
          ) : (
            <span className="text-xs text-green-600 font-medium">
              Registration Open · Deadline: {format(new Date(event.registrationDeadline), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
