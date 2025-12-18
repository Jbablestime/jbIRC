import React, { useState, useEffect } from 'react';
import Intro from './components/Intro';
import Chat from './components/Chat';
import TitleBar from './components/TitleBar';

export default function App() {
    const [viewState, setViewState] = useState('intro');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionDetails, setConnectionDetails] = useState(null);

    const handleConnect = (details) => {
        setConnectionDetails(details);
        setViewState('connecting');

        if (window.ircAPI) {
            window.ircAPI.connect(details);
        }
    };

    const handleDisconnect = () => {
        setViewState('transition-to-intro');
        
        setTimeout(() => {
            setViewState('intro');
            setConnectionDetails(null);
        }, 500);
    };

    const handleCancelConnection = () => {
        window.ircAPI.disconnect();
        setViewState('intro');
        setConnectionDetails(null);
    };

    useEffect(() => {
        if (window.ircAPI) {
            const removeListener = window.ircAPI.onStatus((statusMsg) => {
                if (statusMsg === "Connected") {
                    setViewState('transition-to-chat');
                    
                    setTimeout(() => {
                        setViewState('chat');
                    }, 500);
                }
            });
            
            return () => removeListener();
        }
    }, []);

     const getIntroStyle = () => {
        switch (viewState) {
        case 'intro':
        case 'connecting':
            return 'opacity-100 scale-100 translate-y-0 z-20';
        case 'transition-to-chat':
            return 'opacity-0 scale-95 -translate-y-10 z-20 pointer-events-none';
        case 'chat':
            return 'opacity-0 scale-95 -translate-y-10 z-0 pointer-events-none';
        case 'transition-to-intro':
            return 'opacity-100 scale-100 translate-y-0 z-20';
        default:
            return '';
        }
    };

    const getConnectingStyle = () => {
        switch (viewState) {
        case 'connecting':
            return 'opacity-100 scale-100 translate-y-0 z-50';
        case 'transition-to-chat':
            return 'opacity-0 scale-95 -translate-y-10 z-50 pointer-events-none';
        default:
            return 'opacity-0 scale-95 translate-y-10 z-0 pointer-events-none';
        }
    };

    const getChatStyle = () => {
        switch (viewState) {
        case 'intro':
        case 'connecting':
            return 'opacity-0 scale-95 translate-y-10 z-0 pointer-events-none';
        case 'transition-to-chat':
            return 'opacity-100 scale-100 translate-y-0 z-10';
        case 'chat':
            return 'opacity-100 scale-100 translate-y-0 z-10';
        case 'transition-to-intro':
            return 'opacity-0 scale-95 translate-y-10 z-0 pointer-events-none';
        default:
            return '';
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black font-mono">
            <TitleBar />
            
            <div className="flex-1 relative overflow-hidden">
                
                <div className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${getIntroStyle()}`}>
                    <Intro onConnect={handleConnect} />
                </div>

                <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-200 ease-out transform ${getConnectingStyle()}`}>
                    <div className="text-center p-8 border border-neutral-900 bg-neutral-950 rounded-lg shadow-2xl">
                        <h2 className="text-xl text-white font-bold tracking-widest mb-2 animate-pulse">SECURE HANDSHAKE IN PROGRESS</h2>
                        <div className="text-neutral-500 text-xs font-mono mb-6">CONNECTING TO...</div>
                        
                        <div className="flex justify-center gap-1.5">
                            <div className="w-1.5 h-8 bg-green-600 animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-8 bg-green-600 animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-8 bg-green-600 animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }}></div>
                            <div className="w-1.5 h-8 bg-green-600 animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: '450ms' }}></div>
                        </div>

                        <button 
                            onClick={handleCancelConnection}
                            className="group border border-red-900/50 bg-red-950/20 px-6 py-2 mt-6 rounded text-xs text-red-500 hover:bg-red-900 hover:text-white hover:border-red-500 transition-all uppercase tracking-wider"
                        >
                            [ Abort ]
                        </button>
                        
                        <div className="mt-6 text-[10px] text-neutral-700 font-mono">
                            {connectionDetails?.server}
                        </div>
                    </div>
                </div>

                {(connectionDetails || viewState === 'transition-to-intro') && (
                    <div className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${getChatStyle()}`}>
                        <Chat 
                        connectionDetails={connectionDetails || {}}
                        onDisconnect={handleDisconnect} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}