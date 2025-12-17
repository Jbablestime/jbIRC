import React, { useState, useEffect, useRef } from 'react';

const getNickColor = (nick) => {
    const colors = [
        'text-cyan-400', 'text-green-400', 'text-emerald-400', 
        'text-blue-400', 'text-indigo-400', 'text-purple-400', 
        'text-fuchsia-400', 'text-pink-400', 'text-rose-400', 'text-yellow-400'
    ];
    let hash = 0;
    for (let i = 0; i < nick.length; i++) {
        hash = nick.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function Chat({ connectionDetails, onDisconnect }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    
    const [users, setUsers] = useState([
        { nick: connectionDetails.nick, mode: '@', client: connectionDetails.client },
    ]);

    const messagesEndRef = useRef(null);
    const currentChannel = connectionDetails.channels[0];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleIncoming = (msg) => {
            setMessages((prev) => [...prev, msg]);
            
            if (msg.nick && msg.type !== 'system') {
                setUsers(prev => {
                    if(prev.find(u => u.nick === msg.nick)) return prev;
                    return [...prev, { nick: msg.nick, mode: '' }]
                });
            }
        };

        let removeListener;
        if (window.ircAPI) {
            removeListener = window.ircAPI.onMessage(handleIncoming);
        }

        return () => {
            if (removeListener) removeListener();
        };
    }, []);

    const handleOpenLogs = (e) => {
        e.preventDefault();

        if (window.ircAPI) {
            window.ircAPI.openLogs()
        }
    }

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        if (window.ircAPI) {
            window.ircAPI.sendMessage({
                target: currentChannel,
                message: inputText,
                client: "jbIRC"
            });
        }

        setMessages(prev => [...prev, {
            nick: connectionDetails.nick,
            message: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            type: 'message',
            client: connectionDetails.client
        }]);

        setInputText('');
    };

    return (
        <div className="flex h-full bg-black text-gray-300 font-sans text-sm overflow-hidden selection:bg-purple-900 selection:text-white">
            <div className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col">
                <div className="h-10 flex justify-center items-center px-4 bg-neutral-900 border-b border-neutral-800 font-semibold text-gray-100 tracking-wide">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    {connectionDetails.server}
                </div>
                
                <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">Channels</div>
                    <div className="mx-2 px-3 py-1 bg-neutral-800 text-white  border-l-2 border-purple-500 flex justify-between items-center cursor-pointer">
                        <span className="font-mono">{currentChannel}</span>
                    </div>
                </div>

                <div className="p-3 bg-neutral-950 border-t border-neutral-800">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-400 font-bold truncate">{connectionDetails.nick}</span>
                        <button onClick={onDisconnect} className="flex justify-center align-middle text-xs font-bold text-red-500 hover:text-red-400 cursor-pointer">
                            QUIT
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-black">
                <div className="h-10 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-950">
                    <button className='font-mono text-orange-500 hover:text-orange-300' onClick={handleOpenLogs}>
                        [ Open Logs ]
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 font-mono text-[13px] leading-6 custom-scrollbar">
                    <div className="mb-4 text-neutral-500">
                        --- Now talking in {currentChannel} ---
                    </div>

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex hover:bg-neutral-900/50 -mx-2 px-2 ${msg.type === 'system' ? 'text-neutral-500' : ''}`}>
                            <span className="text-neutral-600 mr-3 select-none w-45px text-right shrink-0">
                                {msg.time}
                            </span>

                            <div className="flex-1 wrap-break-word">
                                {msg.type === 'system' ? (
                                    <span>* {msg.nick} {msg.message}</span>
                                ) : (
                                    <>
                                        <span className={`font-bold mr-2 ${getNickColor(msg.nick || '')}`}>
                                            &lt;{msg.nick}&gt;
                                        </span>
                                        <span className="text-gray-200">{msg.message}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-neutral-950 border-t border-neutral-800">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <span className="text-purple-500 font-mono py-2">{connectionDetails.nick} &gt;</span>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 bg-transparent outline-none border-none focus:ring-0 text-white font-mono placeholder-neutral-600"
                            placeholder="Type a command or message..."
                            autoFocus
                        />
                    </form>
                </div>
            </div>

            <div className="w-48 bg-neutral-900 border-l border-neutral-800 flex flex-col hidden md:flex">
                <div className="h-10 flex items-center px-4 bg-neutral-900 border-b border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    Users ({users.length})
                </div>
                <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                    {users.map((u, i) => (
                        <div key={i} className="px-2 py-1 text-gray-400 hover:bg-neutral-800 hover:text-gray-200 cursor-pointer rounded">
                            <div className='flex justify-left align-middle gap-[2.5px]'>
                                <span className={`${u.mode === '@' ? 'text-yellow-500' : u.mode === '+' ? 'text-gray-300' : 'text-gray-500'} mr-1`}>
                                    {u.mode || ''}
                                </span>

                                {u.nick} {u.client && <img title='Active with jbIRC' width={20} src={`../jbIRC.png`}></img>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}