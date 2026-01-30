import React, { useState, useEffect } from 'react';
import { ConfigService } from '../services/ConfigService';

const THEME_VARS = {
    purple: { text: 'text-purple-500', bg: 'bg-purple-600', border: 'border-purple-500', hex: '#9333ea', ring: 'focus:ring-purple-500' },
    indigo: { text: 'text-indigo-500', bg: 'bg-indigo-600', border: 'border-indigo-500', hex: '#6366f1', ring: 'focus:ring-indigo-500' },
    blue: { text: 'text-blue-500', bg: 'bg-blue-600', border: 'border-blue-500', hex: '#3b82f6', ring: 'focus:ring-blue-500' },
    cyan: { text: 'text-cyan-500', bg: 'bg-cyan-600', border: 'border-cyan-500', hex: '#06b6d4', ring: 'focus:ring-cyan-500' },
    teal: { text: 'text-teal-500', bg: 'bg-teal-600', border: 'border-teal-500', hex: '#14b8a6', ring: 'focus:ring-teal-500' },
    green: { text: 'text-green-500', bg: 'bg-green-600', border: 'border-green-500', hex: '#22c55e', ring: 'focus:ring-green-500' },
    yellow: { text: 'text-yellow-500', bg: 'bg-yellow-600', border: 'border-yellow-500', hex: '#eab308', ring: 'focus:ring-yellow-500' },
    orange: { text: 'text-orange-500', bg: 'bg-orange-600', border: 'border-orange-500', hex: '#f97316', ring: 'focus:ring-orange-500' },
    rose: { text: 'text-rose-500', bg: 'bg-rose-600', border: 'border-rose-500', hex: '#f43f5e', ring: 'focus:ring-rose-500' },
    pink: { text: 'text-pink-500', bg: 'bg-pink-600', border: 'border-pink-500', hex: '#ec4899', ring: 'focus:ring-pink-500' },
};

