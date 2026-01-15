import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { getEconomicCalendar } from '../../services/api';

export default function MiniEconomicCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch from your existing API service
                // Assuming getEconomicCalendar() calls your backend endpoint
                // If not available in services/api.js, we might need to add it or fetch directly
                const response = await fetch('http://localhost:8000/economic-calendar');
                const data = await response.json();

                if (Array.isArray(data)) {
                    // Filter for Today and Tomorrow
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const todayStr = today.toISOString().split('T')[0];
                    const tomorrowStr = tomorrow.toISOString().split('T')[0];

                    const upcoming = data.filter(e => e.date === todayStr || e.date === tomorrowStr);
                    setEvents(upcoming.slice(0, 5)); // Show max 5 events
                }
            } catch (error) {
                console.error("Failed to load calendar", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const getImpactColor = (impact) => {
        switch (impact?.toLowerCase()) {
            case 'high': return 'text-red-400 bg-red-400/10';
            case 'medium': return 'text-orange-400 bg-orange-400/10';
            case 'low': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    if (loading) return <div className="animate-pulse h-32 bg-slate-800 rounded-2xl"></div>;

    if (events.length === 0) return null; // Don't show if empty

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Upcoming Events</h3>
                </div>
                <span className="text-xs text-slate-500">Today & Tomorrow</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {events.map((event, idx) => (
                    <div key={idx} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`w-1 h-8 rounded-full ${event.impact === 'high' ? 'bg-red-500' : event.impact === 'medium' ? 'bg-orange-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{event.title}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getImpactColor(event.impact)}`}>
                                        {event.currency}
                                    </span>
                                    <span>{event.country}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 justify-end">
                                <Clock size={12} className="text-slate-400 dark:text-slate-500" />
                                {event.time}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{event.dateDisplay}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
