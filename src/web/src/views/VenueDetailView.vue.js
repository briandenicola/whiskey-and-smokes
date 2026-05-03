/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, inject, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { venuesApi } from '../services/venues';
import { itemsApi } from '../services/items';
import { thoughtsApi } from '../services/thoughts';
import { useAuthStore } from '../stores/auth';
import { RefreshKey } from '../composables/refreshKey';
import StarRating from '../components/common/StarRating.vue';
import ThoughtsList from '../components/common/ThoughtsList.vue';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const registerRefresh = inject(RefreshKey);
const venue = ref(null);
const linkedItems = ref([]);
const isEditing = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const friendThoughts = ref([]);
const isLoadingThoughts = ref(false);
const editName = ref('');
const editAddress = ref('');
const editWebsite = ref('');
const editType = ref('other');
const editRating = ref(0);
const pendingPhotoDeletes = ref(new Set());
const pendingPhotoAdds = ref([]);
const photoFileInput = ref(null);
const isUploadingPhoto = ref(false);
// Item association
const allItems = ref([]);
const selectedItemIds = ref(new Set());
const itemSearchQuery = ref('');
// Labels
const editLabels = ref([]);
const newLabelInput = ref('');
const suggestedLabels = [
    'to-try', 'date night', 'craft cocktails', 'outdoor seating', 'live music',
    'happy hour', 'brunch', 'fine dining', 'casual', 'rooftop',
    'speakeasy', 'sports bar', 'wine bar', 'tiki', 'gastropub',
    'late night', 'family friendly', 'dog friendly', 'waterfront',
];
const venueTypeOptions = [
    { label: 'Bar', value: 'bar' },
    { label: 'Lounge', value: 'lounge' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Cafe', value: 'cafe' },
    { label: 'Other', value: 'other' },
];
async function refreshVenue() {
    const id = route.params.id;
    const { data } = await venuesApi.get(id);
    venue.value = data;
    resetEditFields(data);
    try {
        const { data: itemsData } = await venuesApi.getItems(id);
        linkedItems.value = itemsData.items;
    }
    catch {
        linkedItems.value = [];
    }
}
registerRefresh?.(refreshVenue);
onMounted(async () => {
    await refreshVenue();
    loadThoughts();
});
async function loadThoughts() {
    if (!venue.value || !auth.user)
        return;
    isLoadingThoughts.value = true;
    try {
        const res = await thoughtsApi.getForTarget('venue', venue.value.id, auth.user.id);
        friendThoughts.value = res.data;
    }
    catch { /* silent */ }
    isLoadingThoughts.value = false;
}
async function handleDeleteThought(thought) {
    try {
        await thoughtsApi.remove(thought.id);
        friendThoughts.value = friendThoughts.value.filter(t => t.id !== thought.id);
    }
    catch { /* silent */ }
}
function resetEditFields(data) {
    editName.value = data.name;
    editAddress.value = data.address ?? '';
    editWebsite.value = data.website ?? '';
    editType.value = data.type;
    editRating.value = data.rating ?? 0;
    editLabels.value = [...(data.labels ?? [])];
    newLabelInput.value = '';
}
function startEditing() {
    if (venue.value)
        resetEditFields(venue.value);
    pendingPhotoDeletes.value = new Set();
    pendingPhotoAdds.value = [];
    selectedItemIds.value = new Set(linkedItems.value.map(i => i.id));
    itemSearchQuery.value = '';
    isEditing.value = true;
    loadAllItems();
}
async function loadAllItems() {
    try {
        const { data } = await itemsApi.list(undefined, undefined, 'collected');
        allItems.value = data.items;
    }
    catch {
        allItems.value = [];
    }
}
const filteredItems = computed(() => {
    const q = itemSearchQuery.value.toLowerCase().trim();
    const items = allItems.value.filter(i => {
        if (!q)
            return true;
        return i.name.toLowerCase().includes(q) || i.type.toLowerCase().includes(q);
    });
    // Show selected items first, then unselected
    return items.sort((a, b) => {
        const aSelected = selectedItemIds.value.has(a.id) ? 0 : 1;
        const bSelected = selectedItemIds.value.has(b.id) ? 0 : 1;
        return aSelected - bSelected;
    }).slice(0, 20);
});
function toggleItemLink(itemId) {
    if (selectedItemIds.value.has(itemId)) {
        selectedItemIds.value.delete(itemId);
    }
    else {
        selectedItemIds.value.add(itemId);
    }
}
function addLabel(label) {
    const normalized = label.trim().toLowerCase();
    if (normalized && !editLabels.value.includes(normalized)) {
        editLabels.value.push(normalized);
    }
    newLabelInput.value = '';
    showLabelDropdown.value = false;
}
function removeLabel(label) {
    editLabels.value = editLabels.value.filter(l => l !== label);
}
const showLabelDropdown = ref(false);
const filteredSuggestions = computed(() => {
    const q = newLabelInput.value.trim().toLowerCase();
    const available = suggestedLabels.filter(l => !editLabels.value.includes(l));
    if (!q)
        return available;
    return available.filter(l => l.includes(q));
});
const showCustomOption = computed(() => {
    const q = newLabelInput.value.trim().toLowerCase();
    return q && !suggestedLabels.includes(q) && !editLabels.value.includes(q);
});
function onLabelInputFocus() {
    showLabelDropdown.value = true;
}
function onLabelInputBlur() {
    // Delay to allow click on dropdown item
    setTimeout(() => { showLabelDropdown.value = false; }, 200);
}
function markPhotoForDelete(url) {
    pendingPhotoDeletes.value.add(url);
}
function unmarkPhotoForDelete(url) {
    pendingPhotoDeletes.value.delete(url);
}
function triggerPhotoUpload() {
    photoFileInput.value?.click();
}
function onPhotoFilesSelected(event) {
    const input = event.target;
    if (!input.files)
        return;
    for (const file of Array.from(input.files)) {
        if (!file.type.startsWith('image/'))
            continue;
        const previewUrl = URL.createObjectURL(file);
        pendingPhotoAdds.value.push({ file, previewUrl });
    }
    input.value = '';
}
function removePendingPhoto(index) {
    const removed = pendingPhotoAdds.value.splice(index, 1);
    if (removed[0])
        URL.revokeObjectURL(removed[0].previewUrl);
}
async function uploadNewPhoto(file) {
    if (!venue.value)
        throw new Error('No venue');
    const { data } = await venuesApi.getPhotoUploadUrl(venue.value.id, file.name);
    const headers = { 'Content-Type': file.type };
    if (data.uploadUrl.includes('blob.core.windows.net') || data.uploadUrl.includes('devstoreaccount')) {
        headers['x-ms-blob-type'] = 'BlockBlob';
    }
    else {
        const token = localStorage.getItem('whiskey_and_smokes_token');
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
    }
    await fetch(data.uploadUrl, { method: 'PUT', headers, body: file });
    return data.blobUrl;
}
async function saveEdits() {
    if (!venue.value)
        return;
    isSaving.value = true;
    try {
        // Delete marked photos
        for (const url of pendingPhotoDeletes.value) {
            try {
                const { data } = await venuesApi.removePhoto(venue.value.id, url);
                venue.value = data;
            }
            catch { /* continue with other ops */ }
        }
        // Upload and add new photos
        for (const pending of pendingPhotoAdds.value) {
            try {
                const blobUrl = await uploadNewPhoto(pending.file);
                const { data } = await venuesApi.addPhoto(venue.value.id, blobUrl);
                venue.value = data;
                URL.revokeObjectURL(pending.previewUrl);
            }
            catch { /* continue with other ops */ }
        }
        // Save other fields
        const { data } = await venuesApi.update(venue.value.id, {
            name: editName.value.trim(),
            address: editAddress.value.trim() || undefined,
            website: editWebsite.value.trim() || undefined,
            type: editType.value,
            rating: editRating.value || undefined,
            labels: editLabels.value,
        });
        venue.value = data;
        // Update item associations
        const currentLinkedIds = new Set(linkedItems.value.map(i => i.id));
        const venueInfo = {
            venueId: venue.value.id,
            name: venue.value.name,
            address: venue.value.address,
        };
        // Link newly selected items
        for (const itemId of selectedItemIds.value) {
            if (!currentLinkedIds.has(itemId)) {
                try {
                    await itemsApi.update(itemId, { venue: venueInfo });
                }
                catch { /* continue */ }
            }
        }
        // Unlink removed items
        for (const itemId of currentLinkedIds) {
            if (!selectedItemIds.value.has(itemId)) {
                try {
                    await itemsApi.update(itemId, { venue: { name: '' } });
                }
                catch { /* continue */ }
            }
        }
        // Refresh linked items
        try {
            const { data: itemsData } = await venuesApi.getItems(venue.value.id);
            linkedItems.value = itemsData.items;
        }
        catch {
            linkedItems.value = [];
        }
        isEditing.value = false;
    }
    finally {
        isSaving.value = false;
    }
}
async function deleteVenue() {
    if (!venue.value)
        return;
    isDeleting.value = true;
    try {
        await venuesApi.delete(venue.value.id);
        router.replace('/venues');
    }
    finally {
        isDeleting.value = false;
    }
}
const photoUrls = computed(() => venue.value?.photoUrls ?? []);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.venue) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 max-w-lg mx-auto lg:max-w-5xl" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['lg:max-w-5xl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.venue))
                    return;
                __VLS_ctx.router.back();
                // @ts-ignore
                [venue, router,];
            } },
        ...{ class: "text-[#96BEE6] hover:text-white text-sm mb-4 flex items-center gap-1" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
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
        d: "M15 19l-7-7 7-7",
    });
    if (!__VLS_ctx.isEditing && __VLS_ctx.photoUrls.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4 -mx-4 lg:mx-0" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['-mx-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:mx-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 px-4 lg:px-0 overflow-x-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:px-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        for (const [url] of __VLS_vFor((__VLS_ctx.photoUrls))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                key: (url),
                src: (url),
                ...{ class: "w-32 h-32 lg:w-48 lg:h-48 object-cover rounded-xl shrink-0" },
            });
            /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:w-48']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:h-48']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            // @ts-ignore
            [isEditing, photoUrls, photoUrls,];
        }
    }
    if (!__VLS_ctx.isEditing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lg:grid lg:grid-cols-3 lg:gap-8" },
        });
        /** @type {__VLS_StyleScopedClasses['lg:grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:gap-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lg:col-span-2 space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['lg:col-span-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
        (__VLS_ctx.venue.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "text-2xl font-bold text-white mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        (__VLS_ctx.venue.name);
        if (__VLS_ctx.venue.rating) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-center gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            const __VLS_0 = StarRating;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                rating: (__VLS_ctx.venue.rating),
                size: "md",
            }));
            const __VLS_2 = __VLS_1({
                rating: (__VLS_ctx.venue.rating),
                size: "md",
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        }
        if (__VLS_ctx.venue.address) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-[#96BEE6] text-sm" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            (__VLS_ctx.venue.address);
        }
        if (__VLS_ctx.venue.website) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.venue.website),
                target: "_blank",
                ...{ class: "text-[#96BEE6] text-sm hover:text-[#96BEE6] block truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['block']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (__VLS_ctx.venue.website);
        }
        if (__VLS_ctx.venue.labels?.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap gap-1.5" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
            for (const [label] of __VLS_vFor((__VLS_ctx.venue.labels))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (label),
                    ...{ class: "text-xs px-2.5 py-1 rounded-full bg-[#1e407c]/30 text-[#96BEE6] border border-[#1e407c]/50" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
                (label);
                // @ts-ignore
                [venue, venue, venue, venue, venue, venue, venue, venue, venue, venue, venue, isEditing,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.startEditing) },
            ...{ class: "flex-1 bg-[#1e407c] hover:bg-[#2a5299] text-white py-2.5 min-h-[44px] rounded-xl text-sm font-medium lg:flex-none lg:px-8" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:flex-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.deleteVenue) },
            disabled: (__VLS_ctx.isDeleting),
            ...{ class: "px-4 py-2.5 min-h-[44px] bg-[#0a2a52] text-red-400 hover:bg-[#1e407c] rounded-xl text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (__VLS_ctx.isDeleting ? 'Deleting...' : 'Delete');
        if (__VLS_ctx.friendThoughts.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mt-6" },
            });
            /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "text-sm font-medium text-[#96BEE6] uppercase tracking-wide mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
            /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            (__VLS_ctx.friendThoughts.length);
            const __VLS_5 = ThoughtsList;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                ...{ 'onDelete': {} },
                thoughts: (__VLS_ctx.friendThoughts),
            }));
            const __VLS_7 = __VLS_6({
                ...{ 'onDelete': {} },
                thoughts: (__VLS_ctx.friendThoughts),
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            let __VLS_10;
            const __VLS_11 = ({ delete: {} },
                { onDelete: (__VLS_ctx.handleDeleteThought) });
            var __VLS_8;
            var __VLS_9;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lg:col-span-1 space-y-6 mt-6 lg:mt-0" },
        });
        /** @type {__VLS_StyleScopedClasses['lg:col-span-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:mt-0']} */ ;
        if (__VLS_ctx.linkedItems.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
            for (const [item] of __VLS_vFor((__VLS_ctx.linkedItems))) {
                let __VLS_12;
                /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
                routerLink;
                // @ts-ignore
                const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
                    key: (item.id),
                    to: (`/items/${item.id}`),
                    ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-3 hover:border-[#1e407c]/50 transition-colors" },
                }));
                const __VLS_14 = __VLS_13({
                    key: (item.id),
                    to: (`/items/${item.id}`),
                    ...{ class: "block bg-[#041e3e] border border-[#0a2a52] rounded-xl p-3 hover:border-[#1e407c]/50 transition-colors" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_13));
                /** @type {__VLS_StyleScopedClasses['block']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
                const { default: __VLS_17 } = __VLS_15.slots;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex items-center gap-3" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
                if (item.photoUrls?.length) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                        src: (item.photoUrls[0]),
                        ...{ class: "w-10 h-10 object-cover rounded-lg shrink-0" },
                    });
                    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
                    /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
                    /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
                    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                    /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "flex-1 min-w-0" },
                });
                /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
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
                __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
                    ...{ class: "font-medium text-white truncate text-sm" },
                });
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                (item.name);
                // @ts-ignore
                [startEditing, deleteVenue, isDeleting, isDeleting, friendThoughts, friendThoughts, friendThoughts, handleDeleteThought, linkedItems, linkedItems,];
                var __VLS_15;
                // @ts-ignore
                [];
            }
        }
        if (__VLS_ctx.photoUrls.length > 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "hidden lg:block" },
            });
            /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['lg:block']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "text-sm font-medium text-[#96BEE6] mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "grid grid-cols-2 gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['grid']} */ ;
            /** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            for (const [url] of __VLS_vFor((__VLS_ctx.photoUrls))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    key: ('grid-' + url),
                    src: (url),
                    ...{ class: "w-full aspect-square object-cover rounded-xl" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['aspect-square']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
                // @ts-ignore
                [photoUrls, photoUrls,];
            }
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lg:max-w-2xl" },
        });
        /** @type {__VLS_StyleScopedClasses['lg:max-w-2xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 overflow-x-auto pb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-x-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
        for (const [url, i] of __VLS_vFor((__VLS_ctx.photoUrls))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: ('existing-' + i),
                ...{ class: "relative flex-shrink-0" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (url),
                ...{ class: "h-32 w-32 object-cover rounded-xl transition-opacity" },
                ...{ class: ({ 'opacity-30': __VLS_ctx.pendingPhotoDeletes.has(url) }) },
            });
            /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
            /** @type {__VLS_StyleScopedClasses['opacity-30']} */ ;
            if (!__VLS_ctx.pendingPhotoDeletes.has(url)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.venue))
                                return;
                            if (!!(!__VLS_ctx.isEditing))
                                return;
                            if (!(!__VLS_ctx.pendingPhotoDeletes.has(url)))
                                return;
                            __VLS_ctx.markPhotoForDelete(url);
                            // @ts-ignore
                            [photoUrls, pendingPhotoDeletes, pendingPhotoDeletes, markPhotoForDelete,];
                        } },
                    ...{ class: "absolute top-1 right-1 bg-black/70 text-red-400 hover:text-red-300 rounded-full w-11 h-11 flex items-center justify-center text-xs" },
                    title: "Remove photo",
                });
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['top-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:text-red-300']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.venue))
                                return;
                            if (!!(!__VLS_ctx.isEditing))
                                return;
                            if (!!(!__VLS_ctx.pendingPhotoDeletes.has(url)))
                                return;
                            __VLS_ctx.unmarkPhotoForDelete(url);
                            // @ts-ignore
                            [unmarkPhotoForDelete,];
                        } },
                    ...{ class: "absolute inset-0 flex items-center justify-center text-xs text-white/80 bg-black/40 rounded-xl" },
                });
                /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
                /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            }
            // @ts-ignore
            [];
        }
        for (const [pending, i] of __VLS_vFor((__VLS_ctx.pendingPhotoAdds))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: ('pending-' + i),
                ...{ class: "relative flex-shrink-0" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (pending.previewUrl),
                ...{ class: "h-32 w-32 object-cover rounded-xl border-2 border-[#1e407c]" },
            });
            /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#1e407c]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.venue))
                            return;
                        if (!!(!__VLS_ctx.isEditing))
                            return;
                        __VLS_ctx.removePendingPhoto(i);
                        // @ts-ignore
                        [pendingPhotoAdds, removePendingPhoto,];
                    } },
                ...{ class: "absolute top-1 right-1 bg-black/70 text-red-400 hover:text-red-300 rounded-full w-11 h-11 flex items-center justify-center text-xs" },
                title: "Remove",
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-red-300']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-11']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "absolute bottom-1 left-1 text-[10px] bg-[#1e407c]/80 text-white px-1.5 py-0.5 rounded" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['bottom-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.triggerPhotoUpload) },
            disabled: (__VLS_ctx.isUploadingPhoto),
            ...{ class: "h-32 w-32 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-[#1e407c]/50 rounded-xl text-[#96BEE6]/70 hover:text-[#96BEE6] hover:border-[#1e407c] transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['h-32']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-32']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            ...{ class: "w-8 h-8 mb-1" },
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            'stroke-width': "1.5",
        });
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            d: "M12 4.5v15m7.5-7.5h-15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (__VLS_ctx.onPhotoFilesSelected) },
            ref: "photoFileInput",
            type: "file",
            accept: "image/*",
            multiple: true,
            ...{ class: "hidden" },
        });
        /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.editName);
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.editType),
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
            [triggerPhotoUpload, isUploadingPhoto, onPhotoFilesSelected, editName, editType, venueTypeOptions,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.editAddress);
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.editWebsite);
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        const __VLS_18 = StarRating;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            ...{ 'onUpdate:rating': {} },
            rating: (__VLS_ctx.editRating),
            size: "lg",
            interactive: true,
        }));
        const __VLS_20 = __VLS_19({
            ...{ 'onUpdate:rating': {} },
            rating: (__VLS_ctx.editRating),
            size: "lg",
            interactive: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_23;
        const __VLS_24 = ({ 'update:rating': {} },
            { 'onUpdate:rating': (...[$event]) => {
                    if (!(__VLS_ctx.venue))
                        return;
                    if (!!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.editRating = $event;
                    // @ts-ignore
                    [editAddress, editWebsite, editRating, editRating,];
                } });
        var __VLS_21;
        var __VLS_22;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        if (__VLS_ctx.editLabels.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex flex-wrap gap-1.5 mb-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
            for (const [label] of __VLS_vFor((__VLS_ctx.editLabels))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (label),
                    ...{ class: "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#1e407c]/30 text-[#96BEE6] border border-[#1e407c]/50" },
                });
                /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['border']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
                (label);
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.venue))
                                return;
                            if (!!(!__VLS_ctx.isEditing))
                                return;
                            if (!(__VLS_ctx.editLabels.length))
                                return;
                            __VLS_ctx.removeLabel(label);
                            // @ts-ignore
                            [editLabels, editLabels, removeLabel,];
                        } },
                    ...{ class: "hover:text-red-400 ml-0.5 text-base leading-none" },
                });
                /** @type {__VLS_StyleScopedClasses['hover:text-red-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['ml-0.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-base']} */ ;
                /** @type {__VLS_StyleScopedClasses['leading-none']} */ ;
                // @ts-ignore
                [];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "relative mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['relative']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onKeydown: (...[$event]) => {
                    if (!(__VLS_ctx.venue))
                        return;
                    if (!!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.addLabel(__VLS_ctx.newLabelInput);
                    // @ts-ignore
                    [addLabel, newLabelInput,];
                } },
            ...{ onFocus: (__VLS_ctx.onLabelInputFocus) },
            ...{ onBlur: (__VLS_ctx.onLabelInputBlur) },
            placeholder: "Type to search or add labels...",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-3 py-2 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
        });
        (__VLS_ctx.newLabelInput);
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        if (__VLS_ctx.showLabelDropdown && (__VLS_ctx.filteredSuggestions.length || __VLS_ctx.showCustomOption)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute left-0 right-0 top-full mt-1 bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl overflow-hidden z-10 max-h-48 overflow-y-auto" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-h-48']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
            if (__VLS_ctx.showCustomOption) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onMousedown: (...[$event]) => {
                            if (!(__VLS_ctx.venue))
                                return;
                            if (!!(!__VLS_ctx.isEditing))
                                return;
                            if (!(__VLS_ctx.showLabelDropdown && (__VLS_ctx.filteredSuggestions.length || __VLS_ctx.showCustomOption)))
                                return;
                            if (!(__VLS_ctx.showCustomOption))
                                return;
                            __VLS_ctx.addLabel(__VLS_ctx.newLabelInput);
                            // @ts-ignore
                            [addLabel, newLabelInput, newLabelInput, onLabelInputFocus, onLabelInputBlur, showLabelDropdown, filteredSuggestions, showCustomOption, showCustomOption,];
                        } },
                    ...{ class: "w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1e407c]/30 border-b border-[#1e407c]/30" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]/30']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/30']} */ ;
                (__VLS_ctx.newLabelInput.trim().toLowerCase());
            }
            for (const [label] of __VLS_vFor((__VLS_ctx.filteredSuggestions))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onMousedown: (...[$event]) => {
                            if (!(__VLS_ctx.venue))
                                return;
                            if (!!(!__VLS_ctx.isEditing))
                                return;
                            if (!(__VLS_ctx.showLabelDropdown && (__VLS_ctx.filteredSuggestions.length || __VLS_ctx.showCustomOption)))
                                return;
                            __VLS_ctx.addLabel(label);
                            // @ts-ignore
                            [addLabel, newLabelInput, filteredSuggestions,];
                        } },
                    key: (label),
                    ...{ class: "w-full text-left px-3 py-2 text-sm text-[#96BEE6] hover:bg-[#1e407c]/30" },
                });
                /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
                /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]/30']} */ ;
                (label);
                // @ts-ignore
                [];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            value: (__VLS_ctx.itemSearchQuery),
            type: "text",
            placeholder: "Search items...",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1e407c] mb-2" },
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
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "max-h-48 overflow-y-auto space-y-1 rounded-xl border border-[#0a2a52] bg-[#041e3e]/50 p-2" },
        });
        /** @type {__VLS_StyleScopedClasses['max-h-48']} */ ;
        /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
        /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
        for (const [itm] of __VLS_vFor((__VLS_ctx.filteredItems))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.venue))
                            return;
                        if (!!(!__VLS_ctx.isEditing))
                            return;
                        __VLS_ctx.toggleItemLink(itm.id);
                        // @ts-ignore
                        [itemSearchQuery, filteredItems, toggleItemLink,];
                    } },
                key: (itm.id),
                ...{ class: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors min-h-[44px]" },
                ...{ class: (__VLS_ctx.selectedItemIds.has(itm.id) ? 'bg-[#1e407c]/30 border border-[#1e407c]/50' : 'hover:bg-[#0a2a52]') },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0" },
                ...{ class: (__VLS_ctx.selectedItemIds.has(itm.id) ? 'border-[#96BEE6] bg-[#2a5299]' : 'border-[#1e407c]') },
            });
            /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
            if (__VLS_ctx.selectedItemIds.has(itm.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    ...{ class: "w-3 h-3 text-white" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "3",
                });
                /** @type {__VLS_StyleScopedClasses['w-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M5 13l4 4L19 7",
                });
            }
            if (itm.photoUrls?.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                    src: (itm.photoUrls[0]),
                    ...{ class: "w-8 h-8 object-cover rounded-lg flex-shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
                /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-white truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (itm.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-[#96BEE6]/70 capitalize" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['capitalize']} */ ;
            (itm.type);
            // @ts-ignore
            [selectedItemIds, selectedItemIds, selectedItemIds,];
        }
        if (!__VLS_ctx.filteredItems.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#4a7aa5]/60 text-center py-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-[#4a7aa5]/60 mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (__VLS_ctx.selectedItemIds.size);
        (__VLS_ctx.selectedItemIds.size === 1 ? '' : 's');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.saveEdits) },
            disabled: (__VLS_ctx.isSaving),
            ...{ class: "flex-1 bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#1e407c] disabled:text-[#96BEE6]/70 text-white py-2.5 min-h-[44px] rounded-xl text-sm font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.isSaving ? 'Saving...' : 'Save');
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.venue))
                        return;
                    if (!!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.isEditing = false;
                    // @ts-ignore
                    [isEditing, filteredItems, selectedItemIds, selectedItemIds, saveEdits, isSaving, isSaving,];
                } },
            ...{ class: "px-4 py-2.5 min-h-[44px] bg-[#0a2a52] text-[#96BEE6] rounded-xl text-sm hover:bg-[#1e407c]" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
