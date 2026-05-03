/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
const props = defineProps();
const emit = defineEmits();
const content = ref('');
const rating = ref(undefined);
const isSubmitting = ref(false);
async function submit() {
    if (!content.value.trim())
        return;
    isSubmitting.value = true;
    try {
        emit('submit', {
            content: content.value.trim(),
            rating: props.showRating ? rating.value : undefined,
        });
        content.value = '';
        rating.value = undefined;
    }
    finally {
        isSubmitting.value = false;
    }
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 space-y-3" },
});
/** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
    value: (__VLS_ctx.content),
    placeholder: "Share your thoughts...",
    maxlength: "500",
    rows: "3",
    ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] resize-none" },
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
/** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
if (props.showRating) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs text-[#5a8ab5]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
    for (const [star] of __VLS_vFor((5))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(props.showRating))
                        return;
                    __VLS_ctx.rating = __VLS_ctx.rating === star ? undefined : star;
                    // @ts-ignore
                    [content, rating, rating,];
                } },
            key: (star),
            ...{ class: "text-lg" },
            ...{ class: (__VLS_ctx.rating && star <= __VLS_ctx.rating ? 'text-[#96BEE6]' : 'text-[#1e407c]/50') },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        // @ts-ignore
        [rating, rating,];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.submit) },
    disabled: (!__VLS_ctx.content.trim() || __VLS_ctx.isSubmitting),
    ...{ class: "bg-[#1e407c] hover:bg-[#2a5299] disabled:bg-[#0a2a52] disabled:text-[#4a7aa5]/60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:bg-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:text-[#4a7aa5]/60']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
(__VLS_ctx.isSubmitting ? 'Posting...' : 'Post');
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "text-xs text-[#4a7aa5] text-right" },
});
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
(__VLS_ctx.content.length);
// @ts-ignore
[content, content, submit, isSubmitting, isSubmitting,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
