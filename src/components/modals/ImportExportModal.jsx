import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Upload, AlertTriangle, Check, FileJson } from 'lucide-react';

export default function ImportExportModal({ isOpen, onClose, assets, onImport }) {
    const [mode, setMode] = useState('EXPORT'); // EXPORT | IMPORT
    const [jsonContent, setJsonContent] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen) {
            setMode('EXPORT');
            setJsonContent(JSON.stringify(assets, null, 2));
            setMessage({ type: '', text: '' });
        }
    }, [isOpen, assets]);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonContent);
        setMessage({ type: 'success', text: 'Copied to clipboard!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'File downloaded!' });
    };

    const handleImportSubmit = () => {
        if (!jsonContent.trim()) {
            setMessage({ type: 'error', text: 'Please paste JSON data first.' });
            return;
        }

        const result = onImport(jsonContent);
        if (result.success) {
            setMessage({ type: 'success', text: 'Data imported successfully!' });
            setTimeout(() => {
                onClose();
            }, 1000);
        } else {
            setMessage({ type: 'error', text: result.message || 'Import failed' });
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setJsonContent(event.target.result);
            setMessage({ type: 'success', text: 'File loaded. Click Import to finish.' });
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileJson className="text-indigo-400" />
                        Sync Data
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => { setMode('EXPORT'); setJsonContent(JSON.stringify(assets, null, 2)); setMessage({ type: '', text: '' }); }}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'EXPORT' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-700/30' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        Export / Backup
                    </button>
                    <button
                        onClick={() => { setMode('IMPORT'); setJsonContent(''); setMessage({ type: '', text: '' }); }}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'IMPORT' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-700/30' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        Import / Restore
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-auto">

                    {message.text && (
                        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                            {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs text-slate-400 uppercase font-semibold">
                                {mode === 'EXPORT' ? 'Your Data (JSON)' : 'Paste JSON Here'}
                            </label>
                            {mode === 'IMPORT' && (
                                <label className="cursor-pointer text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
                                    <Upload size={12} /> Load File
                                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                        <textarea
                            value={jsonContent}
                            onChange={(e) => { setMode('IMPORT'); setJsonContent(e.target.value); }}
                            readOnly={mode === 'EXPORT'}
                            className={`w-full h-64 bg-slate-900 border rounded-lg p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 ${mode === 'EXPORT' ? 'text-slate-400 border-slate-700' : 'text-slate-200 border-slate-600 focus:ring-emerald-500'}`}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-4 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">
                        Cancel
                    </button>

                    {mode === 'EXPORT' ? (
                        <>
                            <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all">
                                <Copy size={16} /> Copy
                            </button>
                            <button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
                                <Download size={16} /> Download
                            </button>
                        </>
                    ) : (
                        <button onClick={handleImportSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-emerald-500/20">
                            <Upload size={16} /> Import Data
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
