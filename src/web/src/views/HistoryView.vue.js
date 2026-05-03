/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, inject, onMounted } from 'vue';
import { useCapturesStore } from '../stores/captures';
import { venuesApi } from '../services/venues';
import { RefreshKey } from '../composables/refreshKey';
const capturesStore = useCapturesStore();
const registerRefresh = inject(RefreshKey);
const venues = ref([]);
const venuesLoading = ref(false);
const activeFilter = ref('all');
const activityFeed = computed(() => {
    const entries = [];
    if (activeFilter.value !== 'venues') {
        for (const c of capturesStore.captures) {
            entries.push({ type: 'capture', id: c.id, timestamp: c.createdAt, data: c });
        }
    }
    if (activeFilter.value !== 'captures') {
        for (const v of venues.value) {
            entries.push({ type: 'venue', id: v.id, timestamp: v.createdAt, data: v });
        }
    }
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return entries;
});
const captureCount = computed(() => capturesStore.captures.length);
const venueCount = computed(() => venues.value.length);
registerRefresh?.(() => loadAll(true));
onMounted(() => loadAll(true));
async function loadAll(reset = false) {
    venuesLoading.value = true;
    try {
        await Promise.all([
            capturesStore.loadCaptures(reset),
            venuesApi.list().then(res => { venues.value = res.data.items; }),
        ]);
    }
    finally {
        venuesLoading.value = false;
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
        case 'processing': return 'Processing';
        case 'failed': return 'Failed';
        default: return 'Pending';
    }
}
function venueStatusColor(status) {
    switch (status) {
        case 'completed': return 'text-green-400';
        case 'processing': return 'text-[#96BEE6]';
        case 'failed': return 'text-red-400';
        default: return 'text-[#96BEE6]';
    }
}
function venueStatusLabel(status) {
    switch (status) {
        case 'completed': return 'Complete';
        case 'processing': return 'Processing';
        case 'failed': return 'Failed';
        default: return 'Manual';
    }
}
function workflowStepIcon(status) {
    switch (status) {
        case 'complete': return '●';
        case 'running': return '◎';
        case 'error': return '✕';
        default: return '○';
    }
}
function workflowStepColor(status) {
    switch (status) {
        case 'complete': return 'text-green-400';
        case 'running': return 'text-[#96BEE6]';
        case 'error': return 'text-red-400';
        default: return 'text-[#4a7aa5]';
    }
}
const expandedVenueId = ref(null);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-4 max-w-lg mx-auto" },
});
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-xl font-semibold mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex gap-2 mb-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
for (const [filter] of __VLS_vFor(['all', 'captures', 'venues'])) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeFilter = filter;
                // @ts-ignore
                [activeFilter,];
            } },
        key: (filter),
        ...{ class: "flex-1 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors" },
        ...{ class: (__VLS_ctx.activeFilter === filter
                ? 'bg-[#1e407c]/30 text-[#96BEE6] border border-[#1e407c]'
                : 'bg-[#0a2a52] text-[#96BEE6] border border-[#1e407c]/50 hover:bg-[#0a2a52]') },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (filter === 'all' ? `All (${__VLS_ctx.captureCount + __VLS_ctx.venueCount})` :
        filter === 'captures' ? `Captures (${__VLS_ctx.captureCount})` :
            `Venues (${__VLS_ctx.venueCount})`);
    // @ts-ignore
    [activeFilter, captureCount, captureCount, venueCount, venueCount,];
}
if ((__VLS_ctx.capturesStore.isLoading || __VLS_ctx.venuesLoading) && !__VLS_ctx.activityFeed.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else if (!__VLS_ctx.activityFeed.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [entry] of __VLS_vFor((__VLS_ctx.activityFeed))) {
        (entry.type + '-' + entry.id);
        if (entry.type === 'capture') {
            let __VLS_0;
            /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
            routerLink;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                to: (`/history/${entry.id}`),
                ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors" },
            }));
            const __VLS_2 = __VLS_1({
                to: (`/history/${entry.id}`),
                ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            const { default: __VLS_5 } = __VLS_3.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-start justify-between mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#1e407c]/30 text-[#96BEE6]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: (__VLS_ctx.captureStatusColor(entry.data.status)) },
                ...{ class: "text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.captureStatusLabel(entry.data.status));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-[#4a7aa5]/60" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            (new Date(entry.timestamp).toLocaleDateString());
            if (entry.data.photos.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex gap-1 mb-2 overflow-x-auto" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
                for (const [photo, i] of __VLS_vFor((entry.data.photos.slice(0, 4)))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                        key: (i),
                        src: (photo),
                        ...{ class: "w-12 h-12 object-cover rounded" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
                    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
                    // @ts-ignore
                    [capturesStore, venuesLoading, activityFeed, activityFeed, activityFeed, captureStatusColor, captureStatusLabel,];
                }
                if (entry.data.photos.length > 4) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-[#96BEE6]/70 text-xs self-center ml-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
                    (entry.data.photos.length - 4);
                }
            }
            if (entry.data.userNote) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-sm text-[#96BEE6] line-clamp-2" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                (entry.data.userNote);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center justify-between mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            if (entry.data.workflowSteps?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-[#4a7aa5]/60" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                (entry.data.workflowSteps.filter(s => s.status === 'complete').length);
                (entry.data.workflowSteps.length);
            }
            if (entry.data.itemIds.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-[#96BEE6]" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                (entry.data.itemIds.length);
            }
            // @ts-ignore
            [];
            var __VLS_3;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!((__VLS_ctx.capturesStore.isLoading || __VLS_ctx.venuesLoading) && !__VLS_ctx.activityFeed.length))
                            return;
                        if (!!(!__VLS_ctx.activityFeed.length))
                            return;
                        if (!!(entry.type === 'capture'))
                            return;
                        entry.data.workflowSteps?.length ? (__VLS_ctx.expandedVenueId = __VLS_ctx.expandedVenueId === entry.id ? null : entry.id) : __VLS_ctx.$router.push(`/venues/${entry.id}`);
                        // @ts-ignore
                        [expandedVenueId, expandedVenueId, $router,];
                    } },
                ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors" },
                ...{ class: (entry.data.workflowSteps?.length ? 'cursor-pointer' : '') },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-start justify-between mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: (__VLS_ctx.venueStatusColor(entry.data.status)) },
                ...{ class: "text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.venueStatusLabel(entry.data.status));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-[#4a7aa5]/60" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            (new Date(entry.timestamp).toLocaleDateString());
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-white font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (entry.data.name);
            if (entry.data.address) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#96BEE6]/70 mt-0.5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
                (entry.data.address);
            }
            if (entry.data.labels?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex flex-wrap gap-1 mt-2" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                for (const [label] of __VLS_vFor((entry.data.labels.slice(0, 3)))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        key: (label),
                        ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#1e407c]/30 text-[#96BEE6]" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]/30']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                    (label);
                    // @ts-ignore
                    [venueStatusColor, venueStatusLabel,];
                }
                if (entry.data.labels.length > 3) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-xs text-[#4a7aa5]/60 self-center" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                    /** @type {__VLS_StyleScopedClasses['self-center']} */ ;
                    (entry.data.labels.length - 3);
                }
            }
            if (entry.data.workflowSteps?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
                if (__VLS_ctx.expandedVenueId === entry.id) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "mt-3 border-t border-[#0a2a52] pt-3" },
                    });
                    /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
                    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-xs text-[#96BEE6]/70 mb-2 font-medium" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                    /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "space-y-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
                    for (const [step] of __VLS_vFor((entry.data.workflowSteps))) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                            key: (step.stepId),
                            ...{ class: "flex items-start gap-2" },
                        });
                        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: (__VLS_ctx.workflowStepColor(step.status)) },
                            ...{ class: "text-sm mt-0.5" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                        /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
                        (__VLS_ctx.workflowStepIcon(step.status));
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                            ...{ class: "min-w-0 flex-1" },
                        });
                        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
                        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                            ...{ class: "text-xs text-white" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                        (step.agentName);
                        if (step.summary) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                                ...{ class: "text-xs text-[#96BEE6]/70 line-clamp-2" },
                            });
                            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                            /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                            (step.summary);
                        }
                        if (step.detail) {
                            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                                ...{ class: "text-xs text-[#4a7aa5]/60 line-clamp-1" },
                            });
                            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                            /** @type {__VLS_StyleScopedClasses['line-clamp-1']} */ ;
                            (step.detail);
                        }
                        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                            ...{ class: "text-xs text-[#4a7aa5]/60" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                        (new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                        // @ts-ignore
                        [expandedVenueId, workflowStepColor, workflowStepIcon,];
                    }
                    if (entry.data.processingError) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                            ...{ class: "mt-2 p-2 bg-red-900/20 border border-red-800/30 rounded-lg" },
                        });
                        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
                        /** @type {__VLS_StyleScopedClasses['bg-red-900/20']} */ ;
                        /** @type {__VLS_StyleScopedClasses['border']} */ ;
                        /** @type {__VLS_StyleScopedClasses['border-red-800/30']} */ ;
                        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                            ...{ class: "text-xs text-red-400" },
                        });
                        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                        (entry.data.processingError);
                    }
                    let __VLS_6;
                    /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
                    routerLink;
                    // @ts-ignore
                    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
                        to: (`/venues/${entry.id}`),
                        ...{ class: "block text-xs text-[#96BEE6] mt-2 hover:text-white" },
                    }));
                    const __VLS_8 = __VLS_7({
                        to: (`/venues/${entry.id}`),
                        ...{ class: "block text-xs text-[#96BEE6] mt-2 hover:text-white" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
                    /** @type {__VLS_StyleScopedClasses['block']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
                    const { default: __VLS_11 } = __VLS_9.slots;
                    // @ts-ignore
                    [];
                    var __VLS_9;
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-xs text-[#4a7aa5]/60 mt-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                    (entry.data.workflowSteps.filter(s => s.status === 'complete').length);
                    (entry.data.workflowSteps.length);
                }
            }
        }
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
