/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { capturesApi } from '../services/captures';
import { itemsApi } from '../services/items';
import { RefreshKey } from '../composables/refreshKey';
const route = useRoute();
const router = useRouter();
const registerRefresh = inject(RefreshKey);
const capture = ref(null);
const items = ref([]);
const isLoading = ref(true);
const isReprocessing = ref(false);
let pollInterval = null;
const fallbackAgentNames = ['Local Extraction', 'Fallback'];
function isAiStep(step) {
    return !fallbackAgentNames.includes(step.agentName);
}
const usedAi = computed(() => {
    if (!capture.value?.workflowSteps.length)
        return false;
    return capture.value.workflowSteps.some(s => isAiStep(s));
});
const canReprocess = computed(() => {
    if (!capture.value)
        return false;
    return capture.value.status === 'completed' || capture.value.status === 'failed';
});
registerRefresh?.(async () => { await loadCapture(); });
onMounted(async () => {
    await loadCapture();
    if (capture.value && capture.value.status === 'processing') {
        startPolling();
    }
});
onUnmounted(() => {
    if (pollInterval)
        clearInterval(pollInterval);
});
async function loadCapture() {
    try {
        const { data } = await capturesApi.get(route.params.id);
        capture.value = data;
        if (data.status === 'completed' && data.itemIds.length > 0) {
            const loaded = [];
            for (const itemId of data.itemIds) {
                try {
                    const { data: item } = await itemsApi.get(itemId);
                    loaded.push(item);
                }
                catch { /* item may not exist yet */ }
            }
            items.value = loaded;
        }
        else {
            items.value = [];
        }
    }
    catch {
        capture.value = null;
    }
    finally {
        isLoading.value = false;
    }
}
function startPolling() {
    if (pollInterval)
        clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
        await loadCapture();
        if (capture.value && capture.value.status !== 'processing') {
            if (pollInterval)
                clearInterval(pollInterval);
            pollInterval = null;
        }
    }, 3000);
}
async function reprocess() {
    if (!capture.value || isReprocessing.value)
        return;
    isReprocessing.value = true;
    try {
        const { data } = await capturesApi.reprocess(capture.value.id);
        capture.value = data;
        items.value = [];
        startPolling();
    }
    finally {
        isReprocessing.value = false;
    }
}
function statusLabel(status) {
    switch (status) {
        case 'complete': return 'Complete';
        case 'running': return 'Running';
        case 'error': return 'Error';
        default: return 'Pending';
    }
}
function statusColor(status) {
    switch (status) {
        case 'complete': return 'text-green-400 border-green-800';
        case 'running': return 'text-[#96BEE6] border-[#1e407c]/50';
        case 'error': return 'text-red-400 border-red-800';
        default: return 'text-[#96BEE6]/70 border-[#0a2a52]';
    }
}
function dotColor(status) {
    switch (status) {
        case 'complete': return 'bg-green-500';
        case 'running': return 'bg-[#96BEE6] animate-pulse';
        case 'error': return 'bg-red-500';
        default: return 'bg-[#1e407c]';
    }
}
function captureStatusColor(status) {
    switch (status) {
        case 'completed': return 'text-green-400';
        case 'processing': return 'text-[#96BEE6]';
        case 'failed': return 'text-red-400';
        default: return 'text-[#96BEE6]';
    }
}
function captureStatusLabel(status) {
    switch (status) {
        case 'completed': return 'Complete';
        case 'processing': return 'Processing...';
        case 'failed': return 'Failed';
        default: return 'Pending';
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else if (!__VLS_ctx.capture) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(!__VLS_ctx.capture))
                    return;
                __VLS_ctx.router.push('/history');
                // @ts-ignore
                [isLoading, capture, router,];
            } },
        ...{ class: "text-[#96BEE6] mt-2 min-h-[44px] min-w-[44px] px-3 py-2 hover:opacity-80 transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-80']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 max-w-lg mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!!(!__VLS_ctx.capture))
                    return;
                __VLS_ctx.router.push('/history');
                // @ts-ignore
                [router,];
            } },
        ...{ class: "text-[#96BEE6] hover:text-white hover:opacity-80 text-sm mb-4 min-h-[44px] min-w-[44px] px-3 py-2 transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-80']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    if (__VLS_ctx.capture.photos.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4 -mx-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 overflow-x-auto px-4 pb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
        for (const [url, i] of __VLS_vFor((__VLS_ctx.capture.photos))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                key: (i),
                src: (url),
                ...{ class: "h-40 object-cover rounded-xl" },
            });
            /** @type {__VLS_StyleScopedClasses['h-40']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            // @ts-ignore
            [capture, capture,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (__VLS_ctx.captureStatusColor(__VLS_ctx.capture.status)) },
        ...{ class: "text-sm font-medium" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    (__VLS_ctx.captureStatusLabel(__VLS_ctx.capture.status));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    if (__VLS_ctx.canReprocess) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.reprocess) },
            disabled: (__VLS_ctx.isReprocessing),
            ...{ class: "text-xs px-3 py-1.5 rounded-lg bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#1e407c] disabled:text-[#96BEE6]/70 text-white transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (__VLS_ctx.isReprocessing ? 'Reprocessing...' : 'Rerun AI Workflow');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-[#4a7aa5]/60" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
    (new Date(__VLS_ctx.capture.createdAt).toLocaleString());
    if (__VLS_ctx.capture.userNote) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-[#96BEE6] mb-4 italic" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['italic']} */ ;
        (__VLS_ctx.capture.userNote);
    }
    if (__VLS_ctx.capture.workflowSteps.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-sm font-medium text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        (__VLS_ctx.usedAi ? 'AI Agent Workflow' : 'Processing Workflow');
        if (__VLS_ctx.usedAi) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#4a7aa5]/60 mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-yellow-600 mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-yellow-600']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute left-3 top-3 bottom-3 w-0.5 bg-[#0a2a52]" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-0.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        for (const [step, i] of __VLS_vFor((__VLS_ctx.capture.workflowSteps))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (i),
                ...{ class: "relative pl-10 pb-4 last:pb-0" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['pl-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['last:pb-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute left-1.5 top-1.5 w-3 h-3 rounded-full" },
                ...{ class: (__VLS_ctx.dotColor(step.status)) },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-[#041e3e] border rounded-xl p-3" },
                ...{ class: (__VLS_ctx.statusColor(step.status)) },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" },
                ...{ class: (__VLS_ctx.isAiStep(step)
                        ? 'bg-[#1e407c]/40 text-[#96BEE6] border border-[#1e407c]/50'
                        : 'bg-[#0a2a52] text-[#96BEE6]/70 border border-[#1e407c]/50') },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            (__VLS_ctx.isAiStep(step) ? 'AI Agent' : 'Local');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-sm font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (step.agentName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs" },
                ...{ class: (__VLS_ctx.statusColor(step.status)) },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.statusLabel(step.status));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-[#4a7aa5]/40" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/40']} */ ;
            (step.stepId);
            if (step.summary) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#96BEE6] leading-relaxed" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
                (step.summary);
            }
            if (step.detail && step.detail !== step.summary) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.details, __VLS_intrinsics.details)({
                    ...{ class: "mt-2" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.summary, __VLS_intrinsics.summary)({
                    ...{ class: "text-xs text-[#4a7aa5]/60 cursor-pointer hover:text-[#96BEE6]" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-[#96BEE6]']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({
                    ...{ class: "mt-2 text-xs text-[#96BEE6]/70 bg-[#001E44] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#001E44]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
                /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['max-h-48']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
                (step.detail);
            }
            // @ts-ignore
            [capture, capture, capture, capture, capture, capture, capture, captureStatusColor, captureStatusLabel, canReprocess, reprocess, isReprocessing, isReprocessing, usedAi, usedAi, dotColor, statusColor, statusColor, isAiStep, isAiStep, statusLabel,];
        }
    }
    if (__VLS_ctx.capture.processingError) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-red-950/30 border border-red-900 rounded-xl p-3 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-red-950/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-900']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs font-medium text-red-400 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-red-400/80" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400/80']} */ ;
        (__VLS_ctx.capture.processingError);
    }
    if (__VLS_ctx.items.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-sm font-medium text-[#96BEE6] mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.items))) {
            let __VLS_0;
            /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
            routerLink;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                key: (item.id),
                to: (`/items/${item.id}`),
                ...{ class: "block bg-[#041e3e] border border-[#0a2a52] hover:border-[#1e407c]/50 rounded-xl p-3 transition-colors" },
            }));
            const __VLS_2 = __VLS_1({
                key: (item.id),
                to: (`/items/${item.id}`),
                ...{ class: "block bg-[#041e3e] border border-[#0a2a52] hover:border-[#1e407c]/50 rounded-xl p-3 transition-colors" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            const { default: __VLS_5 } = __VLS_3.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            if (item.photoUrls.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (item.photoUrls[0]),
                    ...{ class: "w-12 h-12 object-cover rounded-lg shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "w-12 h-12 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center text-xs text-[#96BEE6]/70 uppercase" },
                });
                /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                (item.type);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2 mb-0.5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            (item.type);
            if (item.aiConfidence) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-[#4a7aa5]/60" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                (Math.round(item.aiConfidence * 100));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-medium text-white truncate text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (item.name);
            if (item.brand) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#96BEE6]/70 truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (item.brand);
                (item.category ? `/ ${item.category}` : '');
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[#4a7aa5]/60 text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            // @ts-ignore
            [capture, capture, items, items,];
            var __VLS_3;
            // @ts-ignore
            [];
        }
    }
    else if (__VLS_ctx.capture.status === 'processing') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-6" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "inline-block w-5 h-5 border-2 border-[#1e407c] border-t-[#96BEE6] rounded-full animate-spin mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]/70 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
}
// @ts-ignore
[capture,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