export default function Intro({ onConnect }) {
    const [proxyDropdownOpen, setProxyDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        nick: '',
        server: 'thepiratesplunder.org',
        port: 6697,
        channels: '#TPP',
        tls: true,
        client: "jbIRC",
        saslPassword: '',
        saslAccount: ''
    });

    const [proxyConfig, setProxyConfig] = useState({
        enabled: false,
        type: 'SOCKS5',
        host: '127.0.0.1',
        port: 9050,
    });

    const [saslEnabled, setSaslEnabled] = useState(false);
    const [status, setStatus] = useState('READY TO INITIALIZE...');

    const [themeColor, setThemeColor] = useState('purple');

        useEffect(() => {
        const savedConn = ConfigService.loadConnection();
        if (savedConn) {
            setFormData(prev => ({
                ...prev,
                nick: savedConn.nick || '',
                server: savedConn.server || 'thepiratesplunder.org',
                port: savedConn.port || 6697,
                channels: Array.isArray(savedConn.channels) ? savedConn.channels.join(', ') : (savedConn.channels || '#TPP'),
                tls: savedConn.tls !== undefined ? savedConn.tls : true,
                saslAccount: savedConn.saslAccount || '',
                saslPassword: savedConn.saslPassword || ''
            }));

            if (savedConn.proxy) setProxyConfig(savedConn.proxy);
            if (savedConn.saslEnabled) setSaslEnabled(true);
            
            setStatus('CONFIGURATION LOADED.');
        } else {
            setStatus('READY TO INITIALIZE...');
        }

        const loadTheme = () => {
            const savedSettings = ConfigService.loadSettings();
            if (savedSettings && savedSettings.themeColor) {
                setThemeColor(savedSettings.themeColor);
            }
        };
        
        loadTheme();
        window.addEventListener('jbirc-settings-changed', loadTheme);
        
        return () => window.removeEventListener('jbirc-settings-changed', loadTheme);
    }, []);

    const themeStyles = THEME_VARS[themeColor] || THEME_VARS.purple;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            
            if (name === 'nick') {
                newData.saslAccount = value;
            } else if (name === 'saslAccount') {
                newData.nick = value;
            }
            
            return newData;
        });
        
        setStatus(`INPUT_UPDATE: ${name.toUpperCase()}`);
    };

    const handleProxyChange = (e) => {
        const { name, value } = e.target;
        setProxyConfig(prev => ({ ...prev, [name]: value }));
        setStatus(`PROXY_CONFIG: ${name.toUpperCase()}`);
    };

    const toggleTor = () => {
        const newState = !proxyConfig.enabled;
        setProxyConfig(prev => ({
            ...prev,
            enabled: newState,
        }));
        setStatus(newState ? 'MODULE_LOADED: TOR_SOCKS5' : 'MODULE_UNLOADED: PROXY');
    };

    const toggleSasl = () => {
        const newState = !saslEnabled;
        setSaslEnabled(newState);
        
        if (newState) {
            setFormData(prev => ({ ...prev, saslAccount: prev.nick }));
        }
        
        setStatus(newState ? 'MODULE_LOADED: SASL_AUTH' : 'MODULE_UNLOADED: AUTH');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nick || !formData.server) {
            setStatus('ERROR: MISSING_REQUIRED_FIELDS');
            return;
        }
        
        setStatus(proxyConfig.enabled ? 'ESTABLISHING_SECURE_TUNNEL...' : 'INITIATING_HANDSHAKE...');
        const channelArray = formData.channels.split(',').map(c => c.trim()).filter(Boolean);
        
        const connectData = { 
            ...formData, 
            channels: channelArray,
            proxy: proxyConfig,
            saslEnabled: saslEnabled 
        };

        ConfigService.saveConnection(connectData);
        onConnect(connectData);
    };

    return (
        <div className="h-full bg-black text-gray-400 font-mono overflow-y-auto relative">
            
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="w-full max-w-lg border border-neutral-800 bg-neutral-950 shadow-2xl relative z-10">
                    
                    <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex justify-between items-center text-xs tracking-widest">
                        <span>jbIRC</span>
                        <div className="flex gap-2">
                            <div className={`w-2 h-2 rounded-full border ${proxyConfig.enabled ? 'bg-orange-500 border-orange-500' : 'bg-red-500/20 border-red-500'} transition-colors duration-500`}></div>
                            <div className={`w-2 h-2 rounded-full border ${saslEnabled ? 'bg-cyan-500 border-cyan-500' : 'bg-yellow-500/20 border-yellow-500'} transition-colors duration-500`}></div>
                            <div className="w-2 h-2 rounded-full bg-green-500 border border-green-500 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl text-gray-100 font-bold tracking-tight mb-2">
                                SYSTEM ACCESS
                            </h1>
                            <div className="text-xs text-neutral-600">
                                SECURE CONNECTION PROTOCOL // IRC-V3
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className={`text-xs font-bold uppercase transition-colors duration-300 ${saslEnabled ? 'text-cyan-500' : 'text-neutral-500'}`}>
                                    Nickname {saslEnabled && '(SASL)'}
                                </label>
                                <div className="relative group">
                                    <span className={`absolute left-3 top-2.5 transition-colors duration-300 ${saslEnabled ? 'text-cyan-600' : 'text-neutral-600'}`}>@</span>
                                    <input 
                                        name="nick"
                                        value={formData.nick}
                                        onChange={handleChange}
                                        placeholder="Enter alias..."
                                        className={`w-full bg-neutral-900 border pl-8 pr-4 py-2 focus:outline-none transition-all placeholder-neutral-700 focus:ring-1 ${
                                            saslEnabled 
                                            ? 'border-cyan-500 text-cyan-50 shadow-[0_0_8px_rgba(6,182,212,0.15)] focus:ring-cyan-500 focus:border-cyan-500' 
                                            : `border-neutral-800 text-gray-200 ${themeStyles.focus}`
                                        }`}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Target Host</label>
                                    <input 
                                        name="server"
                                        value={formData.server}
                                        onChange={handleChange}
                                        className={`w-full bg-neutral-900 border border-neutral-800 text-gray-200 px-4 py-2 focus:outline-none focus:ring-1 transition-all ${themeStyles.focus}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase">Port</label>
                                    <input 
                                        name="port"
                                        type="number"
                                        value={formData.port}
                                        onChange={handleChange}
                                        className={`w-full bg-neutral-900 border border-neutral-800 text-gray-200 px-4 py-2 text-center focus:outline-none focus:ring-1 transition-all ${themeStyles.focus}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Channels</label>
                                <input 
                                    name="channels"
                                    value={formData.channels}
                                    onChange={handleChange}
                                    placeholder="#channel1, #channel2"
                                    className={`w-full bg-neutral-900 border border-neutral-800 text-gray-200 px-4 py-2 focus:outline-none focus:ring-1 transition-all placeholder-neutral-700 ${themeStyles.focus}`}
                                />
                            </div>

                            <div className={`border border-dashed border-neutral-800 p-4 relative mt-6 transition-all duration-300 ${saslEnabled ? 'bg-cyan-950/10 border-cyan-900/50' : ''}`}>
                                <div className="absolute -top-2 left-3 bg-neutral-950 px-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                    Authentication
                                    {saslEnabled && <span className="text-cyan-500 animate-pulse">● SASL READY</span>}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs transition-colors duration-300 ${saslEnabled ? 'text-cyan-400' : 'text-neutral-400'}`}>
                                        Authenticate via SASL?
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={toggleSasl}
                                        className={`cursor-pointer text-[10px] px-2 py-1 border transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                                            saslEnabled 
                                            ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.2)]' 
                                            : 'border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:border-neutral-500'
                                        }`}
                                    >
                                        {saslEnabled ? '[ DISABLE_AUTH ]' : '[ ENABLE_SASL ]'}
                                    </button>
                                </div>

                                <div className={`grid transition-all duration-300 ease-in-out ${saslEnabled ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                    <div className="overflow-hidden min-h-0">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-cyan-600 font-bold uppercase flex items-center gap-2">
                                                    Account Name 
                                                </label>
                                                <input 
                                                    name="saslAccount" 
                                                    value={formData.saslAccount} 
                                                    onChange={handleChange} 
                                                    placeholder="Mirrors nickname..."
                                                    className="w-full bg-neutral-900 border border-cyan-500/50 text-cyan-100 text-xs py-2 px-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 placeholder-cyan-900/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-neutral-600 uppercase">Password</label>
                                                <input 
                                                    name="saslPassword" 
                                                    type="password"
                                                    value={formData.saslPassword} 
                                                    onChange={handleChange} 
                                                    className="w-full bg-neutral-900 border border-neutral-800 text-gray-300 text-xs py-2 px-2 focus:outline-none focus:border-cyan-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`border border-dashed border-neutral-800 p-4 relative mt-6 transition-all duration-300 ${proxyConfig.enabled ? 'bg-orange-950/10 border-orange-900/50' : ''}`}>
                                <div className="absolute -top-2 left-3 bg-neutral-950 px-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                    Network Routing
                                    {proxyConfig.enabled && <span className="text-orange-500 animate-pulse">● ACTIVE</span>}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs transition-colors duration-300 ${proxyConfig.enabled ? 'text-orange-400' : 'text-neutral-400'}`}>
                                        Route traffic via Proxy/Tor?
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={toggleTor}
                                        className={`cursor-pointer text-[10px] px-2 py-1 border transition-all duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                                            proxyConfig.enabled 
                                            ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_8px_rgba(249,115,22,0.2)]' 
                                            : 'border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:border-neutral-500'
                                        }`}
                                    >
                                        {proxyConfig.enabled ? '[ DISABLE_PROXY ]' : '[ LOAD_TOR_PRESET ]'}
                                    </button>
                                </div>

                                <div className={`grid transition-all duration-300 ease-in-out ${proxyConfig.enabled ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                    <div className="overflow-hidden min-h-0">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1 relative">
                                                <label className="text-[10px] text-neutral-600 uppercase">Type</label>
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => setProxyDropdownOpen(!proxyDropdownOpen)}
                                                        className={`w-full bg-neutral-900 border text-left text-xs py-2 px-3 flex items-center justify-between transition-colors focus:outline-none ${
                                                            proxyDropdownOpen 
                                                                ? 'border-orange-500 text-orange-500' 
                                                                : 'border-neutral-800 text-gray-300 hover:border-neutral-600'
                                                        }`}
                                                    >
                                                        <span className="font-mono">{proxyConfig.type}</span>
                                                        <svg 
                                                            className={`w-3 h-3 transition-transform duration-300 ease-in-out ${proxyDropdownOpen ? 'rotate-180 text-orange-500' : 'text-neutral-500'}`} 
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    <div className={`absolute top-full left-0 w-full mt-1 bg-neutral-950 border border-neutral-800 shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${
                                                        proxyDropdownOpen ? 'max-h-24 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'
                                                    }`}>
                                                        {['SOCKS5', 'SOCKS4'].map((option) => (
                                                            <div
                                                                key={option}
                                                                onClick={() => {
                                                                    handleProxyChange({ target: { name: 'type', value: option } });
                                                                    setProxyDropdownOpen(false);
                                                                }}
                                                                className={`px-3 py-2 text-xs cursor-pointer font-mono border-l-2 transition-all ${
                                                                    proxyConfig.type === option
                                                                        ? 'bg-neutral-900 text-orange-400 border-orange-500'
                                                                        : 'text-gray-400 border-transparent hover:bg-neutral-900 hover:text-gray-200 hover:border-neutral-700'
                                                                }`}
                                                            >
                                                                {option}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-neutral-600 uppercase">Proxy Host</label>
                                                <input 
                                                    name="host" 
                                                    value={proxyConfig.host} 
                                                    onChange={handleProxyChange} 
                                                    className="w-full bg-neutral-900 border border-neutral-800 text-gray-300 text-xs py-2 px-2 focus:outline-none focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-neutral-600 uppercase">Proxy Port</label>
                                                <input 
                                                    name="port" 
                                                    value={proxyConfig.port} 
                                                    onChange={handleProxyChange} 
                                                    className="w-full bg-neutral-900 border border-neutral-800 text-gray-300 text-xs py-2 px-2 text-center focus:outline-none focus:border-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer select-none group">
                                    <div className={`w-4 h-4 border flex items-center justify-center transition-colors duration-300 ${formData.tls ? 'border-green-500 bg-green-500/10' : 'border-neutral-600'}`}>
                                        <div className={`w-2 h-2 bg-green-500 transition-all duration-300 ${formData.tls ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                                    </div>
                                    <input type="checkbox" name="tls" checked={formData.tls} onChange={handleChange} className="hidden" />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">SSL_ENCRYPTION</span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                className={`w-full font-bold py-3 mt-4 border transition-all duration-300 uppercase tracking-widest text-sm ${
                                    proxyConfig.enabled 
                                        ? 'bg-orange-950/30 border-orange-900 text-orange-500 hover:bg-orange-900/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]' 
                                        : `${themeStyles.bg} ${themeStyles.hoverBg} border-${themeColor}-600 text-white cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                                }`}
                            >
                                {proxyConfig.enabled ? '[ INITIALIZE TUNNEL ]' : '[ CONNECT ]'}
                            </button>

                        </form>
                    </div>

                    <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-1.5 text-[10px] text-neutral-500 flex justify-between uppercase">
                        <span>Status: <span className={`transition-colors duration-500 ${proxyConfig.enabled ? "text-orange-400" : themeStyles.text}`}>{status}</span></span>
                    </div>
                </div>
            </div>
            
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

        </div>
    );
}
