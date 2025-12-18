import React, { useState } from 'react';

export default function Intro({ onConnect }) {
	const [proxyDropdownOpen, setProxyDropdownOpen] = useState(false);

	const [formData, setFormData] = useState({
		nick: '',
		server: 'thepiratesplunder.org',
		port: 6697,
		channels: '#TPP',
		tls: true,
		client: "jbIRC"
	});

	const [proxyConfig, setProxyConfig] = useState({
		enabled: false,
		type: 'SOCKS5',
		host: '127.0.0.1',
		port: 9050,
	});

	const [status, setStatus] = useState('READY TO INITIALIZE...');

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
		setStatus(`INPUT_UPDATE: ${name.toUpperCase()}`);
	};

	const handleProxyChange = (e) => {
		const { name, value } = e.target;
		setProxyConfig(prev => ({ ...prev, [name]: value }));
		setStatus(`PROXY_CONFIG: ${name.toUpperCase()}`);
	};

	const toggleTor = () => {
		const newState = !proxyConfig.enabled;
		setProxyConfig({
			enabled: newState,
			type: 'SOCKS5',
			host: '127.0.0.1',
			port: 9050,
		});
		setStatus(newState ? 'MODULE_LOADED: TOR_SOCKS5' : 'MODULE_UNLOADED: PROXY');
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!formData.nick || !formData.server) {
			setStatus('ERROR: MISSING_REQUIRED_FIELDS');
			return;
		}
		
		setStatus(proxyConfig.enabled ? 'ESTABLISHING_SECURE_TUNNEL...' : 'INITIATING_HANDSHAKE...');
		const channelArray = formData.channels.split(',').map(c => c.trim()).filter(Boolean);
		
		onConnect({ 
			...formData, 
			channels: channelArray,
			proxy: proxyConfig
		});
	};

	return (
		<div className="h-full bg-black text-gray-400 font-mono flex items-center justify-center p-4">
			<div className="w-full max-w-lg border border-neutral-800 bg-neutral-950 shadow-2xl relative">
				
				<div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex justify-between items-center text-xs tracking-widest">
					<span>jbIRC</span>
					<div className="flex gap-2">
						<div className={`w-2 h-2 rounded-full border ${proxyConfig.enabled ? 'bg-orange-500 border-orange-500' : 'bg-red-500/20 border-red-500'} transition-colors`}></div>
						<div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
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
							<label className="text-xs font-bold text-neutral-500 uppercase">User Identity</label>
							<div className="relative group">
								<span className="absolute left-3 top-2.5 text-neutral-600">@</span>
								<input 
									name="nick"
									value={formData.nick}
									onChange={handleChange}
									placeholder="Enter alias..."
									className="w-full bg-neutral-900 border border-neutral-800 text-gray-200 pl-8 pr-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-neutral-700"
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
									className="w-full bg-neutral-900 border border-neutral-800 text-gray-200 px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
								/>
							</div>
							<div className="space-y-1">
								<label className="text-xs font-bold text-neutral-500 uppercase">Port</label>
								<input 
									name="port"
									type="number"
									value={formData.port}
									onChange={handleChange}
									className="w-full bg-neutral-900 border border-neutral-800 text-gray-200 px-4 py-2 text-center focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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
								className="w-full bg-neutral-900 border border-neutral-800 text-gray-200 px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-neutral-700"
							/>
						</div>

						<div className="border border-dashed border-neutral-800 p-4 relative mt-6">
							<div className="absolute -top-2 left-3 bg-neutral-950 px-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-2">
								Network Routing
								{proxyConfig.enabled && <span className="text-orange-500 animate-pulse">● ACTIVE</span>}
							</div>
							
							<div className="flex justify-between items-center mb-4">
								<span className="text-xs text-neutral-400">Route traffic via Proxy/Tor?</span>
								<button 
									type="button" 
									onClick={toggleTor}
									className={`cursor-pointer text-[10px] px-2 py-1 border transition-colors ${proxyConfig.enabled ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'}`}
								>
									{proxyConfig.enabled ? '[ DISABLE_PROXY ]' : '[ LOAD_TOR_PRESET ]'}
								</button>
							</div>

							{proxyConfig.enabled && (
								<div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
													className={`w-3 h-3 transition-transform duration-200 ${proxyDropdownOpen ? 'rotate-180 text-orange-500' : 'text-neutral-500'}`} 
													fill="none" viewBox="0 0 24 24" stroke="currentColor"
												>
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</button>

											{proxyDropdownOpen && (
												<div className="absolute top-full left-0 w-full mt-1 bg-neutral-950 border border-neutral-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
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
											)}
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
							)}
						</div>

						<div className="flex items-center justify-between pt-2">
							<label className="flex items-center space-x-3 cursor-pointer select-none group">
								<div className={`w-4 h-4 border flex items-center justify-center transition-colors ${formData.tls ? 'border-green-500 bg-green-500/10' : 'border-neutral-600'}`}>
									{formData.tls && <div className="w-2 h-2 bg-green-500"></div>}
								</div>
								<input type="checkbox" name="tls" checked={formData.tls} onChange={handleChange} className="hidden" />
								<span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">SSL_ENCRYPTION</span>
							</label>
						</div>

						<button 
							type="submit" 
							className={`w-full font-bold py-3 mt-4 border transition-all uppercase tracking-widest text-sm ${
								proxyConfig.enabled 
									? 'bg-orange-950/30 border-orange-900 text-orange-500 hover:bg-orange-900/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
									: 'bg-gray-100 hover:bg-white cursor-pointer text-black border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'
							}`}
						>
							{proxyConfig.enabled ? '[ INITIALIZE TUNNEL ]' : '[ CONNECT ]'}
						</button>

					</form>
				</div>

				<div className="bg-neutral-900 border-t border-neutral-800 px-4 py-1.5 text-[10px] text-neutral-500 flex justify-between uppercase">
					<span>Status: <span className={proxyConfig.enabled ? "text-orange-400" : "text-purple-400"}>{status}</span></span>
				</div>
			</div>
			
			<div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
				style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
			</div>

		</div>
	);
}