# jbIRC <img src="https://cdn.nest.rip/uploads/4e8c88d9-4ae1-428d-b5e6-632ef5962865.png" height="50" width="50">
**jbIRC** is a modern, privacy-focused IRC client featuring a custom "System Access" aesthetic. Built with Electron, React, and Vite, it allows for secure, anonymous communication by routing traffic through SOCKS5 proxies (like Tor) before establishing TLS connections.

![jbIRC Screenshot](https://cdn.nest.rip/uploads/9ed7894e-c67a-44b0-99a0-61fd2d5d7175.png)

## 🚀 Features

* **Advanced Network Routing:** Built-in support for **SOCKS5** and **SOCKS4** proxies.
* **Tor Ready:** One-click preset to route all IRC traffic through the Tor network (`localhost:9050`).
* **Secure Protocols:** Enforced TLS v1.3 with custom handshake timeouts to prevent stalling on slow proxies.
* **Custom UI:** A frameless, "Matrix-style" dark interface with a draggable custom title bar.
* **Lightweight:** Optimized build (~70MB) using LZMA compression and aggressive Vite tree-shaking.
* **Cross-Platform:** Builds natively for Windows (`.exe`), macOS (`.dmg`), and Linux (`.AppImage`).

## 🛠 Tech Stack

* **Runtime:** [Electron](https://www.electronjs.org/) (v28+)
* **Frontend:** React + Tailwind CSS v3
* **Bundler:** Vite (configured for manual main/preload compilation)
* **Core Libraries:**
    * `irc-framework`: Robust IRC protocol handling.
    * `socks`: For establishing raw TCP tunnels through proxies.

## 📦 Installation

### Prerequisites

* Node.js (v18 or higher)
* npm

### Development Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/jbIRC.git](https://github.com/yourusername/jbIRC.git)
    cd jbIRC
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm start
    ```

## 🏗 Building for Production

This project uses a specialized build pipeline to handle native Node modules like `socks` and `irc-framework`.

### Windows (.exe)
Generates an optimized NSIS installer in the `dist/` folder.
```bash
npm run make
```

### Linux (Coming Soon)

### MacOS (Coming Soon)
