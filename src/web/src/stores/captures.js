import { defineStore } from 'pinia';
import { ref } from 'vue';
import { capturesApi } from '../services/captures';
export const useCapturesStore = defineStore('captures', () => {
    const captures = ref([]);
    const isLoading = ref(false);
    const continuationToken = ref();
    async function loadCaptures(reset = false) {
        if (reset) {
            captures.value = [];
            continuationToken.value = undefined;
        }
        isLoading.value = true;
        try {
            const response = await capturesApi.list(continuationToken.value);
            captures.value.push(...response.data.items);
            continuationToken.value = response.data.continuationToken ?? undefined;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function createCapture(data) {
        const response = await capturesApi.create(data);
        captures.value.unshift(response.data);
        return response.data;
    }
    async function refreshCapture(id) {
        const response = await capturesApi.get(id);
        const index = captures.value.findIndex(c => c.id === id);
        if (index !== -1) {
            captures.value[index] = response.data;
        }
        return response.data;
    }
    return { captures, isLoading, loadCaptures, createCapture, refreshCapture };
});
