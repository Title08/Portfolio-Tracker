import { X, Globe, Settings as SettingsIcon, Check, Cpu, ChevronDown } from 'lucide-react';

// Verified Groq API Chat Models (January 2026)
const AI_MODELS = [
    // Qwen
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', category: 'Qwen' },

    // Meta Llama 4 (NEW)
    { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', category: 'Meta Llama 4' },
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', category: 'Meta Llama 4' },

    // Meta Llama 3
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', category: 'Meta Llama 3' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', category: 'Meta Llama 3' },

    // OpenAI OSS
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', category: 'OpenAI OSS' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', category: 'OpenAI OSS' },

    // Moonshot
    { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct', category: 'Moonshot' },

    // Groq Compound
    { id: 'groq/compound', name: 'Groq Compound', category: 'Groq' },
    { id: 'groq/compound-mini', name: 'Groq Compound Mini', category: 'Groq' },

    // Other
    { id: 'allam-2-7b', name: 'Allam 2 7B', category: 'Other' },
];

const SettingsModal = ({ isOpen, onClose, aiLanguage, setAiLanguage, aiModel, setAiModel }) => {
    if (!isOpen) return null;

    // Group models by category
    const groupedModels = AI_MODELS.reduce((acc, model) => {
        if (!acc[model.category]) acc[model.category] = [];
        acc[model.category].push(model);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-slate-200 dark:border-white/10 w-full max-w-md shadow-2xl transition-colors">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-slate-600 dark:text-gray-300" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 bg-white dark:bg-transparent">

                    {/* AI Model Dropdown */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200">AI Model</h3>
                        </div>

                        <div className="relative">
                            <select
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}
                                className="w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm dark:shadow-none"
                            >
                                {Object.entries(groupedModels).map(([category, models]) => (
                                    <optgroup key={category} label={category} className="bg-white dark:bg-slate-800 text-slate-500 dark:text-gray-400 font-bold">
                                        {models.map((model) => (
                                            <option key={model.id} value={model.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 font-normal">
                                                {model.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400 pointer-events-none" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-gray-500">
                            Different models have varying speed and quality tradeoffs.
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200">AI Language</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAiLanguage('en')}
                                className={`relative p-3 rounded-lg border text-left transition-all flex items-center justify-between ${aiLanguage === 'en'
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500 dark:text-white shadow-sm'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-sm font-medium">English 🇺🇸</span>
                                {aiLanguage === 'en' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                            </button>

                            <button
                                onClick={() => setAiLanguage('th')}
                                className={`relative p-3 rounded-lg border text-left transition-all flex items-center justify-between ${aiLanguage === 'th'
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500 dark:text-white shadow-sm'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-sm font-medium">Thai 🇹🇭</span>
                                {aiLanguage === 'th' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/30 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
