import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, Clock, Filter } from 'lucide-react';
import { getEconomicCalendar } from '../../services/api';

/**
 * Economic Calendar Widget - Calendar Grid View
 * Displays upcoming economic events in a monthly calendar format
 */
const EconomicCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Filters
    const [filterImpact, setFilterImpact] = useState('all'); // all, high, medium, low
    const [filterCurrency, setFilterCurrency] = useState('all'); // all, USD, EUR, etc.

    useEffect(() => {
        const fetchCalendar = async () => {
            setLoading(true);
            const data = await getEconomicCalendar();
            setEvents(data);
            setLoading(false);
        };
        fetchCalendar();
    }, []);

    // Filter events
    const filteredEvents = events.filter(event => {
        if (filterImpact !== 'all' && event.impact !== filterImpact) return false;
        if (filterCurrency !== 'all' && event.currency !== filterCurrency) return false;
        return true;
    });

    // Calendar navigation
    const goToPrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Get calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Create calendar days array
    const calendarDays = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push({ day: null, events: [] });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Use filteredEvents here so the dots match the filter
        const dayEvents = filteredEvents.filter(e => e.date === dateStr);
        calendarDays.push({ day, dateStr, events: dayEvents });
    }

    const getImpactColor = (impact) => {
        if (impact === 'high') return 'bg-red-500';
        if (impact === 'medium') return 'bg-orange-500';
        return 'bg-yellow-500'; // Low
    };

    const isToday = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr === today;
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

    return (
        <div className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-lg dark:shadow-none">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/20">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">Economic Calendar</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Upcoming market events</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700/30 flex gap-2 overflow-x-auto no-scrollbar items-center bg-slate-50 dark:bg-transparent">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-2">
                    <Filter className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-bold">Filters</span>
                </div>

                {/* Impact Filter */}
                <select
                    value={filterImpact}
                    onChange={(e) => setFilterImpact(e.target.value)}
                    className="bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-[10px] rounded px-2 py-1 border border-slate-300 dark:border-slate-600 outline-none focus:border-indigo-500"
                >
                    <option value="all">All Impact</option>
                    <option value="high">High Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="low">Low Impact</option>
                </select>

                {/* Currency Filter */}
                <select
                    value={filterCurrency}
                    onChange={(e) => setFilterCurrency(e.target.value)}
                    className="bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-[10px] rounded px-2 py-1 border border-slate-300 dark:border-slate-600 outline-none focus:border-indigo-500"
                >
                    <option value="all">All Currencies</option>
                    {currencies.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700/30 bg-slate-100 dark:bg-slate-800/20">
                <button
                    onClick={goToPrevMonth}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{monthName}</span>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-2 py-0.5 text-[10px] font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors border border-indigo-300 dark:border-indigo-500/30"
                    >
                        Today
                    </button>
                </div>
                <button
                    onClick={goToNextMonth}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-3 bg-white dark:bg-transparent">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Week days header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map(day => (
                                <div key={day} className="text-center text-[10px] font-semibold text-slate-600 dark:text-slate-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((cell, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        relative min-h-[42px] rounded-lg p-1 text-center transition-colors
                                        ${cell.day ? 'hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer' : ''}
                                        ${cell.day && isToday(cell.dateStr) ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-1 ring-indigo-400 dark:ring-indigo-500/50' : ''}
                                        ${cell.events.length > 0 ? 'bg-slate-100 dark:bg-slate-700/30' : ''}
                                    `}
                                    onClick={() => cell.events.length > 0 && setSelectedEvent(cell)}
                                >
                                    {cell.day && (
                                        <>
                                            <span className={`text-xs ${isToday(cell.dateStr) ? 'text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {cell.day}
                                            </span>
                                            {/* Event indicators */}
                                            {cell.events.length > 0 && (
                                                <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                                                    {cell.events.slice(0, 3).map((event, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-1.5 h-1.5 rounded-full ${getImpactColor(event.impact)}`}
                                                            title={`${event.title} (${event.currency})`}
                                                        />
                                                    ))}
                                                    {cell.events.length > 3 && (
                                                        <span className="text-[8px] text-slate-500">+{cell.events.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Selected Day Events */}
            {selectedEvent && selectedEvent.events.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">
                            {new Date(selectedEvent.dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            Close
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {selectedEvent.events.map((event, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800/60 rounded-lg p-2 border border-slate-200 dark:border-transparent shadow-sm dark:shadow-none">
                                {/* Impact Badge */}
                                <div className={`flex flex-col items-center justify-center min-w-[36px] gap-0.5 rounded px-1 py-1 ${event.impact === 'high' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : event.impact === 'medium' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>
                                    <span className="text-[9px] font-bold uppercase">{event.impact === 'high' ? 'High' : event.impact === 'medium' ? 'Med' : 'Low'}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {/* Time & Currency */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-900/50 px-1 rounded">
                                                <Clock className="w-2.5 h-2.5" />
                                                {event.time || '--:--'}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1 rounded ${event.currency === 'USD' ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10' : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10'}`}>
                                                {event.currency || 'USD'}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate text-wrap leading-tight">{event.title}</p>

                                    {event.description && (
                                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                            {event.description.split('|').map((part, i) => (
                                                <span key={i} className="bg-slate-100 dark:bg-slate-700/50 px-1 rounded">{part.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30">
                <div className="flex items-center justify-center gap-3 text-[9px] text-slate-600 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> High
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Med
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Low
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EconomicCalendar;
