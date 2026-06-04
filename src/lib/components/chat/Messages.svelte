<script lang="ts">
	import { base } from '$app/paths';
	import { marked } from "marked";
	import { v4 as uuidv4 } from "uuid";
	import tippy from "tippy.js";
	import hljs from "highlight.js";
	import "highlight.js/styles/github-dark.min.css";
	import auto_render from "katex/dist/contrib/auto-render.mjs";
	import "katex/dist/katex.min.css";
 
	import { chatId, db } from "$lib/stores";
	import { tick, onMount } from "svelte"; 
 
	import toast from "svelte-french-toast";
 
	export let sendPrompt: Function;
	export let regenerateResponse: Function;
 
	export let bottomPadding = false;
	export let autoScroll;
	export let selectedModels;
	export let history = {};
	export let messages = [];
 
	let isAIResponding = false;
 
	$: isAIResponding = messages.length > 0 && !(messages.at(-1)?.done ?? true);
 
	onMount(() => {
		// === CANVAS ÉTOILES AMÉLIORÉ ===
		const canvas = document.getElementById('stars-canvas') as HTMLCanvasElement;
		const ctx = canvas?.getContext('2d');
		
		let animationId: number;
 
		if (ctx) {
			let particles: any[] = [];
 
			const resize = () => {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			};
 
			class Star {
				x: number; y: number; size: number; speedY: number; opacity: number;
				twinkleSpeed: number; twinkleOffset: number;
 
				constructor() { this.reset(); this.y = Math.random() * (window.innerHeight || 800); }
 
				reset() {
					this.x = Math.random() * (canvas.width || window.innerWidth);
					this.y = 0;
					this.size = Math.random() * 1.8 + 0.2;
					this.speedY = Math.random() * 0.3 + 0.05;
					this.opacity = Math.random() * 0.8 + 0.2;
					this.twinkleSpeed = Math.random() * 0.02 + 0.005;
					this.twinkleOffset = Math.random() * Math.PI * 2;
				}
 
				update(t: number) {
					this.y += this.speedY;
					if (this.y > canvas.height) this.reset();
					this.opacity = 0.3 + Math.sin(t * this.twinkleSpeed + this.twinkleOffset) * 0.5;
				}
 
				draw() {
					if (!ctx) return;
					// Lueur
					const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
					grd.addColorStop(0, `rgba(200, 240, 255, ${this.opacity})`);
					grd.addColorStop(1, 'rgba(0,0,0,0)');
					ctx.fillStyle = grd;
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
					ctx.fill();
 
					ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
					ctx.fill();
				}
			}
 
			// Quelques étoiles filantes rares
			class ShootingStar {
				x: number; y: number; length: number; speed: number; opacity: number; active: boolean;
				angle: number;
 
				constructor() { this.active = false; this.reset(); }
 
				reset() {
					this.x = Math.random() * canvas.width;
					this.y = Math.random() * canvas.height * 0.5;
					this.length = Math.random() * 120 + 60;
					this.speed = Math.random() * 8 + 4;
					this.opacity = 1;
					this.angle = Math.PI / 6 + Math.random() * 0.3;
					this.active = Math.random() < 0.002;
				}
 
				update() {
					if (!this.active) {
						if (Math.random() < 0.001) this.active = true;
						return;
					}
					this.x += Math.cos(this.angle) * this.speed;
					this.y += Math.sin(this.angle) * this.speed;
					this.opacity -= 0.02;
					if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
						this.reset();
					}
				}
 
				draw() {
					if (!ctx || !this.active || this.opacity <= 0) return;
					const grad = ctx.createLinearGradient(
						this.x, this.y,
						this.x - Math.cos(this.angle) * this.length,
						this.y - Math.sin(this.angle) * this.length
					);
					grad.addColorStop(0, `rgba(200, 245, 255, ${this.opacity})`);
					grad.addColorStop(1, 'rgba(200, 245, 255, 0)');
					ctx.strokeStyle = grad;
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.moveTo(this.x, this.y);
					ctx.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
					ctx.stroke();
				}
			}
 
			for (let i = 0; i < 250; i++) particles.push(new Star());
			const shooters = [new ShootingStar(), new ShootingStar(), new ShootingStar()];
 
			let t = 0;
			const animate = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				t++;
				particles.forEach(p => { p.update(t); p.draw(); });
				shooters.forEach(s => { s.update(); s.draw(); });
				animationId = requestAnimationFrame(animate);
			};
 
			window.addEventListener('resize', resize);
			resize();
			animate();
		}
 
		return () => {
			window.removeEventListener('resize', resize);
			if (animationId) cancelAnimationFrame(animationId);
		};
	});
 
	$: if (messages && messages.length > 0 && (messages.at(-1).done ?? false)) {
		(async () => {
			await tick();
			renderLatex();
			hljs.highlightAll();
		})();
	}
 
	const renderLatex = () => {
		let chatMessageElements = document.getElementsByClassName("chat-assistant");
		for (const element of chatMessageElements) {
			auto_render(element as HTMLElement, {
				delimiters: [
					{ left: "$$", right: "$$", display: true },
					{ left: "\\(", right: "\\)", display: true }
				],
				throwOnError: false
			});
		}
	};
