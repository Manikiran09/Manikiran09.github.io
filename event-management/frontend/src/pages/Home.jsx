import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import EventCard from '../components/EventCard'
import Spinner from '../components/Spinner'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'

const CATEGORIES = ['Conference', 'Workshop', 'Seminar', 'Hackathon', 'Cultural', 'Sports', 'Networking', 'Webinar', 'Exhibition', 'Other']

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const isFree = searchParams.get('isFree') || ''
  const city = searchParams.get('city') || ''

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search) params.search = search
      if (category) params.category = category
      if (isFree) params.isFree = isFree
      if (city) params.city = city

      const { data } = await api.get('/events', { params })
      setEvents(data.events)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, search, category, isFree, city])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const clearFilters = () => setSearchParams({})

  const hasFilters = search || category || isFree || city

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Discover & Join Amazing Events</h1>
          <p className="text-blue-100 text-lg mb-8">Find conferences, workshops, hackathons, and more near you</p>
          {/* Search Bar */}
          <div className="flex bg-white rounded-xl overflow-hidden shadow-lg max-w-2xl mx-auto">
            <FiSearch className="text-gray-400 ml-4 my-auto" size={20} />
            <input
              type="text"
              placeholder="Search events by name, topic..."
              defaultValue={search}
              onKeyDown={(e) => e.key === 'Enter' && setParam('search', e.target.value)}
              onBlur={(e) => setParam('search', e.target.value)}
              className="flex-1 px-3 py-3 text-gray-800 focus:outline-none"
            />
            {search && (
              <button onClick={() => setParam('search', '')} className="text-gray-400 hover:text-gray-600 px-3">
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-600 text-sm font-medium">{total} events found</span>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700">
                <FiX size={14} /> Clear filters
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-secondary text-sm py-1.5"
          >
            <FiFilter size={14} /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setParam('category', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Price</label>
              <select
                value={isFree}
                onChange={(e) => setParam('isFree', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">All</option>
                <option value="true">Free</option>
                <option value="false">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
              <input
                type="text"
                placeholder="e.g. Hyderabad"
                defaultValue={city}
                onBlur={(e) => setParam('city', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setParam('city', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>
        )}

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => setParam('category', '')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setParam('category', c === category ? '' : c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <Spinner size="lg" className="py-20" />
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No events found.</p>
            {hasFilters && <button onClick={clearFilters} className="mt-3 text-blue-600 hover:underline">Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => { const sp = new URLSearchParams(searchParams); sp.set('page', p); setSearchParams(sp) }}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
