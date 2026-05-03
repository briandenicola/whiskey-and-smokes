/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
const props = defineProps();
const emit = defineEmits();
const categoryOptions = [
    { label: 'All Types', value: '' },
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
const ratingOptions = [
    { label: 'Any Rating', value: 0 },
    { label: '1+ Stars', value: 1 },
    { label: '2+ Stars', value: 2 },
    { label: '3+ Stars', value: 3 },
    { label: '4+ Stars', value: 4 },
    { label: '5 Stars', value: 5 },
];
const category = computed({
    get: () => props.modelValue.category ?? '',
    set: (v) => emit('update:modelValue', { ...props.modelValue, category: v || undefined }),
});
const minRating = computed({
    get: () => props.modelValue.minRating,
    set: (v) => emit('update:modelValue', { ...props.modelValue, minRating: v }),
});
const labels = computed({
    get: () => props.modelValue.labels,
    set: (v) => emit('update:modelValue', { ...props.modelValue, labels: v }),
});
const hasActiveFilters = computed(() => !!props.modelValue.category || props.modelValue.minRating > 0 || props.modelValue.labels.trim() !== '');
function clearAll() {
    emit('update:modelValue', { category: undefined, minRating: 0, labels: '' });
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "w-60 shrink-0 bg-[#041e3e] border-r border-[#0a2a52] p-4 overflow-y-auto" },
});
/** @type {__VLS_StyleScopedClasses['w-60']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-sm font-semibold text-white uppercase tracking-wider" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wider']} */ ;
if (__VLS_ctx.hasActiveFilters) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearAll) },
        ...{ class: "text-xs text-[#96BEE6] hover:text-white transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-5" },
});
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-xs font-medium text-[#96BEE6]/80 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.category),
    ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e407c] appearance-none" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
/** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
for (const [opt] of __VLS_vFor((__VLS_ctx.categoryOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (opt.value),
        value: (opt.value),
    });
    (opt.label);
    // @ts-ignore
    [hasActiveFilters, clearAll, category, categoryOptions,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-5" },
});
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-xs font-medium text-[#96BEE6]/80 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.minRating),
    ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1e407c] appearance-none" },
});
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
/** @type {__VLS_StyleScopedClasses['appearance-none']} */ ;
for (const [opt] of __VLS_vFor((__VLS_ctx.ratingOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (opt.value),
        value: (opt.value),
    });
    (opt.label);
    // @ts-ignore
    [minRating, ratingOptions,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mb-5" },
});
/** @type {__VLS_StyleScopedClasses['mb-5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "block text-xs font-medium text-[#96BEE6]/80 mb-2" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    placeholder: "Search tags...",
    ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]" },
});
(__VLS_ctx.labels);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder-[#4a7aa5]']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
// @ts-ignore
[labels,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
