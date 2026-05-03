/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, inject, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemsStore } from '../stores/items';
import { useVenuesStore } from '../stores/venues';
import { itemsApi } from '../services/items';
import { thoughtsApi } from '../services/thoughts';
import { useAuthStore } from '../stores/auth';
import StarRating from '../components/common/StarRating.vue';
import ThoughtsList from '../components/common/ThoughtsList.vue';
import AutocompleteInput from '../components/common/AutocompleteInput.vue';
import { RefreshKey } from '../composables/refreshKey';
const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const venuesStore = useVenuesStore();
const registerRefresh = inject(RefreshKey);
const item = ref(null);
const isEditing = ref(false);
const isSaving = ref(false);
const isAddingNote = ref(false);
const showDeleteConfirm = ref(false);
const editRating = ref(0);
const editName = ref('');
const editType = ref('');
const editBrand = ref('');
const editNotes = ref('');
const editVenueName = ref('');
const editVenueAddress = ref('');
const editTags = ref([]);
const newTag = ref('');
const newJournalEntry = ref('');
// Friend thoughts
const auth = useAuthStore();
const friendThoughts = ref([]);
const isLoadingThoughts = ref(false);
// Photo management
const isUploadingPhoto = ref(false);
const photoFileInput = ref(null);
const pendingPhotoDeletes = ref(new Set());
const pendingPhotoAdds = ref([]);
// Lightbox
const lightboxUrl = ref(null);
const lightboxScale = ref(1);
const lightboxTranslateX = ref(0);
const lightboxTranslateY = ref(0);
const isPanning = ref(false);
let pinchStartDist = 0;
let pinchStartScale = 1;
let panStartX = 0;
let panStartY = 0;
function openLightbox(url) {
    lightboxUrl.value = url;
    lightboxScale.value = 1;
    lightboxTranslateX.value = 0;
    lightboxTranslateY.value = 0;
}
function closeLightbox() {
    lightboxUrl.value = null;
}
function onLightboxWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    lightboxScale.value = Math.min(Math.max(lightboxScale.value * delta, 0.5), 5);
}
function onLightboxTouchStart(e) {
    if (e.touches.length === 2) {
        pinchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        pinchStartScale = lightboxScale.value;
    }
    else if (e.touches.length === 1 && lightboxScale.value > 1) {
        isPanning.value = true;
        panStartX = e.touches[0].clientX - lightboxTranslateX.value;
        panStartY = e.touches[0].clientY - lightboxTranslateY.value;
    }
}
function onLightboxTouchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        lightboxScale.value = Math.min(Math.max(pinchStartScale * (dist / pinchStartDist), 0.5), 5);
    }
    else if (e.touches.length === 1 && isPanning.value) {
        e.preventDefault();
        lightboxTranslateX.value = e.touches[0].clientX - panStartX;
        lightboxTranslateY.value = e.touches[0].clientY - panStartY;
    }
}
function onLightboxTouchEnd() {
    isPanning.value = false;
}
function resetLightboxZoom() {
    lightboxScale.value = 1;
    lightboxTranslateX.value = 0;
    lightboxTranslateY.value = 0;
}
// Suggestions for autocomplete
const nameSuggestions = ref([]);
const brandSuggestions = ref([]);
const tagSuggestions = ref([]);
const venueSuggestions = computed(() => venuesStore.venues.map(v => v.name));
function onVenueSelected(name) {
    editVenueName.value = name;
    const match = venuesStore.venues.find(v => v.name === name);
    if (match?.address) {
        editVenueAddress.value = match.address;
    }
}
const typeOptions = [
    { label: 'Whiskey', value: 'whiskey' },
    { label: 'Wine', value: 'wine' },
    { label: 'Cocktail', value: 'cocktail' },
    { label: 'Vodka', value: 'vodka' },
    { label: 'Gin', value: 'gin' },
    { label: 'Cigar', value: 'cigar' },
    { label: 'Dessert', value: 'dessert' },
    { label: 'Custom', value: 'custom' },
];
async function loadSuggestions() {
    try {
        const { data } = await itemsApi.getSuggestions();
        nameSuggestions.value = data.names;
        brandSuggestions.value = data.brands;
        tagSuggestions.value = data.tags;
    }
    catch { /* ignore */ }
}
async function refreshItem() {
    const { data } = await itemsApi.get(route.params.id);
    item.value = data;
    resetEditFields(data);
}
registerRefresh?.(refreshItem);
onMounted(async () => {
    await refreshItem();
    loadThoughts();
});
async function loadThoughts() {
    if (!item.value || !auth.user)
        return;
    isLoadingThoughts.value = true;
    try {
        const res = await thoughtsApi.getForTarget('item', item.value.id, auth.user.id);
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
    editRating.value = data.userRating ?? 0;
    editName.value = data.name ?? '';
    editType.value = data.type ?? 'custom';
    editBrand.value = data.brand ?? '';
    editNotes.value = data.userNotes ?? data.aiSummary ?? '';
    editVenueName.value = data.venue?.name ?? '';
    editVenueAddress.value = data.venue?.address ?? '';
    editTags.value = [...(data.tags ?? [])];
}
function startEditing() {
    if (item.value)
        resetEditFields(item.value);
    pendingPhotoDeletes.value = new Set();
    pendingPhotoAdds.value = [];
    isEditing.value = true;
    venuesStore.loadVenues(undefined, true);
    loadSuggestions();
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
    if (!item.value)
        throw new Error('No item');
    const { data } = await itemsApi.getPhotoUploadUrl(item.value.id, file.name);
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
function addTag() {
    const tag = newTag.value.trim().toLowerCase();
    if (tag && !editTags.value.includes(tag)) {
        editTags.value.push(tag);
    }
    newTag.value = '';
}
function removeTag(tag) {
    editTags.value = editTags.value.filter(t => t !== tag);
}
async function save() {
    if (!item.value)
        return;
    isSaving.value = true;
    try {
        // Delete marked photos
        for (const url of pendingPhotoDeletes.value) {
            try {
                const { data } = await itemsApi.removePhoto(item.value.id, url);
                item.value = data;
            }
            catch { /* continue with other ops */ }
        }
        // Upload and add new photos
        for (const pending of pendingPhotoAdds.value) {
            try {
                const blobUrl = await uploadNewPhoto(pending.file);
                const { data } = await itemsApi.addPhoto(item.value.id, blobUrl);
                item.value = data;
                URL.revokeObjectURL(pending.previewUrl);
            }
            catch { /* continue with other ops */ }
        }
        // Save other fields
        const updated = await itemsStore.updateItem(item.value.id, {
            name: editName.value || undefined,
            type: editType.value || undefined,
            brand: editBrand.value || undefined,
            userNotes: editNotes.value || undefined,
            venue: editVenueName.value ? {
                venueId: venuesStore.venues.find(v => v.name === editVenueName.value)?.id,
                name: editVenueName.value,
                address: editVenueAddress.value || undefined,
            } : undefined,
            userRating: editRating.value || undefined,
            tags: editTags.value,
            status: item.value.status,
        });
        item.value = updated;
        pendingPhotoDeletes.value = new Set();
        pendingPhotoAdds.value = [];
        isEditing.value = false;
    }
    finally {
        isSaving.value = false;
    }
}
async function addJournalEntry() {
    if (!item.value || !newJournalEntry.value.trim())
        return;
    isAddingNote.value = true;
    try {
        const updated = await itemsStore.updateItem(item.value.id, {
            journalEntry: newJournalEntry.value.trim(),
        });
        item.value = updated;
        newJournalEntry.value = '';
    }
    finally {
        isAddingNote.value = false;
    }
}
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        + ' at '
        + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
async function deleteItem() {
    if (!item.value)
        return;
    await itemsStore.deleteItem(item.value.id);
    router.push('/items');
}
function isAiGenerated(data) {
    return (data.aiConfidence != null && data.aiConfidence > 0);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (!__VLS_ctx.item) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 max-w-lg mx-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.item))
                    return;
                __VLS_ctx.router.back();
                // @ts-ignore
                [item, router,];
            } },
        ...{ class: "text-[#96BEE6] hover:text-white hover:opacity-80 text-sm min-h-[44px] min-w-[44px] px-2 py-2 transition-opacity" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:opacity-80']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-3" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
    if (!__VLS_ctx.isEditing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.startEditing) },
            ...{ class: "text-[#96BEE6] hover:text-[#96BEE6] p-2.5 min-h-[44px] min-w-[44px]" },
            title: "Edit",
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
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
            d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.showDeleteConfirm = true;
                    // @ts-ignore
                    [isEditing, startEditing, showDeleteConfirm,];
                } },
            ...{ class: "text-red-400 hover:text-red-300 p-2.5 min-h-[44px] min-w-[44px]" },
            title: "Delete",
        });
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-red-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
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
            d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.save) },
            disabled: (__VLS_ctx.isSaving),
            ...{ class: "text-green-400 hover:text-green-300 disabled:text-[#4a7aa5]/60 p-2.5 min-h-[44px] min-w-[44px]" },
            title: "Save",
        });
        /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-green-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:text-[#4a7aa5]/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
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
            d: "M5 13l4 4L19 7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.isEditing = false;
                    // @ts-ignore
                    [isEditing, save, isSaving,];
                } },
            ...{ class: "text-[#96BEE6] hover:text-white p-2.5 min-h-[44px] min-w-[44px]" },
            title: "Cancel",
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
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
    }
    if (!__VLS_ctx.isEditing && __VLS_ctx.item.photoUrls.length) {
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
        for (const [url, i] of __VLS_vFor((__VLS_ctx.item.photoUrls))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.item))
                            return;
                        if (!(!__VLS_ctx.isEditing && __VLS_ctx.item.photoUrls.length))
                            return;
                        __VLS_ctx.openLightbox(url);
                        // @ts-ignore
                        [item, item, isEditing, openLightbox,];
                    } },
                key: (i),
                src: (url),
                ...{ class: "h-48 object-cover rounded-xl cursor-pointer hover:ring-2 hover:ring-[#1e407c] transition-all" },
            });
            /** @type {__VLS_StyleScopedClasses['h-48']} */ ;
            /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:ring-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:ring-[#1e407c]']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.isEditing) {
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
        for (const [url, i] of __VLS_vFor((__VLS_ctx.item.photoUrls))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: ('existing-' + i),
                ...{ class: "relative flex-shrink-0 group" },
            });
            /** @type {__VLS_StyleScopedClasses['relative']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['group']} */ ;
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
                            if (!!(!__VLS_ctx.item))
                                return;
                            if (!(__VLS_ctx.isEditing))
                                return;
                            if (!(!__VLS_ctx.pendingPhotoDeletes.has(url)))
                                return;
                            __VLS_ctx.markPhotoForDelete(url);
                            // @ts-ignore
                            [item, isEditing, pendingPhotoDeletes, pendingPhotoDeletes, markPhotoForDelete,];
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
                            if (!!(!__VLS_ctx.item))
                                return;
                            if (!(__VLS_ctx.isEditing))
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
                        if (!!(!__VLS_ctx.item))
                            return;
                        if (!(__VLS_ctx.isEditing))
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
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    (__VLS_ctx.item.type);
    if (__VLS_ctx.item.status === 'ai-draft') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#96BEE6] ml-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-2xl font-bold mt-2" },
    });
    /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    (__VLS_ctx.item.name);
    if (__VLS_ctx.item.brand) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        (__VLS_ctx.item.brand);
    }
    if (!__VLS_ctx.isEditing && (__VLS_ctx.item.userNotes || __VLS_ctx.item.aiSummary)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-[#96BEE6]/70 uppercase tracking-wide" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        if (__VLS_ctx.isAiGenerated(__VLS_ctx.item) && !__VLS_ctx.item.userNotes && __VLS_ctx.item.aiSummary) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-xs text-[#96BEE6]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-white/80 whitespace-pre-line" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['whitespace-pre-line']} */ ;
        (__VLS_ctx.item.userNotes || __VLS_ctx.item.aiSummary);
        if (__VLS_ctx.item.aiConfidence) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#4a7aa5]/60 mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            (Math.round(__VLS_ctx.item.aiConfidence * 100));
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 mb-4 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    if (!__VLS_ctx.isEditing && __VLS_ctx.item.userRating) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#96BEE6]/70 uppercase tracking-wide w-16" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        const __VLS_0 = StarRating;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            rating: (__VLS_ctx.item.userRating),
            size: "md",
        }));
        const __VLS_2 = __VLS_1({
            rating: (__VLS_ctx.item.userRating),
            size: "md",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        (__VLS_ctx.item.userRating);
    }
    if (__VLS_ctx.item.venue) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-start gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#96BEE6]/70 uppercase tracking-wide w-16 pt-0.5" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-0.5']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-white/80" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        (__VLS_ctx.item.venue.name);
        if (__VLS_ctx.item.venue.address) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#96BEE6]/70" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            (__VLS_ctx.item.venue.address);
        }
    }
    if (__VLS_ctx.item.captureId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#96BEE6]/70 uppercase tracking-wide w-16" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
        /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        let __VLS_5;
        /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
        routerLink;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            to: (`/history/${__VLS_ctx.item.captureId}`),
            ...{ class: "text-sm text-[#96BEE6] hover:text-[#96BEE6] transition-colors" },
        }));
        const __VLS_7 = __VLS_6({
            to: (`/history/${__VLS_ctx.item.captureId}`),
            ...{ class: "text-sm text-[#96BEE6] hover:text-[#96BEE6] transition-colors" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        const { default: __VLS_10 } = __VLS_8.slots;
        // @ts-ignore
        [item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, isEditing, isEditing, triggerPhotoUpload, isUploadingPhoto, onPhotoFilesSelected, isAiGenerated,];
        var __VLS_8;
    }
    if (!__VLS_ctx.isEditing) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-6" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-sm font-medium text-[#96BEE6] mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        if (__VLS_ctx.item.journal?.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-3 mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
            for (const [entry, i] of __VLS_vFor((__VLS_ctx.item.journal))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (i),
                    ...{ class: "border-l-2 border-[#1e407c]/50 pl-3" },
                });
                /** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
                /** @type {__VLS_StyleScopedClasses['pl-3']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-sm text-white/80" },
                });
                /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
                (entry.text);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#4a7aa5]/60 mt-1" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
                (__VLS_ctx.formatDate(entry.date));
                if (entry.source === 'capture') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "text-[#4a7aa5]/40 ml-1" },
                    });
                    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/40']} */ ;
                    /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
                }
                // @ts-ignore
                [item, item, isEditing, formatDate,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#4a7aa5]/60 mb-4" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
            ...{ onKeydown: (__VLS_ctx.addJournalEntry) },
            ...{ onKeydown: (__VLS_ctx.addJournalEntry) },
            value: (__VLS_ctx.newJournalEntry),
            rows: "2",
            placeholder: "Add a thought...",
            ...{ class: "flex-1 bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2 text-sm text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] resize-none" },
        });
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.addJournalEntry) },
            disabled: (!__VLS_ctx.newJournalEntry.trim() || __VLS_ctx.isAddingNote),
            ...{ class: "self-end px-4 py-2 bg-[#0a2a52] hover:bg-[#1e407c] disabled:opacity-30 text-[#96BEE6] rounded-xl text-sm font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['self-end']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.isAddingNote ? '...' : 'Add');
    }
    else {
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
        const __VLS_11 = AutocompleteInput;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            modelValue: (__VLS_ctx.editName),
            suggestions: (__VLS_ctx.nameSuggestions),
            placeholder: "Item name",
        }));
        const __VLS_13 = __VLS_12({
            modelValue: (__VLS_ctx.editName),
            suggestions: (__VLS_ctx.nameSuggestions),
            placeholder: "Item name",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        for (const [opt] of __VLS_vFor((__VLS_ctx.typeOptions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.item))
                            return;
                        if (!!(!__VLS_ctx.isEditing))
                            return;
                        __VLS_ctx.editType = opt.value;
                        // @ts-ignore
                        [addJournalEntry, addJournalEntry, addJournalEntry, newJournalEntry, newJournalEntry, isAddingNote, isAddingNote, editName, nameSuggestions, typeOptions, editType,];
                    } },
                key: (opt.value),
                ...{ class: "px-3 py-1.5 rounded-full text-xs border transition-colors" },
                ...{ class: (__VLS_ctx.editType === opt.value
                        ? 'bg-[#1e407c] border-[#1e407c] text-white'
                        : 'bg-[#0a2a52] border-[#1e407c]/50 text-[#96BEE6]') },
            });
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            (opt.label);
            // @ts-ignore
            [editType,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        const __VLS_16 = AutocompleteInput;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
            modelValue: (__VLS_ctx.editBrand),
            suggestions: (__VLS_ctx.brandSuggestions),
            placeholder: "e.g. Four Roses",
        }));
        const __VLS_18 = __VLS_17({
            modelValue: (__VLS_ctx.editBrand),
            suggestions: (__VLS_ctx.brandSuggestions),
            placeholder: "e.g. Four Roses",
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
            value: (__VLS_ctx.editNotes),
            rows: "3",
            placeholder: "Tasting notes, impressions, details...",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] resize-none" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-1" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
        const __VLS_21 = AutocompleteInput;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
            ...{ 'onUpdate:modelValue': {} },
            ...{ 'onSelect': {} },
            modelValue: (__VLS_ctx.editVenueName),
            suggestions: (__VLS_ctx.venueSuggestions),
            placeholder: "e.g. Rare Books Bar",
        }));
        const __VLS_23 = __VLS_22({
            ...{ 'onUpdate:modelValue': {} },
            ...{ 'onSelect': {} },
            modelValue: (__VLS_ctx.editVenueName),
            suggestions: (__VLS_ctx.venueSuggestions),
            placeholder: "e.g. Rare Books Bar",
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        let __VLS_26;
        const __VLS_27 = ({ 'update:modelValue': {} },
            { 'onUpdate:modelValue': (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.editVenueName = $event;
                    // @ts-ignore
                    [editBrand, brandSuggestions, editNotes, editVenueName, editVenueName, venueSuggestions,];
                } });
        const __VLS_28 = ({ select: {} },
            { onSelect: (__VLS_ctx.onVenueSelected) });
        var __VLS_24;
        var __VLS_25;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            value: (__VLS_ctx.editVenueAddress),
            type: "text",
            placeholder: "Address (optional)",
            ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] mt-2" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        const __VLS_29 = StarRating;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
            ...{ 'onUpdate:rating': {} },
            rating: (__VLS_ctx.editRating),
            size: "lg",
            interactive: true,
        }));
        const __VLS_31 = __VLS_30({
            ...{ 'onUpdate:rating': {} },
            rating: (__VLS_ctx.editRating),
            size: "lg",
            interactive: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        let __VLS_34;
        const __VLS_35 = ({ 'update:rating': {} },
            { 'onUpdate:rating': (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!!(!__VLS_ctx.isEditing))
                        return;
                    __VLS_ctx.editRating = $event;
                    // @ts-ignore
                    [onVenueSelected, editVenueAddress, editRating, editRating,];
                } });
        var __VLS_32;
        var __VLS_33;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-sm text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        (__VLS_ctx.editRating > 0 ? __VLS_ctx.editRating : '');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "block text-sm text-[#96BEE6] mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap gap-2 mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        for (const [tag] of __VLS_vFor((__VLS_ctx.editTags))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (tag),
                ...{ class: "inline-flex items-center gap-1 text-sm bg-[#0a2a52] text-white/80 px-3 py-1 rounded-full" },
            });
            /** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            (tag);
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.item))
                            return;
                        if (!!(!__VLS_ctx.isEditing))
                            return;
                        __VLS_ctx.removeTag(tag);
                        // @ts-ignore
                        [editRating, editRating, editTags, removeTag,];
                    } },
                ...{ class: "text-[#96BEE6]/70 hover:text-red-400 ml-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        const __VLS_36 = AutocompleteInput;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            ...{ 'onKeydown': {} },
            modelValue: (__VLS_ctx.newTag),
            suggestions: (__VLS_ctx.tagSuggestions.filter(t => !__VLS_ctx.editTags.includes(t))),
            placeholder: "Add a tag...",
            inputClass: "flex-1 bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2 text-sm text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]",
        }));
        const __VLS_38 = __VLS_37({
            ...{ 'onKeydown': {} },
            modelValue: (__VLS_ctx.newTag),
            suggestions: (__VLS_ctx.tagSuggestions.filter(t => !__VLS_ctx.editTags.includes(t))),
            placeholder: "Add a tag...",
            inputClass: "flex-1 bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-2 text-sm text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        let __VLS_41;
        const __VLS_42 = ({ keydown: {} },
            { onKeydown: (__VLS_ctx.addTag) });
        var __VLS_39;
        var __VLS_40;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.addTag) },
            disabled: (!__VLS_ctx.newTag.trim()),
            ...{ class: "px-4 bg-[#0a2a52] hover:bg-[#1e407c] disabled:opacity-30 text-[#96BEE6] rounded-xl text-sm font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-30']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    }
    if (!__VLS_ctx.isEditing && __VLS_ctx.item.tags.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mt-4 flex gap-2 flex-wrap" },
        });
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        for (const [tag] of __VLS_vFor((__VLS_ctx.item.tags))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (tag),
                ...{ class: "text-xs bg-[#0a2a52] text-[#96BEE6] px-2 py-1 rounded-full" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            (tag);
            // @ts-ignore
            [item, item, isEditing, editTags, newTag, newTag, tagSuggestions, addTag, addTag,];
        }
    }
    if (!__VLS_ctx.isEditing && __VLS_ctx.friendThoughts.length > 0) {
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
        const __VLS_43 = ThoughtsList;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
            ...{ 'onDelete': {} },
            thoughts: (__VLS_ctx.friendThoughts),
        }));
        const __VLS_45 = __VLS_44({
            ...{ 'onDelete': {} },
            thoughts: (__VLS_ctx.friendThoughts),
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        let __VLS_48;
        const __VLS_49 = ({ delete: {} },
            { onDelete: (__VLS_ctx.handleDeleteThought) });
        var __VLS_46;
        var __VLS_47;
    }
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
    Teleport;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        to: "body",
    }));
    const __VLS_52 = __VLS_51({
        to: "body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const { default: __VLS_55 } = __VLS_53.slots;
    if (__VLS_ctx.showDeleteConfirm) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!(__VLS_ctx.showDeleteConfirm))
                        return;
                    __VLS_ctx.showDeleteConfirm = false;
                    // @ts-ignore
                    [isEditing, showDeleteConfirm, showDeleteConfirm, friendThoughts, friendThoughts, friendThoughts, handleDeleteThought,];
                } },
            ...{ class: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#041e3e] border border-[#1e407c]/50 rounded-2xl p-6 w-full max-w-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-lg font-semibold text-red-400 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-white/80 mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.item.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 justify-end" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!(__VLS_ctx.showDeleteConfirm))
                        return;
                    __VLS_ctx.showDeleteConfirm = false;
                    // @ts-ignore
                    [item, showDeleteConfirm,];
                } },
            ...{ class: "px-4 py-2 text-sm rounded-xl bg-[#0a2a52] text-[#96BEE6] hover:bg-[#1e407c]" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.deleteItem) },
            ...{ class: "px-4 py-2 text-sm rounded-xl bg-red-700 text-white hover:bg-red-600" },
        });
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-red-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-red-600']} */ ;
    }
    // @ts-ignore
    [deleteItem,];
    var __VLS_53;
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
    Teleport;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        to: "body",
    }));
    const __VLS_58 = __VLS_57({
        to: "body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const { default: __VLS_61 } = __VLS_59.slots;
    if (__VLS_ctx.lightboxUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_ctx.closeLightbox) },
            ...{ onWheel: (__VLS_ctx.onLightboxWheel) },
            ...{ class: "fixed inset-0 bg-black/80 flex items-center justify-center z-50" },
        });
        /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
        /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.closeLightbox) },
            ...{ class: "absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full w-10 h-10 flex items-center justify-center text-xl z-10" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/40']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 rounded-full px-4 py-2 z-10" },
        });
        /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
        /** @type {__VLS_StyleScopedClasses['bottom-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!(__VLS_ctx.lightboxUrl))
                        return;
                    __VLS_ctx.lightboxScale = Math.max(__VLS_ctx.lightboxScale - 0.25, 0.5);
                    // @ts-ignore
                    [lightboxUrl, closeLightbox, closeLightbox, onLightboxWheel, lightboxScale, lightboxScale,];
                } },
            ...{ class: "text-white/70 hover:text-white text-lg w-8 h-8 flex items-center justify-center" },
        });
        /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.resetLightboxZoom) },
            ...{ class: "text-xs text-white/70 hover:text-white px-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
        (Math.round(__VLS_ctx.lightboxScale * 100));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.item))
                        return;
                    if (!(__VLS_ctx.lightboxUrl))
                        return;
                    __VLS_ctx.lightboxScale = Math.min(__VLS_ctx.lightboxScale + 0.25, 5);
                    // @ts-ignore
                    [lightboxScale, lightboxScale, lightboxScale, resetLightboxZoom,];
                } },
            ...{ class: "text-white/70 hover:text-white text-lg w-8 h-8 flex items-center justify-center" },
        });
        /** @type {__VLS_StyleScopedClasses['text-white/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-8']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
        if (__VLS_ctx.item.photoUrls.length > 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.item))
                            return;
                        if (!(__VLS_ctx.lightboxUrl))
                            return;
                        if (!(__VLS_ctx.item.photoUrls.length > 1))
                            return;
                        __VLS_ctx.openLightbox(__VLS_ctx.item.photoUrls[(__VLS_ctx.item.photoUrls.indexOf(__VLS_ctx.lightboxUrl) - 1 + __VLS_ctx.item.photoUrls.length) % __VLS_ctx.item.photoUrls.length]);
                        // @ts-ignore
                        [item, item, item, item, item, openLightbox, lightboxUrl,];
                    } },
                ...{ class: "absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/30 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-10" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        }
        if (__VLS_ctx.item.photoUrls.length > 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.item))
                            return;
                        if (!(__VLS_ctx.lightboxUrl))
                            return;
                        if (!(__VLS_ctx.item.photoUrls.length > 1))
                            return;
                        __VLS_ctx.openLightbox(__VLS_ctx.item.photoUrls[(__VLS_ctx.item.photoUrls.indexOf(__VLS_ctx.lightboxUrl) + 1) % __VLS_ctx.item.photoUrls.length]);
                        // @ts-ignore
                        [item, item, item, item, openLightbox, lightboxUrl,];
                    } },
                ...{ class: "absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/30 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-10" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['right-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-black/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-10']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['z-10']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ onTouchstart: (__VLS_ctx.onLightboxTouchStart) },
            ...{ onTouchmove: (__VLS_ctx.onLightboxTouchMove) },
            ...{ onTouchend: (__VLS_ctx.onLightboxTouchEnd) },
            ...{ onClick: () => { } },
            src: (__VLS_ctx.lightboxUrl),
            ...{ class: "max-w-[90vw] max-h-[80vh] rounded-2xl object-contain select-none" },
            ...{ style: ({
                    transform: `scale(${__VLS_ctx.lightboxScale}) translate(${__VLS_ctx.lightboxTranslateX / __VLS_ctx.lightboxScale}px, ${__VLS_ctx.lightboxTranslateY / __VLS_ctx.lightboxScale}px)`,
                    transition: __VLS_ctx.isPanning ? 'none' : 'transform 0.15s ease'
                }) },
            draggable: "false",
        });
        /** @type {__VLS_StyleScopedClasses['max-w-[90vw]']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-h-[80vh]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-contain']} */ ;
        /** @type {__VLS_StyleScopedClasses['select-none']} */ ;
        if (__VLS_ctx.item.photoUrls.length > 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/50" },
            });
            /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
            /** @type {__VLS_StyleScopedClasses['top-4']} */ ;
            /** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['-translate-x-1/2']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white/50']} */ ;
            (__VLS_ctx.item.photoUrls.indexOf(__VLS_ctx.lightboxUrl) + 1);
            (__VLS_ctx.item.photoUrls.length);
        }
    }
    // @ts-ignore
    [item, item, item, lightboxUrl, lightboxUrl, lightboxScale, lightboxScale, lightboxScale, onLightboxTouchStart, onLightboxTouchMove, onLightboxTouchEnd, lightboxTranslateX, lightboxTranslateY, isPanning,];
    var __VLS_59;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
