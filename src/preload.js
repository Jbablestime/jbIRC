const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ircAPI', {
    connect: (data) => ipcRenderer.invoke('connect-irc', data),
    disconnect: () => ipcRenderer.invoke('disconnect'),

    openExternal: (url) => ipcRenderer.invoke('open-url', url),

    sendMessage: (data) => ipcRenderer.invoke('send-message', data),
    openLogs: () => ipcRenderer.invoke('open-logs'),

    onMessage: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('irc-message', subscription);
        return () => ipcRenderer.removeListener('irc-message', subscription);
    },

    onStatus: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('irc-status', subscription);
        return () => ipcRenderer.removeListener('irc-status', subscription);
    },
});

contextBridge.exposeInMainWorld('windowAPI', {
    minimize: () => ipcRenderer.invoke('minimize-window'),
    toggleMaximize: () => ipcRenderer.invoke('maximize-window'),
    close: () => ipcRenderer.invoke('close-window'),
});