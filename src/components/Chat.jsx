import React, { useState, useEffect, useRef } from 'react';
import SettingsModal from './Settings';
import { ConfigService } from '../services/ConfigService';

const COMMANDS = [
    { command: '/msg', params: '<nick> <message>', desc: 'Send a private message' },
    { command: '/join', params: '<channel>', desc: 'Join a specific channel' },
    { command: '/part', params: '[channel]', desc: 'Leave the current or specified channel' },
    { command: '/nick', params: '<new_nick>', desc: 'Change your nickname' },
    { command: '/fav', params: '', desc: 'Toggle favorite status for current buffer' },
    { command: '/clear', params: '', desc: 'Clear the current chat buffer' },
    { command: '/raw', params: '<command>', desc: 'Send a raw IRC command' },
    { command: '/quote', params: '<command>', desc: 'Alias for /raw' },
];

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

const getNickColor = (nick) => {
    if (!nick) return 'text-gray-400';
   const colors = [
        'text-cyan-400', 'text-green-400', 'text-emerald-400', 
        'text-blue-400', 'text-indigo-400', 'text-purple-400', 
        'text-fuchsia-400', 'text-pink-400', 'text-rose-400', 'text-yellow-400',
        'text-orange-400', 'text-lime-400', 'text-teal-400', 'text-sky-400', 
        'text-violet-400', 'text-amber-400', 'text-red-400'
    ];
    let hash = 0;
    for (let i = 0; i < nick.length; i++) {
        hash = nick.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function Chat({ connectionDetails, onDisconnect }) {
    const [settings, setSettings] = useState(ConfigService.loadSettings());
    const theme = THEME_VARS[settings.themeColor] || THEME_VARS.purple;

    const [favorites, setFavorites] = useState(ConfigService.loadFavorites());
    
    const [currentNick, setCurrentNick] = useState(connectionDetails.nick);
    const [activeBuffer, setActiveBuffer] = useState(connectionDetails.channels[0] || 'System');
    
    const [buffers, setBuffers] = useState(() => {
        const initial = connectionDetails.channels.length > 0 ? connectionDetails.channels : ['System'];
        return initial;
    });

    const [bufferMessages, setBufferMessages] = useState({});
    const [bufferUsers, setBufferUsers] = useState({});
    const [unreadBuffers, setUnreadBuffers] = useState([]);
    
    const [inputText, setInputText] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [filteredCommands, setFilteredCommands] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [userMeta, setUserMeta] = useState({});
    const [userPopup, setUserPopup] = useState(null);
 
    const scrollContainerRef = useRef(null);

    const serverFavorites = favorites.channels
        .filter(c => c.server === connectionDetails.server)
        .map(c => c.name);

    const regularBuffers = buffers.filter(b => !serverFavorites.includes(b));

    const displayFavorites = serverFavorites;

     useEffect(() => {
        const savedFavs = ConfigService.loadFavorites();
        const relevantFavs = savedFavs.channels;
        
        if (relevantFavs.length > 0 && window.ircAPI) {
            relevantFavs.forEach(fav => {
                if (!connectionDetails.channels.includes(fav.name)) {
                     setTimeout(() => {
                         window.ircAPI.sendMessage({ target: 'System', message: `/join ${fav.name}`, client: "jbIRC" });
                     }, 1000); 
                }
            });
        }
    }, [connectionDetails.server]);

     const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (diffSeconds < 60) return 'Just now';
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const handleUserClick = (e, nick) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        
        let left = rect.left;
        let top = rect.bottom + 1;
        let placement = 'bottom';
        
        if (left + 250 > window.innerWidth) left = window.innerWidth - 260;
        
        if (top + 110 > window.innerHeight) {
            top = rect.top - 110; 
            placement = 'top';
        }

        setUserPopup({
            x: left,
            y: top,
            nick: nick,
            placement: placement
        });
    };

    const isServerFavorite = favorites.servers.includes(connectionDetails.server);
    const isChannelFavorite = (channelName) => {
        return favorites.channels.some(c => c.server === connectionDetails.server && c.name === channelName);
    };

    useEffect(() => {
        const handleSettingsChange = () => setSettings(ConfigService.loadSettings());
        const handleFavoritesChange = () => setFavorites(ConfigService.loadFavorites());

        window.addEventListener('jbirc-settings-changed', handleSettingsChange);
        window.addEventListener('jbirc-favorites-changed', handleFavoritesChange);
        
        return () => {
            window.removeEventListener('jbirc-settings-changed', handleSettingsChange);
            window.removeEventListener('jbirc-favorites-changed', handleFavoritesChange);
        };
    }, []);

    useEffect(() => {
        const initialUsers = {};
        connectionDetails.channels.forEach(chan => {
            initialUsers[chan] = [{ nick: connectionDetails.nick, mode: '@', client: connectionDetails.client }];
        });
        setBufferUsers(initialUsers);
        
        setUserMeta(prev => ({
            ...prev,
            [connectionDetails.nick]: { hostname: 'jbIRC', lastSeen: Date.now() }
        }));
    }, [connectionDetails]);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [bufferMessages[activeBuffer], activeBuffer]);

    useEffect(() => {
        const handleIncoming = (msg) => {
            if (msg.nick) {
                setUserMeta(prev => {
                    const currentData = prev[msg.nick] || {};
                    const newHostname = msg.hostname || currentData.hostname || 'unknown';
                    
                    return {
                        ...prev,
                        [msg.nick]: {
                            hostname: newHostname,
                            lastSeen: Date.now()
                        }
                    };
                });
            }
            
            let targetBuffer = msg.target;
            const myNick = currentNick; 

            if (msg.type === 'quit') {
                setBufferUsers(prev => {
                    const newState = { ...prev };
                    let affected = false;
                    Object.keys(newState).forEach(bufferName => {
                        const userExists = newState[bufferName]?.find(u => u.nick === msg.nick);
                        if (userExists) {
                            newState[bufferName] = newState[bufferName].filter(u => u.nick !== msg.nick);
                            affected = true;
                            setBufferMessages(prevMsgs => ({
                                ...prevMsgs,
                                [bufferName]: [...(prevMsgs[bufferName] || []), { ...msg, target: bufferName }]
                            }));
                        }
                    });
                    return affected ? newState : prev;
                });
                return; 
            }

            if (msg.type === 'part' && msg.nick === myNick) {
                 setBuffers(prev => prev.filter(b => b !== targetBuffer));
                 if (activeBuffer === targetBuffer) setActiveBuffer('System');
                 return;
            }

            if (targetBuffer === myNick) {
                targetBuffer = msg.nick;
            }

            if (!targetBuffer && msg.type === 'status') {
                targetBuffer = activeBuffer; 
            }

            if (!targetBuffer) return;

            setBuffers(prev => {
                if (!prev.includes(targetBuffer)) return [...prev, targetBuffer];
                return prev;
            });

            setBufferMessages(prev => ({
                ...prev,
                [targetBuffer]: [...(prev[targetBuffer] || []), msg]
            }));

            if (targetBuffer !== activeBuffer) {
                setUnreadBuffers(prev => prev.includes(targetBuffer) ? prev : [...prev, targetBuffer]);
            }

            if (msg.type === 'part' || msg.type === 'kick') {
                setBufferUsers(prev => ({
                    ...prev,
                    [targetBuffer]: (prev[targetBuffer] || []).filter(u => u.nick !== msg.nick)
                }));
            } else if (msg.nick && msg.type !== 'system' && msg.type !== 'status') {
                setBufferUsers(prev => {
                    const currentList = prev[targetBuffer] || [];
                    if (currentList.find(u => u.nick === msg.nick)) return prev;
                    return {
                        ...prev,
                        [targetBuffer]: [...currentList, { nick: msg.nick, mode: '' }]
                    };
                });
            }
        };

        let removeMessageListener;
        if (window.ircAPI) {
            removeMessageListener = window.ircAPI.onMessage(handleIncoming);
        }

        return () => {
            if (removeMessageListener) removeMessageListener();
        };
    }, [activeBuffer, currentNick]);

    const switchBuffer = (bufferName) => {
        setActiveBuffer(bufferName);
        setUnreadBuffers(prev => prev.filter(b => b !== bufferName));
        setShowAutocomplete(false);
    };

    const clickFavorite = (bufferName) => {
        if (!buffers.includes(bufferName)) {
            setBuffers(prev => [...prev, bufferName]);
            
            if (bufferName.startsWith('#') && window.ircAPI) {
                window.ircAPI.sendMessage({ target: 'System', message: `/join ${bufferName}`, client: "jbIRC" });
            }
        }

        switchBuffer(bufferName);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputText(val);

        if (val.startsWith('/')) {
            const commandPart = val.split(' ')[0].toLowerCase();
            if (!val.includes(' ')) {
                const matches = COMMANDS.filter(c => c.command.startsWith(commandPart));
                setFilteredCommands(matches);
                setShowAutocomplete(matches.length > 0);
                setSelectedIndex(0);
            } else {
                setShowAutocomplete(false);
            }
        } else {
            setShowAutocomplete(false);
        }
    };

    const executeCommand = (cmdObj) => {
        setInputText(`${cmdObj.command} `);
        setShowAutocomplete(false);
    };

    const handleKeyDown = (e) => {
        if (showAutocomplete && filteredCommands.length > 0) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                executeCommand(filteredCommands[selectedIndex]);
            } else if (e.key === 'Escape') {
                setShowAutocomplete(false);
            }
        }
    };

        const getTimeString = () => {
            const is12Hour = settings.timestampFormat === '12h';
            return new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: is12Hour 
            });
        };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        if (showAutocomplete) return;

        const timeStr = getTimeString();

        setUserMeta(prev => ({
            ...prev,
            [currentNick]: { ...prev[currentNick], lastSeen: Date.now() }
        }));

        if (inputText.trim() === '/clear') {
            setBufferMessages(prev => ({ ...prev, [activeBuffer]: [] }));
            setInputText('');
            return;
        }

        if (inputText.trim() === '/fav') {
            ConfigService.toggleFavoriteChannel(connectionDetails.server, activeBuffer);
            const wasFav = isChannelFavorite(activeBuffer);
            const outMsg = {
                nick: 'System',
                message: `${activeBuffer} ${wasFav ? 'removed from' : 'added to'} favorites.`,
                time: timeStr,
                type: 'system'
            };
            setBufferMessages(prev => ({
                ...prev,
                [activeBuffer]: [...(prev[activeBuffer] || []), outMsg]
            }));
            setInputText('');
            return;
        }

        if (inputText.startsWith('/msg ')) {
            const parts = inputText.split(' ');
            if (parts.length >= 3) {
                const targetNick = parts[1];
                const msgContent = parts.slice(2).join(' ');
                setBuffers(prev => !prev.includes(targetNick) ? [...prev, targetNick] : prev);
                const outMsg = { nick: currentNick, message: msgContent, time: timeStr, type: 'message', client: connectionDetails.client };
                setBufferMessages(prev => ({ ...prev, [targetNick]: [...(prev[targetNick] || []), outMsg] }));
            }
        } else if (inputText.startsWith('/join ')) {
            const parts = inputText.split(' ');
            if (parts.length >= 2) {
                const channel = parts[1];
                setBuffers(prev => !prev.includes(channel) ? [...prev, channel] : prev);
                setActiveBuffer(channel);
            }
        } else if (inputText.startsWith('/part')) {
            const parts = inputText.split(' ');
            const target = parts.length >= 2 ? parts[1] : activeBuffer;
            if (target !== 'System') {
                setBuffers(prev => prev.filter(b => b !== target));
                if (activeBuffer === target) setActiveBuffer('System');
            }
        } else if (inputText.startsWith('/nick ')) {
            const parts = inputText.split(' ');
            if (parts.length >= 2) {
                const newNick = parts[1];
                const oldNick = currentNick;
                setCurrentNick(newNick);
                setBufferUsers(prev => {
                    const newState = { ...prev };
                    Object.keys(newState).forEach(key => {
                         newState[key] = newState[key].map(u => u.nick === oldNick ? { ...u, nick: newNick } : u);
                    });
                    return newState;
                });
                const outMsg = { nick: 'System', message: `You are now known as ${newNick}`, time: timeStr, type: 'system' };
                setBufferMessages(prev => ({ ...prev, [activeBuffer]: [...(prev[activeBuffer] || []), outMsg] }));
            }
        } else {
            if (!inputText.startsWith('/') || inputText.startsWith('/me ')) {
                const outMsg = { nick: currentNick, message: inputText, time: timeStr, type: 'message', client: connectionDetails.client };
                setBufferMessages(prev => ({ ...prev, [activeBuffer]: [...(prev[activeBuffer] || []), outMsg] }));
            }
        }

        if (window.ircAPI) {
            window.ircAPI.sendMessage({ target: activeBuffer, message: inputText, client: "jbIRC" });
        }

        setInputText('');
    };

    const handleOpenLogs = (e) => {
        e.preventDefault();
        if (window.ircAPI) window.ircAPI.openLogs();
    }

    const currentMessages = bufferMessages[activeBuffer] || [];
    const currentUsers = bufferUsers[activeBuffer] || [];

    const fontSizes = {
        small: 'text-xs',
        normal: 'text-[13px]',
        large: 'text-sm'
    };

    return (
        <div className={`flex h-full bg-black text-gray-300 font-sans ${fontSizes[settings.fontSize] || 'text-[13px]'} overflow-hidden selection:bg-purple-900 selection:text-white relative`}>
            
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {userPopup && (
                <>
                    <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setUserPopup(null)}
                    ></div>
                    
                    <div 
                        className="absolute z-50 bg-neutral-950 border border-neutral-800 shadow-2xl p-3 w-52 animate-in fade-in zoom-in-95 duration-100 rounded-sm"
                        style={{ top: userPopup.y, left: userPopup.x }}
                    >
                        <div className={`absolute left-4 w-3 h-3 bg-neutral-950 border-neutral-800 transform rotate-45 ${
                             userPopup.placement === 'top' 
                             ? '-bottom-1.5 border-b border-r'
                             : '-top-1.5 border-t border-l'    
                        }`}></div>

                        <div className="flex items-center justify-between mb-2 border-b border-neutral-800 pb-1.5 relative z-10">
                            <span className={`font-bold font-mono text-sm ${getNickColor(userPopup.nick)}`}>{userPopup.nick}</span>
                            <div className="text-[9px] bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-neutral-500 uppercase">{userPopup.nick === "BlackBeard" && connectionDetails.server.includes("thepiratesplunder.org") ? "ROBOT" : "USER"}</div>
                        </div>
                        
                        <div className="space-y-1 text-[10px] font-mono relative z-10">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Host:</span>
                                <span className="text-neutral-300 truncate max-w-[100px]" title={userMeta[userPopup.nick]?.hostname || 'Unknown'}>
                                    {userMeta[userPopup.nick]?.hostname || 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Seen:</span>
                                <span className="text-green-400">
                                    {formatLastSeen(userMeta[userPopup.nick]?.lastSeen)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-2 gap-2 pt-1.5 border-t border-neutral-800 flex justify-end relative z-10">
                            <button 
                                onClick={() => {
                                    setInputText(`/msg ${userPopup.nick} `);
                                    setUserPopup(null);
                                }}
                                className={`text-[9px] uppercase font-bold px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-${settings.themeColor}-500 hover:text-${settings.themeColor}-400 transition-colors rounded-sm`}
                            >
                                Message
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col">
                <div className="h-10 flex justify-between items-center px-4 bg-neutral-900 border-b border-neutral-800 font-semibold text-gray-100 tracking-wide">
                    <div className="flex items-center truncate">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: theme.hex, boxShadow: `0 0 8px ${theme.hex}99` }}></div>
                        <span className="truncate">{connectionDetails.server}</span>
                    </div>
                    
                    <button 
                        onClick={() => ConfigService.toggleFavoriteServer(connectionDetails.server)}
                        className={isServerFavorite ? "text-yellow-500 hover:text-yellow-600 transition-colors" : "text-neutral-500 hover:text-yellow-500 transition-colors"}
                        title={isServerFavorite ? "Unfavorite Server" : "Favorite Server"}
                    >
                        {isServerFavorite ? '★' : '☆'}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    
                    {displayFavorites.length > 0 && (
                        <div className="mb-4">
                            <div className="px-4 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                Favorites
                            </div>
                            {displayFavorites.map(buffer => {
                                const isOpen = buffers.includes(buffer);
                                const isActive = buffer === activeBuffer;
                                const isUnread = unreadBuffers.includes(buffer);
                                
                                return (
                                    <div 
                                        key={buffer}
                                        onClick={() => clickFavorite(buffer)}
                                        className={`mx-2 px-3 py-1 mb-1 flex justify-between items-center cursor-pointer transition-colors group
                                            ${isActive 
                                                ? 'bg-neutral-800 text-white border-l-2' 
                                                : 'text-gray-400 hover:bg-neutral-800 hover:text-gray-200 border-l-2 border-transparent'}
                                            ${!isOpen ? 'opacity-60 hover:opacity-100' : ''}
                                        `}
                                        style={{ borderColor: isActive ? theme.hex : 'transparent' }}
                                    >
                                        <span className={`font-mono truncate flex-1 ${isUnread ? 'text-white font-bold' : ''}`}>
                                            {buffer}
                                        </span>
                                        
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    ConfigService.toggleFavoriteChannel(connectionDetails.server, buffer);
                                                }}
                                                className="text-[10px] text-yellow-500 hover:text-yellow-400 transition-all"
                                            >
                                                ★
                                            </button>

                                            {isUnread && (
                                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.hex }}></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div>
                        <div className="px-4 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Messages</div>
                        {regularBuffers.map(buffer => {
                            const isActive = buffer === activeBuffer;
                            const isUnread = unreadBuffers.includes(buffer);
                            
                            return (
                                <div 
                                    key={buffer}
                                    onClick={() => switchBuffer(buffer)}
                                    className={`mx-2 px-3 py-1 mb-1 flex justify-between items-center cursor-pointer transition-colors group
                                        ${isActive 
                                            ? 'bg-neutral-800 text-white border-l-2' 
                                            : 'text-gray-400 hover:bg-neutral-800 hover:text-gray-200 border-l-2 border-transparent'}
                                    `}
                                    style={{ borderColor: isActive ? theme.hex : 'transparent' }}
                                >
                                    <span className={`font-mono truncate flex-1 ${isUnread ? 'text-white font-bold' : ''}`}>
                                        {buffer}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                ConfigService.toggleFavoriteChannel(connectionDetails.server, buffer);
                                            }}
                                            className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 hover:text-yellow-500 transition-all"
                                        >
                                            ☆
                                        </button>

                                        {isUnread && (
                                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.hex }}></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-3 bg-neutral-950 border-t border-neutral-800">
                    <div className="flex items-center justify-between">
                        <span className="font-mono font-bold truncate max-w-[100px]" style={{ color: theme.hex }}>{currentNick}</span>
                        <button onClick={onDisconnect} className="flex justify-center align-middle text-xs font-bold text-red-500 hover:text-red-400 cursor-pointer">
                            QUIT
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-black">
                <div className="h-10 border-b border-neutral-800 flex align-start justify-between items-center px-4 bg-neutral-950">
                    <span className="font-mono text-gray-400 font-bold">{activeBuffer}</span>
                    <div className="flex gap-3 items-center">
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-neutral-500 hover:text-white transition-colors"
                            title="Settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>

                        <button className='group border h-[25px] flex items-center border-red-900/50 bg-red-950/20 px-6 py-2 rounded text-xs text-red-500 hover:bg-red-900 hover:text-white hover:border-red-500 transition-all uppercase tracking-wider font-mono' onClick={handleOpenLogs}>
                            [ Open Logs ]
                        </button>
                    </div>
                </div>

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-2 font-mono leading-6 custom-scrollbar">
                    <div className="mb-4 text-neutral-500 text-center text-xs opacity-50">
                        --- Beginning of history for {activeBuffer} ---
                    </div>

                    {currentMessages.map((msg, i) => (
                        <div key={i} className={`flex hover:bg-neutral-900/50 -mx-2 px-2 ${msg.type === 'system' ? 'text-neutral-500' : ''}`}>
                            {settings.showTimestamps && (
                                <span className="text-neutral-600 mr-3 select-none w-45px text-right shrink-0">
                                    {msg.time}
                                </span>
                            )}

                            <div className="flex-1 wrap-break-word break-words overflow-hidden">
                                {msg.type === 'system' ? (
                                    <span>* {msg.nick} {msg.message}</span>
                                ) : (
                                    <>
                                        <span 
                                            className={`font-bold mr-2 cursor-pointer hover:underline decoration-neutral-500 underline-offset-2 ${getNickColor(msg.nick || '')}`}
                                            onClick={(e) => handleUserClick(e, msg.nick)}
                                        >
                                            &lt;{msg.nick}&gt;
                                        </span>
                                        <span className="text-gray-200">{msg.message}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="relative">
                    {showAutocomplete && (
                        <div className="absolute bottom-full left-2 mb-1 w-96 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-t overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-100">
                            <div className="bg-neutral-950 px-2 py-1 text-[10px] text-neutral-500 uppercase font-bold border-b border-neutral-800 flex justify-between">
                                <span>Command Completion</span>
                                <span>[TAB] to select</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredCommands.map((cmd, idx) => (
                                    <div 
                                        key={cmd.command}
                                        onClick={() => executeCommand(cmd)}
                                        className={`px-3 py-2 cursor-pointer flex flex-col border-l-2 transition-colors ${
                                            idx === selectedIndex 
                                            ? `bg-neutral-800 border-${settings.themeColor}-500` 
                                            : 'border-transparent hover:bg-neutral-800/50'
                                        }`}
                                        style={{ borderColor: idx === selectedIndex ? theme.hex : 'transparent' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold font-mono ${idx === selectedIndex ? '' : 'text-gray-300'}`} style={{ color: idx === selectedIndex ? theme.hex : undefined }}>
                                                {cmd.command}
                                            </span>
                                            <span className="text-xs text-neutral-500 font-mono">
                                                {cmd.params}
                                            </span>
                                        </div>
                                        <span className="text-xs text-neutral-400">
                                            {cmd.desc}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-1 bg-neutral-950 border-t border-neutral-800">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <span className="font-mono pl-2 py-2 hidden sm:block" style={{ color: theme.hex }}>{currentNick} &gt;</span>
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent outline-none border-none focus:ring-0 text-white font-mono placeholder-neutral-600 ml-2 sm:ml-0"
                                placeholder={`Message ${activeBuffer}...`}
                                autoFocus
                            />
                        </form>
                    </div>
                </div>
            </div>

            <div className="w-48 bg-neutral-900 border-l border-neutral-800 flex flex-col hidden md:flex">
                <div className="h-10 flex items-center px-4 bg-neutral-900 border-b border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    Users ({currentUsers.length})
                </div>
                <div className="flex-1 overflow-y-auto p-2 font-mono text-xs custom-scrollbar">
                    {currentUsers.map((u, i) => {
                        return (
                        <div onClick={(e) => handleUserClick(e, u.nick)} key={`${u.nick}-${i}`} className="px-2 py-1 text-gray-400 hover:bg-neutral-800 hover:text-gray-200 cursor-pointer rounded flex justify-between items-center group">
                            <span className="truncate" >
                                <span className={`${u.mode === '@' ? 'text-yellow-500' : 'text-gray-500'} mr-1`}>
                                    {u.mode || ''}
                                </span>
                                {u.nick}
                            </span>
                        </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
