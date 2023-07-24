import { writable } from 'svelte/store';

export const outputStore = writable<Array<{head: string, body: any}>>([]);