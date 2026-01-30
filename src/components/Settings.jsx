import React, { useState, useEffect } from 'react';
import { ConfigService } from '../services/ConfigService';

const COLORS = {
    purple: '#9333ea',
    indigo: '#6366f1',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    rose: '#f43f5e',
    pink: '#ec4899',
};

const APP_VERSION = '1.3.3';
const GITHUB_REPO = 'Jbablestime/jbIRC';

export default function SettingsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('personalization');

    const [themeColor, setThemeColor] = useState('purple');
    const [fontSize, setFontSize] = useState('normal');
    const [showTimestamps, setShowTimestamps] = useState(true);
    const [timestampFormat, setTimestampFormat] = useState('24h');

    const [latestVersion, setLatestVersion] = useState(null);
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    const [favorites, setFavorites] = useState({ servers: [], channels: [] });

     useEffect(() => {
        if (isOpen) {
            const saved = ConfigService.loadSettings();
            setThemeColor(saved.themeColor || 'purple');
            setFontSize(saved.fontSize || 'normal');
            setShowTimestamps(saved.showTimestamps !== undefined ? saved.showTimestamps : true);
            setTimestampFormat(saved.timestampFormat || '24h');
            
            setFavorites(ConfigService.loadFavorites());
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'about') {
            setCheckingUpdate(true);
            setUpdateError(null);
            
            fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch release');
                    return res.json();
                })
                .then(data => {
                    setLatestVersion(data.tag_name);
                })
                .catch(err => {
                    console.error('Update check failed:', err);
                    setUpdateError(true);
                })
                .finally(() => {
                    setCheckingUpdate(false);
                });
        }
    }, [isOpen, activeTab]);

    const handleSave = () => {
        ConfigService.saveSettings({
            themeColor,
            fontSize,
            showTimestamps,
            timestampFormat
        });
        onClose();
    };

    const removeFavoriteServer = (server) => {
        ConfigService.toggleFavoriteServer(server);
        setFavorites(ConfigService.loadFavorites());
    };

    const removeFavoriteChannel = (server, channel) => {
        ConfigService.toggleFavoriteChannel(server, channel);
        setFavorites(ConfigService.loadFavorites());
    };

    if (!isOpen) return null;

    const activeHex = COLORS[themeColor];

    const compareVersions = (v1, v2) => {
        if (!v1 || !v2) return 0;
        const p1 = v1.replace(/^v/, '').split('.').map(Number);
        const p2 = v2.replace(/^v/, '').split('.').map(Number);
        for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
            const num1 = p1[i] || 0;
            const num2 = p2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    };

    const versionDiff = latestVersion ? compareVersions(APP_VERSION, latestVersion) : 0;
    const isDevBuild = versionDiff > 0;
    const isUpdateAvailable = versionDiff < 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
            <div className="w-[800px] h-[500px] bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="h-12 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 text-gray-100 font-bold tracking-widest text-xs uppercase">
                        <div className="w-2 h-2 animate-pulse" style={{ backgroundColor: activeHex }}></div>
                        System Config
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white hover:bg-red-900/30 w-8 h-8 flex items-center justify-center border border-transparent hover:border-red-900 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-48 bg-neutral-900/20 border-r border-neutral-800 p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('personalization')}
                            className={`w-full text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest border-l-2 transition-all ${
                                activeTab === 'personalization' 
                                ? 'bg-white/5 text-gray-200' 
                                : 'border-transparent text-neutral-600 hover:text-neutral-300 hover:bg-neutral-900'
                            }`}
                            style={{ borderColor: activeTab === 'personalization' ? activeHex : 'transparent', color: activeTab === 'personalization' ? activeHex : undefined }}
                        >
                            Personalization
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`w-full text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest border-l-2 transition-all ${
                                activeTab === 'favorites' ? 'bg-white/5 text-gray-200' : 'border-transparent text-neutral-600 hover:text-neutral-300 hover:bg-neutral-900'
                            }`}
                            style={{ borderColor: activeTab === 'favorites' ? activeHex : 'transparent', color: activeTab === 'favorites' ? activeHex : undefined }}
                        >
                            Favorites
                        </button>
                        <button  onClick={() => setActiveTab('about')}
                            className={`w-full text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest border-l-2 transition-all ${
                                activeTab === 'about' 
                                ? 'bg-white/5 text-gray-200' 
                                : 'border-transparent text-neutral-600 hover:text-neutral-300 hover:bg-neutral-900'
                            }`}
                            style={{ borderColor: activeTab === 'about' ? activeHex : 'transparent', color: activeTab === 'about' ? activeHex : undefined }}
                        >
                            About 
                        </button>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto bg-black/20">
                        {activeTab === 'personalization' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-lg text-gray-200 font-bold uppercase tracking-tight mb-1 border-b border-neutral-800 pb-2">Interface Customization</h2>
                                    <p className="text-neutral-600 text-[10px] uppercase tracking-widest mt-2 mb-6">Modify local visual parameters.</p>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Accent Color</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {Object.entries(COLORS).map(([name, hex]) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => setThemeColor(name)}
                                                        className={`w-8 h-8 border transition-all ${
                                                            themeColor === name 
                                                            ? 'shadow-[0_0_10px_rgba(0,0,0,0.5)]' 
                                                            : 'border-neutral-800 bg-neutral-900'
                                                        }`}
                                                        style={{ 
                                                            borderColor: themeColor === name ? hex : undefined,
                                                            backgroundColor: themeColor === name ? `${hex}33` : undefined 
                                                        }}
                                                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                                                    >
                                                        {themeColor === name && (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5" style={{ backgroundColor: hex }}></div>
                                                            </div>
                                                        )}
                                                        {themeColor !== name && <div className="w-full h-full opacity-0 hover:opacity-100" style={{ backgroundColor: `${hex}33` }}></div>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Font Size</label>
                                            <div className="grid grid-cols-3 gap-3 max-w-sm">
                                                {['small', 'normal', 'large'].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setFontSize(size)}
                                                        className={`px-4 py-3 text-[10px] font-bold border transition-all uppercase tracking-widest ${
                                                            fontSize === size
                                                            ? ''
                                                            : 'border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                                                        }`}
                                                        style={fontSize === size ? { borderColor: activeHex, color: activeHex, backgroundColor: `${activeHex}1A` } : {}}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Timestamps</label>
                                            
                                            <div onClick={() => setShowTimestamps(!showTimestamps)} className="flex items-center justify-between p-4 border transition-all cursor-pointer group"
                                                style={showTimestamps ? { borderColor: `${activeHex}80`, backgroundColor: `${activeHex}0D` } : { borderColor: '#262626', backgroundColor: '#171717' }}>
                                                <span className={`text-xs uppercase font-bold tracking-wide ${showTimestamps ? 'text-gray-300' : 'text-neutral-500'}`}>Show Timestamps</span>
                                                <div className="w-10 h-4 relative border transition-colors" style={showTimestamps ? { borderColor: activeHex, backgroundColor: `${activeHex}33` } : { borderColor: '#404040', backgroundColor: '#0a0a0a' }}>
                                                    <div className="absolute top-[-1px] w-4 h-4 transition-all border" style={showTimestamps ? { right: '-1px', backgroundColor: activeHex, borderColor: activeHex } : { left: '-1px', backgroundColor: '#525252', borderColor: '#737373' }}></div>
                                                </div>
                                            </div>

                                            {showTimestamps && (
                                                <div className="grid grid-cols-2 gap-3 mt-2">
                                                    {['12h', '24h'].map(fmt => (
                                                        <button
                                                            key={fmt}
                                                            onClick={() => setTimestampFormat(fmt)}
                                                            className="px-4 py-2 text-[10px] font-bold border transition-all uppercase tracking-widest bg-neutral-900 text-neutral-500 border-neutral-800"
                                                            style={timestampFormat === fmt ? { borderColor: activeHex, color: activeHex, backgroundColor: `${activeHex}1A` } : {}}
                                                        >
                                                            {fmt} Format
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-lg text-gray-200 font-bold uppercase tracking-tight mb-1 border-b border-neutral-800 pb-2">Network Favorites</h2>
                                    
                                    <div className="mt-6 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Saved Servers</label>
                                            <div className="space-y-2">
                                                {favorites.servers.length === 0 && <div className="text-xs text-neutral-600 italic p-2">No favorite servers.</div>}
                                                {favorites.servers.map(server => (
                                                    <div key={server} className="flex justify-between items-center p-3 bg-neutral-900 border border-neutral-800">
                                                        <span className="text-xs text-gray-300 font-bold">{server}</span>
                                                        <button onClick={() => removeFavoriteServer(server)} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Remove</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-neutral-500 uppercase font-bold block tracking-wider">Saved Channels</label>
                                            <div className="space-y-2">
                                                {favorites.channels.length === 0 && <div className="text-xs text-neutral-600 italic p-2">No favorite channels.</div>}
                                                {favorites.channels.map((chan, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-neutral-900 border border-neutral-800">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-300 font-bold">{chan.name}</span>
                                                            <span className="text-[9px] text-neutral-600">{chan.server}</span>
                                                        </div>
                                                        <button onClick={() => removeFavoriteChannel(chan.server, chan.name)} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase">Remove</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-lg text-gray-200 font-bold uppercase tracking-tight mb-1 border-b border-neutral-800 pb-2">About jbIRC</h2>
                                    <p className="text-neutral-600 text-[10px] uppercase tracking-widest mt-2 mb-6">jbIRC is a modern, user friendly, privacy-first IRC client</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between h-24">
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Current Version</div>
                                            <div className="text-2xl font-mono text-white tracking-tighter">v{APP_VERSION}</div>
                                            {isDevBuild ? (
                                                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wide">Dev Build</span>
                                            ) : isUpdateAvailable ? (
                                                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide"></span>
                                            ) : (
                                                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wide"></span>
                                            )}
                                            
                                        </div>

                                        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between h-24 relative overflow-hidden">
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold z-10">Latest Release</div>
                                            
                                            {checkingUpdate ? (
                                                <div className="text-xs text-neutral-400 animate-pulse font-mono z-10">Checking...</div>
                                            ) : updateError ? (
                                                <div className="text-xs text-red-500 font-mono z-10">Check Failed</div>
                                            ) : (
                                                <div className="flex flex-col z-10">
                                                    <div className="text-2xl font-mono text-white tracking-tighter">{latestVersion || 'Unknown'}</div>
                                                    {isUpdateAvailable ? (
                                                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide">Update Available</span>
                                                    ) : (
                                                        <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wide">Up to date</span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {isUpdateAvailable && (
                                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/10 blur-xl rounded-full"></div>
                                            )}
                                            {isDevBuild && (
                                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-500/10 blur-xl rounded-full"></div>
                                            )}
                                        </div>
                                    </div>

                                    {isUpdateAvailable && (
                                        <div className="p-4 bg-neutral-900 border border-green-900/50 rounded-sm relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                            <div className="relative z-10">
                                                <h3 className="text-green-400 font-bold text-sm uppercase tracking-wide mb-1 flex items-center gap-2">
                                                    <span className="animate-pulse">●</span> New Version Available
                                                </h3>
                                                <p className="text-neutral-400 text-xs mb-3 max-w-md">
                                                    A new version of jbIRC has been released. Check the repository for the latest changes and features.
                                                </p>
                                                <a 
                                                    href={`https://github.com/${GITHUB_REPO}/releases/latest`}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors"
                                                >
                                                    View Release
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                        <polyline points="15 3 21 3 21 9"></polyline>
                                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {isDevBuild && (
                                        <div className="p-4 bg-neutral-900 border border-purple-900/50 rounded-sm relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                            <div className="relative z-10">
                                                <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wide mb-1 flex items-center gap-2">
                                                    <span className="animate-pulse">●</span> Developer Build
                                                </h3>
                                                <p className="text-neutral-400 text-xs mb-3 max-w-md">
                                                    You are running a version ahead of the latest release. This is likely a development environment or a nightly build.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {!isUpdateAvailable && !isDevBuild && !checkingUpdate && latestVersion && (
                                        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-sm">
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                </svg>
                                                <span className="text-xs">You are running the latest version of jbIRC.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 border border-transparent hover:border-red-900 bg-transparent text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-red-500 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-8 py-3 bg-neutral-900 border border-neutral-700 text-gray-300 text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:text-white"
                        style={{ borderColor: 'transparent', boxShadow: `0 0 0 1px ${activeHex}40` }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = activeHex; e.currentTarget.style.color = activeHex; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                    >
                        [ Save Config ]
                    </button>
                </div>
            </div>
        </div>
    );
}