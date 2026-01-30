const KEYS = {
    CONNECTION: 'jbirc_last_connection',
    SETTINGS: 'jbirc_app_settings',
    FAVORITES: 'jbirc_favorites'
};

const DEFAULTS = {
    connection: {
        nick: '',
        server: 'thepiratesplunder.org',
        port: 6697,
        channels: '#TPP',
        tls: true,
        client: "jbIRC",
        saslEnabled: false,
        saslAccount: '',
    },
    settings: {
        themeColor: 'purple',
        fontSize: 'normal',
        showTimestamps: true,
        timestampFormat: '24h'
    },
    favorites: {
        servers: [],
        channels: []
    }
};

export const ConfigService = {
    loadConnection: () => {
        try {
            const data = localStorage.getItem(KEYS.CONNECTION);
            return data ? { ...DEFAULTS.connection, ...JSON.parse(data) } : DEFAULTS.connection;
        } catch (e) {
            console.error('Failed to load connection config:', e);
            return DEFAULTS.connection;
        }
    },

    saveConnection: (formData) => {
        try {
            const toSave = { ...formData };
            delete toSave.saslPassword; 
            
            localStorage.setItem(KEYS.CONNECTION, JSON.stringify(toSave));
        } catch (e) {
            console.error('Failed to save connection config:', e);
        }
    },

    loadSettings: () => {
        try {
            const data = localStorage.getItem(KEYS.SETTINGS);
            return data ? { ...DEFAULTS.settings, ...JSON.parse(data) } : DEFAULTS.settings;
        } catch (e) {
            return DEFAULTS.settings;
        }
    },

    saveSettings: (settings) => {
        try {
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
            window.dispatchEvent(new Event('jbirc-settings-changed'));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    },

    loadFavorites: () => {
        try {
            const data = localStorage.getItem(KEYS.FAVORITES);
            return data ? { ...DEFAULTS.favorites, ...JSON.parse(data) } : DEFAULTS.favorites;
        } catch (e) {
            return DEFAULTS.favorites;
        }
    },

    toggleFavoriteServer: (serverName) => {
        const favs = ConfigService.loadFavorites();
        if (favs.servers.includes(serverName)) {
            favs.servers = favs.servers.filter(s => s !== serverName);
        } else {
            favs.servers.push(serverName);
        }
        ConfigService.saveFavorites(favs);
    },

    toggleFavoriteChannel: (serverName, channelName) => {
        const favs = ConfigService.loadFavorites();
        const existsIndex = favs.channels.findIndex(c => c.server === serverName && c.name === channelName);
        
        if (existsIndex > -1) {
            favs.channels.splice(existsIndex, 1);
        } else {
            favs.channels.push({ server: serverName, name: channelName });
        }
        ConfigService.saveFavorites(favs);
    },

    saveFavorites: (favs) => {
        try {
            localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
            window.dispatchEvent(new Event('jbirc-favorites-changed'));
        } catch (e) {
            console.error('Failed to save favorites:', e);
        }
    }
};