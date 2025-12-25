# jbIRC <img src="https://cdn.nest.rip/uploads/4e8c88d9-4ae1-428d-b5e6-632ef5962865.png" height="35" width="35">
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/Jbablestime/jbIRC/latest/total)
![GitHub License](https://img.shields.io/github/license/Jbablestime/jbIRC)

jbIRC is a modern, user friendly IRC client built around privacy and security. Developed with Tailwind, React, and Electron.

![jbIRC Screenshot](https://cdn.nest.rip/uploads/9ed7894e-c67a-44b0-99a0-61fd2d5d7175.png)

## 🚀 Features
![GitHub package.json version](https://img.shields.io/github/package-json/v/Jbablestime/jbIRC)

**Proxy Support**: Join IRC servers with ease knowing your requests are being routed through a proxy. Supporst SOCKS4/5, HTTP, and Tor!  
**SSL Encyption**: Your messages are encrypted end-to-end, ensuring a SSL/TLS connection is established before anything.  
**Lightweight**: Built at only 81MB, jbIRC is built only on the essential services and dependencies.  
**Cross-Platform**: jbIRC supports being built into Windows (.exe), MacOS  (.dmg), and Linux (.AppImage) executables.

## 🧑🏻‍💻 Local Installation
### Prerequisites
- NodeJS v18+
- npm

### Setup
1. **Clone the repository**
```
git clone https://github.com/Jbablestime/jbIRC.git
cd jbIRC
```

2. **Install dependencies**
```
npm install
```

3. **Run the program**
```
npm run start
```

## 💻 Compile for Production
### Required
- ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/Jbablestime/jbIRC/irc-framework)
- ![GitHub package.json prod dependency version](https://img.shields.io/github/package-json/dependency-version/Jbablestime/jbIRC/socks)

### Building for Windows
Compiles the workspace into an optimized NSIS installer
```
npm run make
```

Other build scripts will be made along with support for other platforms here.



