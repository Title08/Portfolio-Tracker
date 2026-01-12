import { X, Globe, Settings as SettingsIcon, Check, Cpu, ChevronDown } from 'lucide-react';

// Complete list of Groq API models
const AI_MODELS = [
    // Qwen Models
    { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', category: 'Qwen' },

    // Llama Models
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', category: 'Meta Llama' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', category: 'Meta Llama' },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B', category: 'Meta Llama' },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B', category: 'Meta Llama' },

    // OpenAI OSS Models
    { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', category: 'OpenAI OSS' },
    { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', category: 'OpenAI OSS' },

    // Mixtral Models
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', category: 'Mistral' },

    // Gemma Models
    { id: 'gemma-7b-it', name: 'Gemma 7B IT', category: 'Google' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', category: 'Google' },

    // DeepSeek Models
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', category: 'DeepSeek' },

    // Moonshot Models
    { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2 Instruct', category: 'Moonshot' },

    // Compound/Agents
    { id: 'groq/compound', name: 'Groq Compound (Multi-tool)', category: 'Groq' },
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e1e] rounded-xl border border-white/10 w-full max-w-md shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-gray-300" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* AI Model Dropdown */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-4 h-4 text-purple-400" />
                            <h3 className="text-sm font-semibold text-gray-200">AI Model</h3>
                        </div>

                        <div className="relative">
                            <select
                                value={aiModel}
                                onChange={(e) => setAiModel(e.target.value)}
                                className="w-full p-3 pr-10 rounded-lg border border-white/10 bg-slate-800/80 text-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            >
                                {Object.entries(groupedModels).map(([category, models]) => (
                                    <optgroup key={category} label={category} className="bg-slate-800 text-gray-400">
                                        {models.map((model) => (
                                            <option key={model.id} value={model.id} className="bg-slate-800 text-white py-2">
                                                {model.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Different models have varying speed and quality tradeoffs.
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-sm font-semibold text-gray-200">AI Language</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAiLanguage('en')}
                                className={`relative p-3 rounded-lg border text-left transition-all flex items-center justify-between ${aiLanguage === 'en'
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-sm font-medium">English 🇺🇸</span>
                                {aiLanguage === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
                            </button>

                            <button
                                onClick={() => setAiLanguage('th')}
                                className={`relative p-3 rounded-lg border text-left transition-all flex items-center justify-between ${aiLanguage === 'th'
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-sm font-medium">Thai 🇹🇭</span>
                                {aiLanguage === 'th' && <Check className="w-4 h-4 text-indigo-400" />}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-slate-800/30 rounded-b-xl flex justify-end">
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
