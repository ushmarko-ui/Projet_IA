<script lang="ts">
	export let submitPrompt: Function;
	export let stopResponse: Function;
	export let prompt = "";
	export let messages = [];

	let isBlast = false;
	let fileInput: HTMLInputElement;
	let attachedFile: { name: string, content: string } | null = null;

	const handleFileUpload = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			attachedFile = {
				name: file.name,
				content: e.target?.result as string
			};
		};
		reader.readAsText(file);
		target.value = ""; 
	};

	const handleAction = () => {
		if (prompt.trim() !== "" || attachedFile) {
			isBlast = true;
			
			// Format spécial pour que Messages.svelte puisse le reconnaître
			let messageToSend = prompt;
			if (attachedFile) {
				messageToSend = `FILE:${attachedFile.name}\n${attachedFile.content}\nQUERY:${prompt}`;
			}

			submitPrompt(messageToSend);
			
			// Reset
			prompt = "";
			attachedFile = null;
			setTimeout(() => { isBlast = false; }, 400);
		}
	};
</script>

<div class="fixed bottom-0 w-full z-50">
	<div class="bg-white dark:bg-gray-800/60 backdrop-blur-md pb-4">
		<div class="max-w-3xl px-2.5 mx-auto">
			
			{#if attachedFile}
				<div class="flex items-center bg-cyan-500/20 border border-cyan-500/30 rounded-t-lg px-3 py-2 w-fit mb-[-1px] ml-2 text-xs text-cyan-100">
					<span class="mr-2">📄 {attachedFile.name}</span>
					<button on:click={() => attachedFile = null} class="hover:text-white text-cyan-400">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}

			<form
				class="flex flex-col relative w-full {attachedFile ? 'rounded-b-xl rounded-tr-xl' : 'rounded-xl'} border dark:border-gray-600 bg-white dark:bg-gray-800/50 dark:text-gray-100"
				on:submit|preventDefault={handleAction}
			>
				<div class="flex items-center">
					<input type="file" bind:this={fileInput} on:change={handleFileUpload} class="hidden" />
					
					<button
						type="button"
						class="ml-3 p-2 text-gray-400 hover:text-cyan-400 transition-colors"
						on:click={() => fileInput.click()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</button>

					<textarea
						id="chat-textarea"
						class="dark:bg-transparent dark:text-gray-100 outline-none w-full py-3 px-2 rounded-xl resize-none"
						placeholder="Pose une question ou importe un fichier..."
						bind:value={prompt} 
						on:keydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleAction();
							}
						}}
						rows="1"
					/>

					<div class="flex mr-2">
						<button
							class="{(prompt !== '' || attachedFile) ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-gray-600 text-gray-400'} transition-all duration-200 rounded-lg p-1 w-8 h-8 flex items-center justify-center {isBlast ? 'blast-effect' : ''}"
							type="submit"
							disabled={prompt === "" && !attachedFile}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
								<path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clip-rule="evenodd" />
							</svg>
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>