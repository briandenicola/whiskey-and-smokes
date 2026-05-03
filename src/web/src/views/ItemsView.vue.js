/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, inject, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useAuthStore } from '../stores/auth';
import { RefreshKey } from '../composables/refreshKey';
import { getErrorMessage } from '../services/errors';
import { useVirtualizer } from '@tanstack/vue-virtual';
import StarRating from '../components/common/StarRating.vue';
import { useBreakpoint } from '../composables/useBreakpoint';
import FilterSidebar from '../components/collection/FilterSidebar.vue';
import CollectionGrid from '../components/collection/CollectionGrid.vue';
import DetailPanel from '../components/collection/DetailPanel.vue';
const { isDesktop } = useBreakpoint();
const router = useRouter();
const itemsStore = useItemsStore();
const auth = useAuthStore();
const defaultFilter = auth.user?.preferences?.collectionFilter || undefined;
// Initialize store state from user preferences if not already set
if (!itemsStore.activeFilter && defaultFilter) {
    itemsStore.activeFilter = defaultFilter;
}
const activeFilter = computed({
    get: () => itemsStore.activeFilter,
    set: (v) => { itemsStore.activeFilter = v; }
});
const activeTab = computed({
    get: () => itemsStore.activeTab,
    set: (v) => { itemsStore.activeTab = v; }
});
const activeSort = ref(auth.user?.preferences?.collectionSort || 'rating');
const registerRefresh = inject(RefreshKey);
// Wishlist add form
const showAddForm = ref(false);
const showSortMenu = ref(false);
const showFilterMenu = ref(false);
const newName = ref('');
const newType = ref('whiskey');
const newBrand = ref('');
const newNotes = ref('');
const isAdding = ref(false);
const newUrl = ref('');
const isExtractingUrl = ref(false);
const urlError = ref('');
const sortOptions = [
    { label: 'Rating', value: 'rating' },
    { label: 'Added', value: 'createdAt' },
    { label: 'Updated', value: 'updatedAt' },
];
registerRefresh?.(async () => {
    if (activeTab.value === 'wishlist') {
        await itemsStore.loadWishlist(activeFilter.value, true);
    }
    else {
        await itemsStore.loadItems(activeFilter.value, true);
    }
});
const typeFilters = [
    { label: 'All', value: undefined },
    { label: 'Whiskey', value: 'whiskey' },
    { label: 'Wine', value: 'wine' },
    { label: 'Cocktail', value: 'cocktail' },
    { label: 'Vodka', value: 'vodka' },
    { label: 'Gin', value: 'gin' },
    { label: 'Espresso', value: 'espresso' },
    { label: 'Latte', value: 'latte' },
    { label: 'Cappuccino', value: 'cappuccino' },
    { label: 'Cold Brew', value: 'cold-brew' },
    { label: 'Pour Over', value: 'pour-over' },
    { label: 'Coffee', value: 'coffee' },
    { label: 'Cigar', value: 'cigar' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Custom', value: 'custom' },
];
const typeOptions = [
    { label: 'Whiskey', value: 'whiskey' },
    { label: 'Wine', value: 'wine' },
    { label: 'Cocktail', value: 'cocktail' },
    { label: 'Vodka', value: 'vodka' },
    { label: 'Gin', value: 'gin' },
    { label: 'Espresso', value: 'espresso' },
    { label: 'Latte', value: 'latte' },
    { label: 'Cappuccino', value: 'cappuccino' },
    { label: 'Cold Brew', value: 'cold-brew' },
    { label: 'Pour Over', value: 'pour-over' },
    { label: 'Coffee', value: 'coffee' },
    { label: 'Cigar', value: 'cigar' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Custom', value: 'custom' },
];
const activeFilterLabel = computed(() => typeFilters.find(f => f.value === activeFilter.value)?.label ?? 'All');
function setFilter(value) {
    activeFilter.value = value;
    if (activeTab.value === 'wishlist') {
        itemsStore.loadWishlist(value, true);
    }
    else {
        itemsStore.loadItems(value, true);
    }
}
function switchTab(tab) {
    activeTab.value = tab;
    activeFilter.value = defaultFilter;
    if (tab === 'wishlist') {
        itemsStore.loadWishlist(defaultFilter, true);
    }
    else {
        itemsStore.loadItems(defaultFilter, true);
    }
}
async function addWishlistItem() {
    if (!newName.value.trim())
        return;
    isAdding.value = true;
    try {
        await itemsStore.createWishlistItem({
            name: newName.value.trim(),
            type: newType.value,
            brand: newBrand.value.trim() || undefined,
            notes: newNotes.value.trim() || undefined,
        });
        newName.value = '';
        newBrand.value = '';
        newNotes.value = '';
        showAddForm.value = false;
    }
    finally {
        isAdding.value = false;
    }
}
async function addWishlistFromUrl() {
    if (!newUrl.value.trim())
        return;
    isExtractingUrl.value = true;
    urlError.value = '';
    try {
        await itemsStore.createWishlistFromUrl(newUrl.value.trim());
        newUrl.value = '';
        showAddForm.value = false;
    }
    catch (e) {
        urlError.value = getErrorMessage(e, 'Failed to submit URL');
    }
    finally {
        isExtractingUrl.value = false;
    }
}
async function convertItem(id) {
    const item = await itemsStore.convertWishlistItem(id);
    router.push(`/items/${item.id}`);
}
async function deleteItem(id) {
    await itemsStore.deleteItem(id);
}
const displayItems = computed(() => {
    const source = activeTab.value === 'wishlist' ? itemsStore.wishlistItems : itemsStore.items;
    const sorted = [...source];
    const sort = activeSort.value;
    sorted.sort((a, b) => {
        if (sort === 'rating') {
            const ra = a.userRating ?? 0;
            const rb = b.userRating ?? 0;
            if (rb !== ra)
                return rb - ra;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sort === 'updatedAt') {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        // createdAt (default)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted;
});
const scrollContainerRef = ref(null);
const virtualizer = useVirtualizer(computed(() => ({
    count: displayItems.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => activeTab.value === 'wishlist' ? 140 : 100,
    overscan: 5,
    gap: 12,
})));
watch([activeTab, activeFilter], () => {
    virtualizer.value.scrollToOffset(0);
});
const isLoadingList = computed(() => activeTab.value === 'wishlist' ? itemsStore.isLoadingWishlist : itemsStore.isLoading);
function closeSortMenu(e) {
    const target = e.target;
    if (!target.closest('.sort-dropdown')) {
        showSortMenu.value = false;
    }
    if (!target.closest('.filter-dropdown')) {
        showFilterMenu.value = false;
    }
}
onMounted(() => {
    if (activeTab.value === 'wishlist') {
        itemsStore.loadWishlist(activeFilter.value, true);
    }
    else {
        itemsStore.loadItems(activeFilter.value, true);
    }
    document.addEventListener('click', closeSortMenu);
});
onUnmounted(() => {
    document.removeEventListener('click', closeSortMenu);
});
// Desktop collection state
const selectedItemId = ref(null);
const desktopFilters = ref({ category: undefined, minRating: 0, labels: '' });
const desktopFilteredItems = computed(() => {
    const f = desktopFilters.value;
    return displayItems.value.filter(item => {
        if (f.category && item.type !== f.category)
            return false;
        if (f.minRating > 0 && (item.userRating ?? 0) < f.minRating)
            return false;
        if (f.labels.trim()) {
            const search = f.labels.toLowerCase();
            if (!item.tags.some(t => t.toLowerCase().includes(search)))
                return false;
        }
        return true;
    });
});
function selectItem(id) {
    selectedItemId.value = selectedItemId.value === id ? null : id;
}
function navigateToItem(id) {
    router.push(`/items/${id}`);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.isDesktop) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex h-[calc(100vh-0px)]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-[calc(100vh-0px)]']} */ ;
    const __VLS_0 = FilterSidebar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.desktopFilters),
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.desktopFilters),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_5 = CollectionGrid;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onSelect': {} },
        items: (__VLS_ctx.desktopFilteredItems),
        selectedId: (__VLS_ctx.selectedItemId),
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onSelect': {} },
        items: (__VLS_ctx.desktopFilteredItems),
        selectedId: (__VLS_ctx.selectedItemId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ select: {} },
        { onSelect: (__VLS_ctx.selectItem) });
    var __VLS_8;
    var __VLS_9;
    if (__VLS_ctx.selectedItemId) {
        const __VLS_12 = DetailPanel;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            ...{ 'onClose': {} },
            ...{ 'onNavigate': {} },
            itemId: (__VLS_ctx.selectedItemId),
        }));
        const __VLS_14 = __VLS_13({
            ...{ 'onClose': {} },
            ...{ 'onNavigate': {} },
            itemId: (__VLS_ctx.selectedItemId),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        let __VLS_17;
        const __VLS_18 = ({ close: {} },
            { onClose: (...[$event]) => {
                    if (!(__VLS_ctx.isDesktop))
                        return;
                    if (!(__VLS_ctx.selectedItemId))
                        return;
                    __VLS_ctx.selectedItemId = null;
                    // @ts-ignore
                    [isDesktop, desktopFilters, desktopFilteredItems, selectedItemId, selectedItemId, selectedItemId, selectedItemId, selectItem,];
                } });
        const __VLS_19 = ({ navigate: {} },
            { onNavigate: (__VLS_ctx.navigateToItem) });
        var __VLS_15;
        var __VLS_16;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 max-w-lg mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex bg-[#041e3e] border border-[#0a2a52] rounded-xl p-1 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isDesktop))
                    return;
                __VLS_ctx.switchTab('collection');
                // @ts-ignore
                [navigateToItem, switchTab,];
            } },
        ...{ class: "flex-1 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors" },
        ...{ class: (__VLS_ctx.activeTab === 'collection' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white') },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isDesktop))
                    return;
                __VLS_ctx.switchTab('wishlist');
                // @ts-ignore
                [switchTab, activeTab,];
            } },
        ...{ class: "flex-1 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors" },
        ...{ class: (__VLS_ctx.activeTab === 'wishlist' ? 'bg-[#1e407c] text-white' : 'text-[#96BEE6] hover:text-white') },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative filter-dropdown" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['filter-dropdown']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isDesktop))
                    return;
                __VLS_ctx.showFilterMenu = !__VLS_ctx.showFilterMenu;
                // @ts-ignore
                [activeTab, showFilterMenu, showFilterMenu,];
            } },
        ...{ class: "flex items-center gap-1 px-3 py-2.5 min-h-[44px] rounded-full text-xs border transition-colors" },
        ...{ class: (__VLS_ctx.activeFilter
                ? 'bg-[#1e407c] border-[#1e407c] text-white'
                : 'border-[#1e407c]/50 text-[#96BEE6] hover:border-[#1e407c]') },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-3.5 h-3.5" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.activeFilterLabel);
    if (__VLS_ctx.showFilterMenu) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute left-0 top-full mt-1 bg-[#041e3e] border border-[#1e407c]/50 rounded-xl overflow-hidden shadow-lg z-10 min-w-[140px]" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[140px]']} */ ;
        for (const [opt] of __VLS_vFor((__VLS_ctx.typeFilters))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isDesktop))
                            return;
                        if (!(__VLS_ctx.showFilterMenu))
                            return;
                        __VLS_ctx.setFilter(opt.value);
                        __VLS_ctx.showFilterMenu = false;
                        // @ts-ignore
                        [showFilterMenu, showFilterMenu, activeFilter, activeFilterLabel, typeFilters, setFilter,];
                    } },
                key: (opt.label),
                ...{ class: "w-full text-left px-4 py-2.5 text-sm transition-colors" },
                ...{ class: (__VLS_ctx.activeFilter === opt.value
                        ? 'text-[#96BEE6] bg-[#0a2a52]'
                        : 'text-[#96BEE6] hover:bg-[#0a2a52]') },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            (opt.label);
            // @ts-ignore
            [activeFilter,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex-1" },
    });
    /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "relative shrink-0 sort-dropdown" },
    });
    /** @type {__VLS_StyleScopedClasses['relative']} */ ;
    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['sort-dropdown']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isDesktop))
                    return;
                __VLS_ctx.showSortMenu = !__VLS_ctx.showSortMenu;
                // @ts-ignore
                [showSortMenu, showSortMenu,];
            } },
        ...{ class: "flex items-center gap-1 px-3 py-2.5 min-h-[44px] rounded-full text-xs border border-[#1e407c]/50 text-[#96BEE6] hover:border-[#1e407c] transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-3.5 h-3.5" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    /** @type {__VLS_StyleScopedClasses['w-3.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-3.5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        d: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.sortOptions.find(o => o.value === __VLS_ctx.activeSort)?.label);
    if (__VLS_ctx.showSortMenu) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute right-0 top-full mt-1 bg-[#041e3e] border border-[#1e407c]/50 rounded-xl overflow-hidden shadow-lg z-10 min-w-[140px]" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[140px]']} */ ;
        for (const [opt] of __VLS_vFor((__VLS_ctx.sortOptions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isDesktop))
                            return;
                        if (!(__VLS_ctx.showSortMenu))
                            return;
                        __VLS_ctx.activeSort = opt.value;
                        __VLS_ctx.showSortMenu = false;
                        // @ts-ignore
                        [showSortMenu, showSortMenu, sortOptions, sortOptions, activeSort, activeSort,];
                    } },
                key: (opt.value),
                ...{ class: "w-full text-left px-4 py-2.5 text-sm transition-colors" },
                ...{ class: (__VLS_ctx.activeSort === opt.value
                        ? 'text-[#96BEE6] bg-[#0a2a52]'
                        : 'text-[#96BEE6] hover:bg-[#0a2a52]') },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            (opt.label);
            // @ts-ignore
            [activeSort,];
        }
    }
    if (__VLS_ctx.activeTab === 'wishlist') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        if (!__VLS_ctx.showAddForm) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isDesktop))
                            return;
                        if (!(__VLS_ctx.activeTab === 'wishlist'))
                            return;
                        if (!(!__VLS_ctx.showAddForm))
                            return;
                        __VLS_ctx.showAddForm = true;
                        // @ts-ignore
                        [activeTab, showAddForm, showAddForm,];
                    } },
                ...{ class: "w-full bg-[#041e3e] border border-dashed border-[#1e407c]/50 rounded-xl p-3 text-[#96BEE6] hover:border-[#96BEE6]/50 hover:text-white/80 transition-colors text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:border-[#96BEE6]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-white/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 space-y-3" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                placeholder: "Paste a product URL to auto-fill...",
                ...{ class: "flex-1 bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
            });
            (__VLS_ctx.newUrl);
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
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
                ...{ onClick: (__VLS_ctx.addWishlistFromUrl) },
                disabled: (__VLS_ctx.isExtractingUrl || !__VLS_ctx.newUrl.trim()),
                ...{ class: "shrink-0 px-4 py-2.5 bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#1e407c] disabled:text-[#96BEE6]/70 text-white rounded-xl text-sm font-medium min-h-[44px]" },
            });
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:bg-[#1e407c]']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:text-[#96BEE6]/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
            (__VLS_ctx.isExtractingUrl ? 'Extracting...' : 'Extract');
            if (__VLS_ctx.urlError) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-red-400" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                (__VLS_ctx.urlError);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-3 text-[#4a7aa5]/60 text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 border-t border-[#0a2a52]" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 border-t border-[#0a2a52]" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
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
            for (const [opt] of __VLS_vFor((__VLS_ctx.typeOptions))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    key: (opt.value),
                    value: (opt.value),
                });
                (opt.label);
                // @ts-ignore
                [newUrl, newUrl, addWishlistFromUrl, isExtractingUrl, isExtractingUrl, urlError, urlError, newName, newType, typeOptions,];
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                placeholder: "Brand (optional)",
                ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
            });
            (__VLS_ctx.newBrand);
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
                placeholder: "Notes (optional)",
                ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
            });
            (__VLS_ctx.newNotes);
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
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.addWishlistItem) },
                disabled: (__VLS_ctx.isAdding || !__VLS_ctx.newName.trim()),
                ...{ class: "flex-1 bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#1e407c] disabled:text-[#96BEE6]/70 text-white py-2.5 rounded-xl text-sm font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:bg-[#1e407c]']} */ ;
            /** @type {__VLS_StyleScopedClasses['disabled:text-[#96BEE6]/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.isAdding ? 'Adding...' : 'Add');
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isDesktop))
                            return;
                        if (!(__VLS_ctx.activeTab === 'wishlist'))
                            return;
                        if (!!(!__VLS_ctx.showAddForm))
                            return;
                        __VLS_ctx.showAddForm = false;
                        // @ts-ignore
                        [showAddForm, newName, newBrand, newNotes, addWishlistItem, isAdding, isAdding,];
                    } },
                ...{ class: "px-4 py-2.5 bg-[#0a2a52] text-[#96BEE6] rounded-xl text-sm hover:bg-[#1e407c]" },
            });
            /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        }
    }
    if (__VLS_ctx.isLoadingList && !__VLS_ctx.displayItems.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[#96BEE6]/70 text-center py-12" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
    }
    else if (!__VLS_ctx.displayItems.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-[#96BEE6]/70 text-center py-12" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
        if (__VLS_ctx.activeTab === 'wishlist') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        }
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
                key: (__VLS_ctx.displayItems[row.index].id),
                'data-index': (row.index),
                ref: ((el) => { if (el?.$el || el)
                    __VLS_ctx.virtualizer.measureElement(el?.$el ?? el); }),
                ...{ style: ({ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${row.start}px)` }) },
            });
            if (__VLS_ctx.activeTab === 'collection') {
                let __VLS_20;
                /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
                routerLink;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
                    to: (`/items/${__VLS_ctx.displayItems[row.index].id}`),
                    ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors" },
                }));
                const __VLS_22 = __VLS_21({
                    to: (`/items/${__VLS_ctx.displayItems[row.index].id}`),
                    ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 hover:border-[#1e407c]/50 transition-colors" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                const { default: __VLS_25 } = __VLS_23.slots;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-start gap-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                if (__VLS_ctx.displayItems[row.index].photoUrls.length) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                        src: (__VLS_ctx.displayItems[row.index].photoUrls[0]),
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
                        ...{ class: "w-16 h-16 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center text-xs text-[#96BEE6]/70 uppercase" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-16']} */ ;
                    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                    (__VLS_ctx.displayItems[row.index].type);
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
                    ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                (__VLS_ctx.displayItems[row.index].type);
                if (__VLS_ctx.displayItems[row.index].status === 'ai-draft') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-xs text-[#96BEE6]" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                    ...{ class: "font-medium text-white truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (__VLS_ctx.displayItems[row.index].name);
                if (__VLS_ctx.displayItems[row.index].brand) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-sm text-[#96BEE6]/70 truncate" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                    (__VLS_ctx.displayItems[row.index].brand);
                }
                if (__VLS_ctx.displayItems[row.index].userRating) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "mt-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                    const __VLS_26 = StarRating;
                    // @ts-ignore
                    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
                        rating: (__VLS_ctx.displayItems[row.index].userRating),
                        size: "sm",
                    }));
                    const __VLS_28 = __VLS_27({
                        rating: (__VLS_ctx.displayItems[row.index].userRating),
                        size: "sm",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
                }
                // @ts-ignore
                [activeTab, activeTab, isLoadingList, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, virtualizer, virtualizer, virtualizer,];
                var __VLS_23;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
                });
                /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
                let __VLS_31;
                /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
                routerLink;
                // @ts-ignore
                const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
                    to: (`/items/${__VLS_ctx.displayItems[row.index].id}`),
                    ...{ class: "block" },
                }));
                const __VLS_33 = __VLS_32({
                    to: (`/items/${__VLS_ctx.displayItems[row.index].id}`),
                    ...{ class: "block" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_32));
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                const { default: __VLS_36 } = __VLS_34.slots;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-start gap-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "w-10 h-10 bg-[#0a2a52] rounded-lg shrink-0 flex items-center justify-center text-xs text-[#96BEE6]/70 uppercase" },
                });
                /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
                (__VLS_ctx.displayItems[row.index].type.slice(0, 1));
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
                    ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                (__VLS_ctx.displayItems[row.index].type);
                __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                    ...{ class: "font-medium text-white truncate" },
                });
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                (__VLS_ctx.displayItems[row.index].name);
                if (__VLS_ctx.displayItems[row.index].brand) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-sm text-[#96BEE6] truncate" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                    (__VLS_ctx.displayItems[row.index].brand);
                }
                if (__VLS_ctx.displayItems[row.index].userNotes) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-xs text-[#96BEE6]/70 mt-1 line-clamp-2" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
                    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                    /** @type {__VLS_StyleScopedClasses['line-clamp-2']} */ ;
                    (__VLS_ctx.displayItems[row.index].userNotes);
                }
                if (__VLS_ctx.displayItems[row.index].processedBy === 'pending') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                        ...{ class: "text-xs text-[#96BEE6] mt-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                }
                // @ts-ignore
                [displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems, displayItems,];
                var __VLS_34;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex gap-2 mt-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.isDesktop))
                                return;
                            if (!!(__VLS_ctx.isLoadingList && !__VLS_ctx.displayItems.length))
                                return;
                            if (!!(!__VLS_ctx.displayItems.length))
                                return;
                            if (!!(__VLS_ctx.activeTab === 'collection'))
                                return;
                            __VLS_ctx.convertItem(__VLS_ctx.displayItems[row.index].id);
                            // @ts-ignore
                            [displayItems, convertItem,];
                        } },
                    ...{ class: "flex-1 bg-[#1e407c] hover:bg-[#2a5299] text-white py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.isDesktop))
                                return;
                            if (!!(__VLS_ctx.isLoadingList && !__VLS_ctx.displayItems.length))
                                return;
                            if (!!(!__VLS_ctx.displayItems.length))
                                return;
                            if (!!(__VLS_ctx.activeTab === 'collection'))
                                return;
                            __VLS_ctx.deleteItem(__VLS_ctx.displayItems[row.index].id);
                            // @ts-ignore
                            [displayItems, deleteItem,];
                        } },
                    ...{ class: "px-4 py-2 min-h-[44px] bg-[#0a2a52] text-red-400 hover:bg-[#1e407c] rounded-xl text-sm transition-colors" },
                });
                /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            }
            // @ts-ignore
            [];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
