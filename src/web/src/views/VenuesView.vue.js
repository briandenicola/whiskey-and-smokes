/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, inject, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVenuesStore } from '../stores/venues';
import { RefreshKey } from '../composables/refreshKey';
import { useBreakpoint } from '../composables/useBreakpoint';
import { useVirtualizer } from '@tanstack/vue-virtual';
import StarRating from '../components/common/StarRating.vue';
import VenueLeaderboard from '../components/venues/VenueLeaderboard.vue';
const router = useRouter();
const venuesStore = useVenuesStore();
const registerRefresh = inject(RefreshKey);
const { isDesktop } = useBreakpoint();
const leaderboardSort = ref('rating');
const showAddForm = ref(false);
const addMode = ref('manual');
const newName = ref('');
const newType = ref('restaurant');
const newAddress = ref('');
const newWebsite = ref('');
const newUrl = ref('');
const isAdding = ref(false);
const urlError = ref('');
const venueTypeOptions = [
    { label: 'Bar', value: 'bar' },
    { label: 'Lounge', value: 'lounge' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Cafe', value: 'cafe' },
    { label: 'Other', value: 'other' },
];
registerRefresh?.(async () => {
    await venuesStore.loadVenues(undefined, true);
});
onMounted(() => {
    venuesStore.loadVenues(undefined, true);
});
const groupedVenues = computed(() => {
    const venues = venuesStore.venues;
    // Separate venues with "to-try" label
    const toTryVenues = venues.filter(v => v.labels?.some(l => l.toLowerCase() === 'to-try'));
    const regularVenues = venues.filter(v => !v.labels?.some(l => l.toLowerCase() === 'to-try'));
    const groups = [];
    // Helper to create groups by type
    const createTypeGroups = (venueList, prefix) => {
        const typeMap = new Map();
        venueList.forEach(venue => {
            const type = venue.type.toLowerCase();
            if (!typeMap.has(type)) {
                typeMap.set(type, []);
            }
            typeMap.get(type).push(venue);
        });
        // Sort each type group by rating (descending), then by updatedAt
        typeMap.forEach((typeVenues) => {
            typeVenues.sort((a, b) => {
                const ra = a.rating ?? 0;
                const rb = b.rating ?? 0;
                if (rb !== ra)
                    return rb - ra;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
        });
        // Create groups in specific order
        const typeOrder = ['bar', 'lounge', 'restaurant', 'cafe', 'other'];
        typeOrder.forEach(type => {
            if (typeMap.has(type) && typeMap.get(type).length > 0) {
                const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                groups.push({
                    title: prefix ? `${prefix} - ${typeName}` : typeName,
                    venues: typeMap.get(type)
                });
            }
        });
    };
    // Add all "to-try" venues as a single group, sorted by rating then date
    if (toTryVenues.length > 0) {
        const sorted = [...toTryVenues].sort((a, b) => {
            const ra = a.rating ?? 0;
            const rb = b.rating ?? 0;
            if (rb !== ra)
                return rb - ra;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        groups.push({ title: 'To Try', venues: sorted });
    }
    // Add regular venue groups
    if (regularVenues.length > 0) {
        createTypeGroups(regularVenues, '');
    }
    return groups;
});
const sortedVenues = computed(() => {
    // Flatten grouped venues for leaderboard
    return groupedVenues.value.flatMap(g => g.venues);
});
const leaderboardVenues = computed(() => {
    return sortedVenues.value.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        rating: v.rating ?? null,
        itemCount: 0,
    }));
});
const scrollContainerRef = ref(null);
const virtualItems = computed(() => {
    const items = [];
    groupedVenues.value.forEach(group => {
        items.push({ type: 'header', groupTitle: group.title });
        group.venues.forEach(venue => {
            items.push({ type: 'venue', venue });
        });
    });
    return items;
});
const virtualizer = useVirtualizer(computed(() => ({
    count: virtualItems.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: (index) => virtualItems.value[index].type === 'header' ? 40 : 100,
    overscan: 5,
    gap: 12,
})));
async function addVenue() {
    if (!newName.value.trim())
        return;
    isAdding.value = true;
    try {
        const venue = await venuesStore.createVenue({
            name: newName.value.trim(),
            type: newType.value,
            address: newAddress.value.trim() || undefined,
            website: newWebsite.value.trim() || undefined,
        });
        resetForm();
        router.push(`/venues/${venue.id}`);
    }
    finally {
        isAdding.value = false;
    }
}
async function addVenueFromUrl() {
    const url = newUrl.value.trim();
    if (!url)
        return;
    urlError.value = '';
    try {
        new URL(url);
    }
    catch {
        urlError.value = 'Please enter a valid URL';
        return;
    }
    isAdding.value = true;
    try {
        const venue = await venuesStore.createVenueFromUrl(url);
        resetForm();
        router.push(`/venues/${venue.id}`);
    }
    catch {
        urlError.value = 'Failed to process URL. Please try again or add manually.';
    }
    finally {
        isAdding.value = false;
    }
}
function resetForm() {
    newName.value = '';
    newAddress.value = '';
    newWebsite.value = '';
    newUrl.value = '';
    urlError.value = '';
    showAddForm.value = false;
    addMode.value = 'manual';
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-4 mx-auto" },
    ...{ class: (__VLS_ctx.isDesktop ? 'max-w-6xl' : 'max-w-lg') },
});
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-xl font-bold text-white" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAddForm = !__VLS_ctx.showAddForm;
            // @ts-ignore
            [isDesktop, showAddForm, showAddForm,];
        } },
    ...{ class: "text-[#96BEE6] hover:text-white transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    ...{ class: "w-5 h-5" },
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    'stroke-width': "2",
});
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    d: "M12 4v16m8-8H4",
});
if (__VLS_ctx.venuesStore.isLoading && !__VLS_ctx.groupedVenues.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else if (!__VLS_ctx.groupedVenues.length) {
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
        ref: "scrollContainerRef",
        ...{ class: "virtual-list-container overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['virtual-list-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ style: ({ height: `${__VLS_ctx.virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }) },
    });
    for (const [row] of __VLS_vFor((__VLS_ctx.virtualizer.getVirtualItems()))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (row.index),
            'data-index': (row.index),
            ref: ((el) => { if (el?.$el || el)
                __VLS_ctx.virtualizer.measureElement(el?.$el ?? el); }),
            ...{ style: ({ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }) },
        });
        if (__VLS_ctx.virtualItems[row.index].type === 'header') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "text-sm font-semibold text-[#96BEE6] uppercase tracking-wide" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            (__VLS_ctx.virtualItems[row.index].groupTitle);
        }
        else if (__VLS_ctx.virtualItems[row.index].venue) {
            let __VLS_0;
            /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
            routerLink;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                to: (`/venues/${__VLS_ctx.virtualItems[row.index].venue.id}`),
                ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors" },
            }));
            const __VLS_2 = __VLS_1({
                to: (`/venues/${__VLS_ctx.virtualItems[row.index].venue.id}`),
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
                ...{ class: "flex items-start gap-3" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            if (__VLS_ctx.virtualItems[row.index].venue.photoUrls.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (__VLS_ctx.virtualItems[row.index].venue.photoUrls[0]),
                    ...{ class: "w-16 h-16 object-cover rounded-lg shrink-0" },
                    loading: "lazy",
                });
                /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "w-16 h-16 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center" },
                });
                /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    ...{ class: "w-6 h-6 text-[#4a7aa5]/60" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                /** @type {__VLS_StyleScopedClasses['w-6']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-6']} */ ;
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
                ...{ class: "flex items-center gap-2 mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6] capitalize" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
            (__VLS_ctx.virtualItems[row.index].venue.type);
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "font-medium text-white truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (__VLS_ctx.virtualItems[row.index].venue.name);
            if (__VLS_ctx.virtualItems[row.index].venue.address) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-sm text-[#96BEE6]/70 truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (__VLS_ctx.virtualItems[row.index].venue.address);
            }
            if (__VLS_ctx.virtualItems[row.index].venue.rating) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mt-1" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                const __VLS_6 = StarRating;
                // @ts-ignore
                const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
                    rating: (__VLS_ctx.virtualItems[row.index].venue.rating),
                    size: "sm",
                }));
                const __VLS_8 = __VLS_7({
                    rating: (__VLS_ctx.virtualItems[row.index].venue.rating),
                    size: "sm",
                }, ...__VLS_functionalComponentArgsRest(__VLS_7));
            }
            if (__VLS_ctx.virtualItems[row.index].venue.labels?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex flex-wrap gap-1 mt-1.5" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
                for (const [label] of __VLS_vFor((__VLS_ctx.virtualItems[row.index].venue.labels.slice(0, 3)))) {
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
                    [venuesStore, groupedVenues, groupedVenues, virtualizer, virtualizer, virtualizer, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems, virtualItems,];
                }
                if (__VLS_ctx.virtualItems[row.index].venue.labels.length > 3) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-[10px] text-[#4a7aa5]/60" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                    (__VLS_ctx.virtualItems[row.index].venue.labels.length - 3);
                }
            }
            // @ts-ignore
            [virtualItems, virtualItems,];
            var __VLS_3;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.isDesktop && __VLS_ctx.sortedVenues.length) {
    const __VLS_11 = VenueLeaderboard;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        ...{ 'onSort': {} },
        ...{ 'onSelect': {} },
        venues: (__VLS_ctx.leaderboardVenues),
        sortBy: (__VLS_ctx.leaderboardSort),
        ...{ class: "mt-6" },
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onSort': {} },
        ...{ 'onSelect': {} },
        venues: (__VLS_ctx.leaderboardVenues),
        sortBy: (__VLS_ctx.leaderboardSort),
        ...{ class: "mt-6" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_16;
    const __VLS_17 = ({ sort: {} },
        { onSort: (...[$event]) => {
                if (!(__VLS_ctx.isDesktop && __VLS_ctx.sortedVenues.length))
                    return;
                __VLS_ctx.leaderboardSort = $event;
                // @ts-ignore
                [isDesktop, sortedVenues, leaderboardVenues, leaderboardSort, leaderboardSort,];
            } });
    const __VLS_18 = ({ select: {} },
        { onSelect: ((id) => __VLS_ctx.router.push(`/venues/${id}`)) });
    /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
    var __VLS_14;
    var __VLS_15;
}
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    to: "body",
}));
const __VLS_21 = __VLS_20({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    name: "fade",
}));
const __VLS_27 = __VLS_26({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
if (__VLS_ctx.showAddForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddForm))
                    return;
                __VLS_ctx.resetForm();
                // @ts-ignore
                [showAddForm, router, resetForm,];
            } },
        ...{ class: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-[#041e3e] border border-[#1e407c] rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-lg font-semibold text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddForm))
                    return;
                __VLS_ctx.resetForm();
                // @ts-ignore
                [resetForm,];
            } },
        ...{ class: "text-[#4a7aa5] hover:text-white p-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-5 h-5" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        d: "M6 18L18 6M6 6l12 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex rounded-lg bg-[#0a2a52] p-0.5" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddForm))
                    return;
                __VLS_ctx.addMode = 'manual';
                // @ts-ignore
                [addMode,];
            } },
        ...{ class: ([
                'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                __VLS_ctx.addMode === 'manual' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80'
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAddForm))
                    return;
                __VLS_ctx.addMode = 'url';
                // @ts-ignore
                [addMode, addMode,];
            } },
        ...{ class: ([
                'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                __VLS_ctx.addMode === 'url' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white/80'
            ]) },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    if (__VLS_ctx.addMode === 'manual') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            placeholder: "Name (required)",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.newName);
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.newType),
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1e407c] appearance-none" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
        for (const [opt] of __VLS_vFor((__VLS_ctx.venueTypeOptions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (opt.value),
                value: (opt.value),
            });
            (opt.label);
            // @ts-ignore
            [addMode, addMode, newName, newType, venueTypeOptions,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            placeholder: "Address (optional)",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.newAddress);
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            placeholder: "Website (optional)",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.newWebsite);
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.addVenue) },
            disabled: (__VLS_ctx.isAdding || !__VLS_ctx.newName.trim()),
            ...{ class: "w-full bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#0a2a52] disabled:text-[#4a7aa5]/60 text-white py-3 rounded-xl font-medium transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:text-[#4a7aa5]/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (__VLS_ctx.isAdding ? 'Adding...' : 'Add Venue');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-[#5a8ab5]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            placeholder: "https://maps.apple.com/...",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.newUrl);
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        if (__VLS_ctx.urlError) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-red-400" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            (__VLS_ctx.urlError);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.addVenueFromUrl) },
            disabled: (__VLS_ctx.isAdding || !__VLS_ctx.newUrl.trim()),
            ...{ class: "w-full bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#0a2a52] disabled:text-[#4a7aa5]/60 text-white py-3 rounded-xl font-medium transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:text-[#4a7aa5]/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (__VLS_ctx.isAdding ? 'Extracting...' : 'Extract Venue');
    }
}
// @ts-ignore
[newName, newAddress, newWebsite, addVenue, isAdding, isAdding, isAdding, isAdding, newUrl, newUrl, urlError, urlError, addVenueFromUrl,];
var __VLS_28;
// @ts-ignore
[];
var __VLS_22;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