</script>
 
<!-- FOND GALACTIQUE -->
<div id="galactic-background">
    <div class="nebula-layer"></div>
    <canvas id="stars-canvas"></canvas>
</div>
 
<!-- GRILLE HOLOGRAPHIQUE -->
<div class="holo-grid"></div>
 
<!-- LIGNES DE SCAN -->
<div class="scanline"></div>
 
<div class="relative z-10"> 
{#if messages.length == 0}
	<!-- PAGE D'ACCUEIL FUTURISTE -->
	<div class="m-auto text-center max-w-md pb-56 px-2 min-h-screen flex flex-col justify-center items-center">
        
		<!-- LOGO ASTROLINK — Lettre A avec étoiles gravitantes -->
		<div class="logo-container">
			<svg viewBox="-120 -120 240 240" width="260" height="260" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<!-- Glow filter pour le A -->
					<filter id="glow-a" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="4" result="blur1"/>
						<feGaussianBlur stdDeviation="10" result="blur2"/>
						<feMerge>
							<feMergeNode in="blur2"/>
							<feMergeNode in="blur1"/>
							<feMergeNode in="SourceGraphic"/>
						</feMerge>
					</filter>
					<!-- Glow pour les étoiles -->
					<filter id="glow-star" x="-200%" y="-200%" width="500%" height="500%">
						<feGaussianBlur stdDeviation="3" result="blur"/>
						<feMerge>
							<feMergeNode in="blur"/>
							<feMergeNode in="SourceGraphic"/>
						</feMerge>
					</filter>
					<!-- Gradient violet→cyan pour le A -->
					<linearGradient id="grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#a78bfa"/>
						<stop offset="50%" stop-color="#00f5ff"/>
						<stop offset="100%" stop-color="#7c3aed"/>
					</linearGradient>
					<!-- Gradient trail étoiles -->
					<linearGradient id="trail-v" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#a78bfa" stop-opacity="0"/>
						<stop offset="100%" stop-color="#a78bfa" stop-opacity="0.7"/>
					</linearGradient>
					<linearGradient id="trail-h" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stop-color="#00f5ff" stop-opacity="0.7"/>
						<stop offset="100%" stop-color="#00f5ff" stop-opacity="0"/>
					</linearGradient>
					<linearGradient id="trail-d" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#f472b6" stop-opacity="0.7"/>
						<stop offset="100%" stop-color="#f472b6" stop-opacity="0"/>
					</linearGradient>
				</defs>
 
				<!-- ═══ ORBITES (ellipses visibles) ═══ -->
				<!-- Orbite verticale -->
				<ellipse cx="0" cy="0" rx="18" ry="100" fill="none"
					stroke="rgba(167,139,250,0.15)" stroke-width="1" stroke-dasharray="4 6"/>
				<!-- Orbite horizontale -->
				<ellipse cx="0" cy="0" rx="105" ry="18" fill="none"
					stroke="rgba(0,245,255,0.15)" stroke-width="1" stroke-dasharray="4 6"/>
				<!-- Orbite diagonale (inclinée 45°) -->
				<ellipse cx="0" cy="0" rx="100" ry="22" fill="none"
					stroke="rgba(244,114,182,0.15)" stroke-width="1" stroke-dasharray="4 6"
					transform="rotate(40)"/>
 
				<!-- ═══ LETTRE A — grand, centré ═══ -->
				<g filter="url(#glow-a)">
					<!-- Jambe gauche du A -->
					<line x1="-38" y1="62" x2="0" y2="-62" stroke="url(#grad-a)" stroke-width="10" stroke-linecap="round"/>
					<!-- Jambe droite du A -->
					<line x1="38" y1="62" x2="0" y2="-62" stroke="url(#grad-a)" stroke-width="10" stroke-linecap="round"/>
					<!-- Barre horizontale du A -->
					<line x1="-20" y1="18" x2="20" y2="18" stroke="url(#grad-a)" stroke-width="7" stroke-linecap="round"/>
					<!-- Sommet du A — petit point brillant -->
					<circle cx="0" cy="-62" r="5" fill="#fff" opacity="0.9">
						<animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
						<animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
					</circle>
				</g>
 
				<!-- ═══ ÉTOILE 1 — orbite VERTICALE (violet) ═══ -->
				<g>
					<!-- Traîne verticale -->
					<line x1="0" y1="-100" x2="0" y2="-70" stroke="url(#trail-v)" stroke-width="1.5" stroke-linecap="round">
						<animateTransform attributeName="transform" type="rotate"
							from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
					</line>
					<!-- L'étoile elle-même -->
					<circle cx="0" cy="-100" r="6" fill="#c4b5fd" filter="url(#glow-star)">
						<animateTransform attributeName="transform" type="rotate"
							from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
						<animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite"/>
					</circle>
					<!-- Éclat en croix -->
					<g filter="url(#glow-star)">
						<line x1="0" y1="-106" x2="0" y2="-94" stroke="white" stroke-width="1" opacity="0.8">
							<animateTransform attributeName="transform" type="rotate"
								from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
						</line>
						<line x1="-6" y1="-100" x2="6" y2="-100" stroke="white" stroke-width="1" opacity="0.8">
							<animateTransform attributeName="transform" type="rotate"
								from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
						</line>
					</g>
				</g>
 
				<!-- ═══ ÉTOILE 2 — orbite HORIZONTALE (cyan) ═══ -->
				<g>
					<!-- Traîne horizontale -->
					<line x1="105" y1="0" x2="75" y2="0" stroke="url(#trail-h)" stroke-width="1.5" stroke-linecap="round">
						<animateTransform attributeName="transform" type="rotate"
							from="0 0 0" to="-360 0 0" dur="5.5s" repeatCount="indefinite"/>
					</line>
					<!-- L'étoile -->
					<circle cx="105" cy="0" r="6" fill="#00f5ff" filter="url(#glow-star)">
						<animateTransform attributeName="transform" type="rotate"
							from="0 0 0" to="-360 0 0" dur="5.5s" repeatCount="indefinite"/>
						<animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite"/>
					</circle>
					<g filter="url(#glow-star)">
						<line x1="105" y1="-7" x2="105" y2="7" stroke="white" stroke-width="1" opacity="0.8">
							<animateTransform attributeName="transform" type="rotate"
								from="0 0 0" to="-360 0 0" dur="5.5s" repeatCount="indefinite"/>
						</line>
						<line x1="98" y1="0" x2="112" y2="0" stroke="white" stroke-width="1" opacity="0.8">
							<animateTransform attributeName="transform" type="rotate"
								from="0 0 0" to="-360 0 0" dur="5.5s" repeatCount="indefinite"/>
						</line>
					</g>
				</g>
 
				<!-- ═══ ÉTOILE 3 — orbite DIAGONALE (rose) ═══ -->
				<g transform="rotate(40)">
					<!-- Traîne diagonale -->
					<line x1="100" y1="0" x2="72" y2="0" stroke="url(#trail-d)" stroke-width="1.5" stroke-linecap="round">
						<animateTransform attributeName="transform" type="rotate"
							from="0 0 0" to="360 0 0" dur="7s" repeatCount="indefinite"/>
					</line>
					<!-- L'étoile -->
					<circle cx="100" cy="0" r="5.5" fill="#f472b6" filter="url(#glow-star)">
						<animateTransform attributeName="transform" type="rotate"
							from="0 0 0" to="360 0 0" dur="7s" repeatCount="indefinite"/>
						<animate attributeName="r" values="4.5;7;4.5" dur="1.8s" repeatCount="indefinite"/>
					</circle>
					<g filter="url(#glow-star)">
						<line x1="100" y1="-6" x2="100" y2="6" stroke="white" stroke-width="1" opacity="0.8">
							<animateTransform attributeName="transform" type="rotate"
								from="0 0 0" to="360 0 0" dur="7s" repeatCount="indefinite"/>
						</line>
						<line x1="93" y1="0" x2="107" y2="0" stroke="white" stroke-width="1" opacity="0.8">
							<animateTransform attributeName="transform" type="rotate"
								from="0 0 0" to="360 0 0" dur="7s" repeatCount="indefinite"/>
						</line>
					</g>
				</g>
 
			</svg>
		</div>
 
		<!-- Titre holographique -->
		<div class="mt-6">
			<h1 class="text-3xl font-black tracking-[0.3em] uppercase"
				style="font-family: 'Orbitron', monospace; 
				background: linear-gradient(90deg, #00f5ff, #7c3aed, #00f5ff);
				background-size: 200% 100%;
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				animation: gradient-shift 4s linear infinite;">
				AstroLink
			</h1>
			<div class="mt-2 text-xs tracking-[0.4em] uppercase" 
				style="font-family: 'Share Tech Mono', monospace; color: rgba(0,245,255,0.5);">
				Neural Interface v1.0
			</div>
		</div>
        
        <div class="mt-3 text-xs" style="color: rgba(100,180,220,0.5); font-family: 'Share Tech Mono';">
            by Marko
        </div>
 
	</div>
 
{:else}
	<!-- CONVERSATION DARK FUTURISTE -->
	{#each messages as message, idx}
		<div class="w-full message-row {message.role === 'user' ? 'user-row' : 'assistant-row'}"
			style="animation: message-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) {idx * 0.05}s both;">
			<div class="flex justify-between px-5 max-w-3xl mx-auto rounded-lg group py-5">
				<div class="flex w-full gap-4">
					
					<!-- Avatar -->
					<div class="flex-shrink-0 mt-0.5">
						{#if message.role === "user"}
							<div class="user-avatar">
								<img src="{base}/user.png" class="w-8 h-8 object-cover rounded-full" alt="User"
									style="border: 1px solid rgba(0,245,255,0.3); box-shadow: 0 0 10px rgba(0,245,255,0.2);" />
							</div>
						{:else}
							<!-- MINI SIRI ORB pour l'IA -->
							<div class="ai-mini-orb-wrapper">
								<div class="ai-mini-orb {isAIResponding && idx === messages.length - 1 ? 'active' : ''}"></div>
							</div>
						{/if}
					</div>
 
					<!-- Contenu -->
					<div class="w-full overflow-hidden">
						<div class="flex items-center gap-2 mb-1.5">
							<span class="font-bold text-sm tracking-wide {message.role === 'user' ? 'text-white' : 'text-cyan-300'}"
								style="font-family: 'Orbitron', monospace; font-size: 11px; letter-spacing: 0.1em;">
								{#if message.role === "user"}VOUS{:else}ASTROLINK{/if}
							</span>
							{#if message.role === "assistant"}
								<span class="holo-tag">AI</span>
							{/if}
						</div>
						
						<div class="prose chat-{message.role} w-full max-w-full dark:prose-invert message-content">
							{#if message.role === "assistant"}
								{#if isAIResponding && idx === messages.length - 1 && !message.content}
									<!-- Typing indicator Siri -->
									<div class="typing-indicator">
										<div class="typing-dot"></div>
										<div class="typing-dot"></div>
										<div class="typing-dot"></div>
									</div>
								{:else}
									{@html marked(message.content)}
								{/if}
							{:else}
								{#if message.content.includes('FILE:') && message.content.includes('QUERY:')}
									{@const parts = message.content.split('\nQUERY:')}
									{@const fileHeader = parts[0].split('\n')[0]}
									{@const fileName = fileHeader.replace('FILE:', '')}
									{@const userText = parts[1] || ""}
									<div class="file-badge">
										<span>📄 {fileName}</span>
									</div>
									<div class="user-text">{userText}</div>
								{:else}
									<pre class="user-message-pre">{message.content}</pre>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/each}
	{#if bottomPadding} <div class="mb-32" /> {/if}
{/if}
</div>
 
<style>
	/* Message rows */
	.assistant-row {
		background: rgba(0, 5, 20, 0.5);
		border-top: 1px solid rgba(0, 245, 255, 0.05);
		border-bottom: 1px solid rgba(0, 245, 255, 0.05);
		backdrop-filter: blur(4px);
		position: relative;
	}
 
	.assistant-row::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: linear-gradient(180deg, transparent, rgba(0, 245, 255, 0.4), transparent);
	}
 
	/* Mini orb IA */
	.ai-mini-orb-wrapper {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
 
	.ai-mini-orb {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: radial-gradient(circle at 40% 35%, rgba(120, 230, 255, 0.95), rgba(0, 120, 220, 0.9) 50%, rgba(80, 0, 180, 0.8));
		box-shadow: 0 0 10px rgba(0, 200, 255, 0.7), 0 0 25px rgba(0, 150, 255, 0.3);
		animation: orb-breathe 3s ease-in-out infinite;
		position: relative;
	}
 
	.ai-mini-orb::before {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 50%);
	}
 
	.ai-mini-orb.active {
		animation: siri-speaking 0.6s ease-in-out infinite alternate;
	}
 
	@keyframes orb-breathe {
		0%, 100% { 
			transform: scale(1);
			box-shadow: 0 0 10px rgba(0, 200, 255, 0.7), 0 0 25px rgba(0, 150, 255, 0.3);
		}
		50% { 
			transform: scale(1.1);
			box-shadow: 0 0 18px rgba(0, 245, 255, 0.9), 0 0 40px rgba(0, 200, 255, 0.5);
		}
	}
 
	@keyframes siri-speaking {
		0% { 
			transform: scale(0.9);
			background: radial-gradient(circle at 40% 35%, rgba(120, 230, 255, 0.95), rgba(0, 120, 220, 0.9));
		}
		100% { 
			transform: scale(1.2);
			background: radial-gradient(circle at 55% 30%, rgba(255, 200, 100, 0.9), rgba(200, 80, 0, 0.8) 40%, rgba(100, 0, 200, 0.9));
			box-shadow: 0 0 30px rgba(255, 150, 0, 0.7), 0 0 60px rgba(200, 50, 255, 0.4);
		}
	}
 
	/* Texte des messages */
	.message-content {
		font-family: 'Rajdhani', sans-serif;
		font-size: 1rem;
		line-height: 1.7;
		color: rgba(220, 235, 255, 0.9);
	}
 
	.user-message-pre {
		background: transparent;
		padding: 0;
		margin: 0;
		color: rgba(220, 235, 255, 0.95);
		font-family: 'Rajdhani', sans-serif;
		font-size: 1rem;
		white-space: pre-wrap;
	}
 
	.file-badge {
		display: inline-flex;
		align-items: center;
		background: rgba(0, 245, 255, 0.1);
		border: 1px solid rgba(0, 245, 255, 0.3);
		border-radius: 6px;
		padding: 4px 12px;
		margin-bottom: 8px;
		font-size: 12px;
		color: rgba(0, 245, 255, 0.8);
		font-family: 'Share Tech Mono', monospace;
	}
 
	/* Prose dark override */
	:global(.chat-assistant p) {
		color: rgba(210, 230, 255, 0.9) !important;
		margin-bottom: 0.75rem;
	}
 
	:global(.chat-assistant code) {
		background: rgba(0, 245, 255, 0.06) !important;
		border: 1px solid rgba(0, 245, 255, 0.15) !important;
		color: #00f5ff !important;
		font-family: 'Share Tech Mono', monospace !important;
		border-radius: 4px;
		padding: 1px 6px;
	}
 
	:global(.chat-assistant pre) {
		background: rgba(0, 5, 20, 0.8) !important;
		border: 1px solid rgba(0, 245, 255, 0.15) !important;
		border-radius: 8px !important;
		position: relative;
		overflow: hidden;
	}
 
	:global(.chat-assistant pre::before) {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), transparent);
	}
 
	:global(.chat-assistant h1, .chat-assistant h2, .chat-assistant h3) {
		font-family: 'Orbitron', monospace !important;
		color: rgba(0, 245, 255, 0.9) !important;
		letter-spacing: 0.05em;
	}
 
	/* Gradient shift animation */
	@keyframes gradient-shift {
		0% { background-position: 0% 50%; }
		100% { background-position: 200% 50%; }
	}
 
	@keyframes status-blink {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; box-shadow: 0 0 10px #00f5ff; }
	}
 
	@keyframes message-appear {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
 
	/* ===== LOGO CONTAINER ===== */
	.logo-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
		animation: logo-breathe 4s ease-in-out infinite;
	}
 
	@keyframes logo-breathe {
		0%, 100% { filter: drop-shadow(0 0 15px rgba(0,245,255,0.3)) drop-shadow(0 0 40px rgba(124,58,237,0.2)); }
		50% { filter: drop-shadow(0 0 25px rgba(0,245,255,0.6)) drop-shadow(0 0 70px rgba(124,58,237,0.4)); }
	}
</style>