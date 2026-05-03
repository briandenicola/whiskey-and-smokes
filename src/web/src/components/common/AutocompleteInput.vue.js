/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, onUnmounted } from 'vue';
const props = defineProps();
const emit = defineEmits();
const showDropdown = ref(false);
const wrapperRef = ref();
const filtered = computed(() => {
    const q = props.modelValue.toLowerCase().trim();
    if (!q)
        return props.suggestions.slice(0, 8);
    return props.suggestions
        .filter(s => s.toLowerCase().includes(q))
        .slice(0, 8);
});
function select(value) {
    emit('update:modelValue', value);
    emit('select', value);
    showDropdown.value = false;
}
function onInput(e) {
    emit('update:modelValue', e.target.value);
    showDropdown.value = true;
}
function onFocus() {
    if (props.suggestions.length)
        showDropdown.value = true;
}
function closeOnClickOutside(e) {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
        showDropdown.value = false;
    }
}
onMounted(() => document.addEventListener('click', closeOnClickOutside));
onUnmounted(() => document.removeEventListener('click', closeOnClickOutside));
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "wrapperRef",
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (__VLS_ctx.onInput) },
    ...{ onFocus: (__VLS_ctx.onFocus) },
    ref: "inputRef",
    value: (__VLS_ctx.modelValue),
    placeholder: (__VLS_ctx.placeholder),
    ...{ class: (__VLS_ctx.inputClass || 'w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c]') },
});
if (__VLS_ctx.showDropdown && __VLS_ctx.filtered.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute left-0 right-0 top-full mt-1 bg-[#041e3e] border border-[#1e407c]/50 rounded-xl overflow-hidden shadow-lg z-20 max-h-48 overflow-y-auto" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-20']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-48']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.filtered))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onMousedown: (...[$event]) => {
                    if (!(__VLS_ctx.showDropdown && __VLS_ctx.filtered.length))
                        return;
                    __VLS_ctx.select(item);
                    // @ts-ignore
                    [onInput, onFocus, modelValue, placeholder, inputClass, showDropdown, filtered, filtered, select,];
                } },
            key: (item),
            ...{ class: "w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-[#0a2a52] transition-colors truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (item);
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
