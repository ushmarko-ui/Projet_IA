<script lang="ts">
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

	// --- MOTEUR D'ÉTOILES FILANTES (Canvas) ---
	onMount(() => {
		const canvas = document.getElementById('stars-canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		let particles: any[] = [];
		let animationId: number;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		class Star {
			x: number; y: number; size: number; speedY: number; opacity: number;
			constructor() { this.reset(); }
			reset() {
				this.x = Math.random() * canvas.width;
				this.y = Math.random() * (canvas.height || 800);
				this.size = Math.random() * 1.5;
				this.speedY = (Math.random() * 0.5) + 0.1; 
				this.opacity = Math.random();
			}
			update() {
				this.y += this.speedY;
				if (this.y > canvas.height) this.reset();
			}
			draw() {
				if (!ctx) return;
				ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		for (let i = 0; i < 200; i++) particles.push(new Star());

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			particles.forEach(p => { p.update(); p.draw(); });
			animationId = requestAnimationFrame(animate);
		};

		window.addEventListener('resize', resize);
		resize();
		animate();

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	});

	// Gestion des messages et rendus
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

<div id="galactic-background">
    <div class="nebula-layer"></div>
    <canvas id="stars-canvas"></canvas>
</div>

<div class="relative z-10"> 
{#if messages.length == 0}
	<div class="m-auto text-center max-w-md pb-56 px-2 min-h-screen flex flex-col justify-center">
    <div class="flex justify-center mt-8">
        <div class="relative group">
            <div class="absolute -inset-2 bg-gradient-to-br from-cyan-600/30 to-purple-600/20 rounded-full blur-2xl opacity-80 animate-pulse"></div>
            
            <img 
                src="/astrolink.png" 
                alt="AstroLink Logo" 
                class="relative w-48 h-48 object-cover drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" 
            />
        </div>
    </div>
    
    <div class=" mt-4 text-sm text-cyan-300/60 font-medium italic">
        By Marko
    </div>

		<div class=" mt-6 text-3xl text-cyan-400 font-bold tracking-[0.2em] uppercase drop-shadow-lg">
			
		</div>
		<div class=" mt-2 text-sm text-cyan-300/60 font-medium italic">
			
		</div>
	</div>
{:else}
	{#each messages as message}
		<div class=" w-full py-4 {message.role === 'user' ? '' : 'bg-slate-900/40 backdrop-blur-sm border-y border-white/5'}">
			<div class="flex justify-between px-5 max-w-3xl mx-auto rounded-lg group">
				<div class=" flex w-full">
					<div class=" mr-4">
						{#if message.role === "user"}
							<img src="/user.png" class=" max-w-[28px] object-cover rounded-full border border-cyan-500/30" alt="User" />
						{:else}
							<div class="p-1 bg-cyan-900/50 rounded-full border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[20px] h-[20px] text-cyan-400">
									<path d="m12 15-3-3m1.35-2.35L15 6.45c.42-.42 1-.65 1.55-.65h4c.55 0 1 .45 1 1v4c0 .55-.23 1.13-.65 1.55L14.25 18.3c-.42.42-1 .65-1.55.65h-4c-.55 0-1-.45-1-1v-4c0-.55.23-1.13.65-1.55Z" />
								</svg>
							</div>
						{/if}
					</div>
					<div class="w-full overflow-hidden text-slate-100">
						<div class=" self-center font-bold mb-0.5 {message.role === 'user' ? 'text-white' : 'text-cyan-300'}">
							{#if message.role === "user"} You {:else} AstroLink {/if}
						</div>
						
						<div class="prose chat-{message.role} w-full max-w-full dark:prose-invert whitespace-pre-line">
							{#if message.role === "assistant"}
								{@html marked(message.content)}
							{:else}
								{#if message.content.includes('FILE:') && message.content.includes('QUERY:')}
									{@const parts = message.content.split('\nQUERY:')}
									{@const fileHeader = parts[0].split('\n')[0]}
									{@const fileName = fileHeader.replace('FILE:', '')}
									{@const userText = parts[1] || ""}

									<div class="flex items-center bg-cyan-900/40 border border-cyan-500/30 rounded-lg px-3 py-1.5 mb-2 w-fit text-xs text-cyan-300">
										<span class="mr-2">📄 {fileName}</span>
									</div>
									<div class="font-sans text-slate-100">{userText}</div>
								{:else}
									<pre id="user-message" class="bg-transparent p-0 m-0 text-slate-100 font-sans">{message.content}</pre>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/each}
	{#if bottomPadding} <div class=" mb-24" /> {/if}
{/if}
</div>

<style>
	.uppercase:hover {
		text-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
		transition: all 0.3s ease;
	}
</style>