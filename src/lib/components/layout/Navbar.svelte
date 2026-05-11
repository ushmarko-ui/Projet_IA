<script lang="ts">
	import { base } from '$app/paths';
	import { v4 as uuidv4 } from "uuid";
	import { goto } from "$app/navigation";
	import { chatId, db } from "$lib/stores";

	export let title: string = "AstroLink";
</script>

<nav
	id="nav"
	class="fixed top-0 flex flex-row justify-center w-screen z-30 bg-transparent"
>
	<div class="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-transparent h-20 pointer-events-none"></div>

	<div class="relative flex max-w-3xl w-full mx-auto px-3 py-2.5 z-10">
		<div class="flex w-full max-w-full">
			<div class="pr-2 self-center">
				<button
					class="cursor-pointer p-1 flex items-center group transition"
					on:click={async () => {
						console.log("newChat");
						goto("/");
						await chatId.set(uuidv4());
					}}
				>
					<div class="relative flex items-center">
						<div class="absolute -inset-1 bg-cyan-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
						
						<img 
							src="/astrolink.png" 
							alt="AstroLink Logo" 
							class="relative w-8 h-8 object-cover rounded-full border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
						/>
						
						<span class="ml-2 text-[10px] font-black tracking-widest text-cyan-400/60 uppercase">
							v1.0
						</span>
					</div>
				</button>
			</div>

			<div class="flex-1 self-center font-bold text-sm tracking-wide text-cyan-100/90 text-ellipsis whitespace-nowrap overflow-hidden">
				{title != "" ? title : "AstroLink"}
			</div>
		</div>
	</div>
</nav>

<style>
	/* On s'assure que le titre a une petite lueur pour ressortir sur les étoiles */
	.text-cyan-100\/90 {
		text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
	}
</style>