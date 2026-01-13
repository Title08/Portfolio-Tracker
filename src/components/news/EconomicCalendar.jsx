import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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

    useEffect(() => {
        const fetchCalendar = async () => {
            setLoading(true);
            const data = await getEconomicCalendar();
            setEvents(data);
            setLoading(false);
        };
        fetchCalendar();
    }, []);

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
        const dayEvents = events.filter(e => e.date === dateStr);
        calendarDays.push({ day, dateStr, events: dayEvents });
    }

    const getImpactColor = (impact) => {
        return impact === 'high' ? 'bg-red-500' : 'bg-yellow-500';
    };

    const isToday = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr === today;
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg shadow-amber-500/20">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Economic Calendar</h3>
                        <p className="text-[10px] text-slate-400">Upcoming market events</p>
                    </div>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
                <button
                    onClick={goToPrevMonth}
                    className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{monthName}</span>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 transition-colors border border-indigo-500/30"
                    >
                        Today
                    </button>
                </div>
                <button
                    onClick={goToNextMonth}
                    className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Week days header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map(day => (
                                <div key={day} className="text-center text-[10px] font-semibold text-slate-500 py-1">
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
                                        ${cell.day ? 'hover:bg-slate-700/50 cursor-pointer' : ''}
                                        ${isToday(cell.dateStr) ? 'bg-indigo-500/20 ring-1 ring-indigo-500/50' : ''}
                                        ${cell.events.length > 0 ? 'bg-slate-700/30' : ''}
                                    `}
                                    onClick={() => cell.events.length > 0 && setSelectedEvent(cell)}
                                >
                                    {cell.day && (
                                        <>
                                            <span className={`text-xs ${isToday(cell.dateStr) ? 'text-indigo-300 font-bold' : 'text-slate-400'}`}>
                                                {cell.day}
                                            </span>
                                            {/* Event indicators */}
                                            {cell.events.length > 0 && (
                                                <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                                                    {cell.events.slice(0, 3).map((event, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-1.5 h-1.5 rounded-full ${getImpactColor(event.impact)}`}
                                                            title={event.title}
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
                <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">
                            {new Date(selectedEvent.dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-300"
                        >
                            Close
                        </button>
                    </div>
                    <div className="space-y-2">
                        {selectedEvent.events.map((event, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-slate-800/60 rounded-lg p-2">
                                <span className="text-sm">{event.impact === 'high' ? '🔴' : '🟡'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate">{event.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="p-3 border-t border-slate-700/50 bg-slate-900/30">
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> High Impact
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EconomicCalendar;
