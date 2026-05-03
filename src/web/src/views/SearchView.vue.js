/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Fuse from 'fuse.js';
import { itemsApi } from '../services/items';
import { venuesApi } from '../services/venues';
import StarRating from '../components/common/StarRating.vue';
const router = useRouter();
const query = ref('');
const isLoading = ref(false);
const hasSearched = ref(false);
const allItems = ref([]);
const allVenues = ref([]);
const activeTab = ref('all');
let itemsFuse = null;
let venuesFuse = null;
const itemFuseOptions = {
    keys: [
        { name: 'name', weight: 0.3 },
        { name: 'brand', weight: 0.15 },
        { name: 'type', weight: 0.1 },
        { name: 'category', weight: 0.1 },
        { name: 'venue.name', weight: 0.1 },
        { name: 'userNotes', weight: 0.1 },
        { name: 'aiSummary', weight: 0.05 },
        { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
};
const venueFuseOptions = {
    keys: [
        { name: 'name', weight: 0.3 },
        { name: 'type', weight: 0.1 },
        { name: 'address', weight: 0.15 },
        { name: 'labels', weight: 0.25 },
        { name: 'website', weight: 0.05 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
};
async function loadData() {
    if (allItems.value.length && allVenues.value.length)
        return;
    isLoading.value = true;
    try {
        const [itemsResp, venuesResp] = await Promise.all([
            itemsApi.list(undefined, undefined, undefined),
            venuesApi.list(),
        ]);
        allItems.value = itemsResp.data.items;
        allVenues.value = venuesResp.data.items;
        // Load all pages for items
        let token = itemsResp.data.continuationToken;
        while (token) {
            const more = await itemsApi.list(undefined, token, undefined);
            allItems.value.push(...more.data.items);
            token = more.data.continuationToken ?? undefined;
        }
        // Load all pages for venues
        let vToken = venuesResp.data.continuationToken;
        while (vToken) {
            const more = await venuesApi.list(undefined, vToken);
            allVenues.value.push(...more.data.items);
            vToken = more.data.continuationToken ?? undefined;
        }
        itemsFuse = new Fuse(allItems.value, itemFuseOptions);
        venuesFuse = new Fuse(allVenues.value, venueFuseOptions);
    }
    finally {
        isLoading.value = false;
    }
}
loadData();
const itemResults = computed(() => {
    if (!query.value.trim() || !itemsFuse)
        return [];
    return itemsFuse.search(query.value.trim(), { limit: 20 });
});
const venueResults = computed(() => {
    if (!query.value.trim() || !venuesFuse)
        return [];
    return venuesFuse.search(query.value.trim(), { limit: 20 });
});
const totalResults = computed(() => itemResults.value.length + venueResults.value.length);
const displayedItems = computed(() => activeTab.value === 'venues' ? [] : itemResults.value);
const displayedVenues = computed(() => activeTab.value === 'items' ? [] : venueResults.value);
let searchTimeout;
watch(query, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        hasSearched.value = query.value.trim().length > 0;
    }, 150);
});
onBeforeUnmount(() => {
    clearTimeout(searchTimeout);
});
function navigateToItem(item) {
    router.push(`/items/${item.id}`);
}
function navigateToVenue(venue) {
    router.push(`/venues/${venue.id}`);
}
const searchInput = ref(null);
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
    ...{ class: "text-xl font-bold text-white mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative mb-4" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    ...{ class: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#96BEE6]/70" },
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    'stroke-width': "2",
});
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-3.5']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ref: "searchInput",
    type: "search",
    placeholder: "Search items, venues, labels...",
    ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
    autofocus: true,
});
(__VLS_ctx.query);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-11']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
if (__VLS_ctx.query) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.query))
                    return;
                __VLS_ctx.query = '';
                __VLS_ctx.searchInput?.focus();
                // @ts-ignore
                [query, query, query, searchInput,];
            } },
        ...{ class: "absolute right-3 top-1/2 -translate-y-1/2 text-[#96BEE6]/70 hover:text-white/80" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white/80']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-4 h-4" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        d: "M6 18L18 6M6 6l12 12",
    });
}
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else if (__VLS_ctx.hasSearched) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex rounded-lg bg-[#0a2a52] p-0.5 mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.hasSearched))
                    return;
                __VLS_ctx.activeTab = 'all';
                // @ts-ignore
                [isLoading, hasSearched, activeTab,];
            } },
        ...{ class: (['flex-1 py-1.5 text-xs font-medium rounded-md transition-colors', __VLS_ctx.activeTab === 'all' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80']) },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.totalResults);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.hasSearched))
                    return;
                __VLS_ctx.activeTab = 'items';
                // @ts-ignore
                [activeTab, activeTab, totalResults,];
            } },
        ...{ class: (['flex-1 py-1.5 text-xs font-medium rounded-md transition-colors', __VLS_ctx.activeTab === 'items' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80']) },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.itemResults.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isLoading))
                    return;
                if (!(__VLS_ctx.hasSearched))
                    return;
                __VLS_ctx.activeTab = 'venues';
                // @ts-ignore
                [activeTab, activeTab, itemResults,];
            } },
        ...{ class: (['flex-1 py-1.5 text-xs font-medium rounded-md transition-colors', __VLS_ctx.activeTab === 'venues' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80']) },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    (__VLS_ctx.venueResults.length);
    if (!__VLS_ctx.totalResults) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[#96BEE6]/70 text-center py-12" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (__VLS_ctx.query);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-2" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
    if (__VLS_ctx.displayedVenues.length) {
        if (__VLS_ctx.activeTab === 'all') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#96BEE6]/70 uppercase tracking-wider mt-2 mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        }
        for (const [result] of __VLS_vFor((__VLS_ctx.displayedVenues))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isLoading))
                            return;
                        if (!(__VLS_ctx.hasSearched))
                            return;
                        if (!(__VLS_ctx.displayedVenues.length))
                            return;
                        __VLS_ctx.navigateToVenue(result.item);
                        // @ts-ignore
                        [query, activeTab, activeTab, totalResults, venueResults, displayedVenues, displayedVenues, navigateToVenue,];
                    } },
                key: ('v-' + result.item.id),
                ...{ class: "w-full text-left bg-[#041e3e] border border-[#0a2a52] rounded-xl p-3 hover:border-[#1e407c]/50 transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-start gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            if (result.item.photoUrls.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (result.item.photoUrls[0]),
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
                    ...{ class: "w-12 h-12 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center" },
                });
                /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    ...{ class: "w-5 h-5 text-[#4a7aa5]/60" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                });
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
                ...{ class: "text-[10px] px-1.5 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6] capitalize" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
            (result.item.type);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] text-[#1e407c]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#1e407c]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-medium text-white truncate text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (result.item.name);
            if (result.item.address) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#96BEE6]/70 truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (result.item.address);
            }
            if (result.item.labels?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex flex-wrap gap-1 mt-1" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                for (const [label] of __VLS_vFor((result.item.labels.slice(0, 3)))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        key: (label),
                        ...{ class: "text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e407c]/30 text-[#96BEE6]/80" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]/30']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
                    (label);
                    // @ts-ignore
                    [];
                }
            }
            if (result.item.rating) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                const __VLS_0 = StarRating;
                // @ts-ignore
                const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                    rating: (result.item.rating),
                    size: "sm",
                }));
                const __VLS_2 = __VLS_1({
                    rating: (result.item.rating),
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            }
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.displayedItems.length) {
        if (__VLS_ctx.activeTab === 'all') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#96BEE6]/70 uppercase tracking-wider mt-3 mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        }
        for (const [result] of __VLS_vFor((__VLS_ctx.displayedItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isLoading))
                            return;
                        if (!(__VLS_ctx.hasSearched))
                            return;
                        if (!(__VLS_ctx.displayedItems.length))
                            return;
                        __VLS_ctx.navigateToItem(result.item);
                        // @ts-ignore
                        [activeTab, displayedItems, displayedItems, navigateToItem,];
                    } },
                key: ('i-' + result.item.id),
                ...{ class: "w-full text-left bg-[#041e3e] border border-[#0a2a52] rounded-xl p-3 hover:border-[#1e407c]/50 transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-start gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            if (result.item.photoUrls?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (result.item.photoUrls[0]),
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
                    ...{ class: "w-12 h-12 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center" },
                });
                /** @type {__VLS_StyleScopedClasses['w-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-12']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-xs text-[#96BEE6]/70 capitalize" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
                (result.item.type.slice(0, 3));
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
                ...{ class: "text-[10px] px-1.5 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6] capitalize" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
            (result.item.type);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                ...{ class: "font-medium text-white truncate text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (result.item.name);
            if (result.item.brand) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#96BEE6]/70 truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (result.item.brand);
            }
            if (result.item.venue?.name) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#4a7aa5]/60 truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (result.item.venue.name);
            }
            if (result.item.userRating) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                const __VLS_5 = StarRating;
                // @ts-ignore
                const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                    rating: (result.item.userRating),
                    size: "sm",
                }));
                const __VLS_7 = __VLS_6({
                    rating: (result.item.userRating),
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            }
            // @ts-ignore
            [];
        }
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[#96BEE6]/70 text-center py-12 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-xs space-y-1 text-[#4a7aa5]/60" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
