/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    size: 'md',
    interactive: false,
});
const emit = defineEmits();
const svgSizeClass = computed(() => ({
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
}[props.size]));
const tapTargetClass = computed(() => ({
    sm: '',
    md: '',
    lg: 'p-1.5',
}[props.size]));
const gapClass = computed(() => ({
    sm: 'gap-0.5',
    md: 'gap-0.5',
    lg: 'gap-0',
}[props.size]));
const stars = computed(() => {
    const result = [];
    let remaining = props.rating;
    for (let i = 0; i < 5; i++) {
        if (remaining >= 1) {
            result.push(1);
            remaining -= 1;
        }
        else if (remaining > 0) {
            result.push(Math.round(remaining * 4) / 4);
            remaining = 0;
        }
        else {
            result.push(0);
        }
    }
    return result;
});
function handleTap(starIndex, event) {
    if (!props.interactive)
        return;
    const target = event.currentTarget.querySelector('svg');
    if (!target)
        return;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    let quarter = Math.ceil(fraction * 4) / 4;
    if (quarter < 0.25)
        quarter = 0.25;
    const value = starIndex + quarter;
    emit('update:rating', value);
}
function clipId(starIdx) {
    return `star-clip-${starIdx}-${Math.round(stars.value[starIdx] * 100)}`;
}
const __VLS_defaults = {
    size: 'md',
    interactive: false,
};
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
    ...{ class: "flex items-center" },
    ...{ class: ([__VLS_ctx.gapClass, __VLS_ctx.interactive ? 'cursor-pointer select-none' : '']) },
    ...{ style: (__VLS_ctx.interactive ? 'touch-action: manipulation' : '') },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
for (const [fill, i] of __VLS_vFor((__VLS_ctx.stars))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onPointerup: (...[$event]) => {
                __VLS_ctx.handleTap(i, $event);
                // @ts-ignore
                [gapClass, interactive, interactive, stars, handleTap,];
            } },
        key: (i),
        ...{ class: (__VLS_ctx.tapTargetClass) },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: (__VLS_ctx.svgSizeClass) },
        viewBox: "0 0 20 20",
        ...{ style: {} },
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.clipPath, __VLS_intrinsics.clipPath)({
        id: (__VLS_ctx.clipId(i)),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        x: "0",
        y: "0",
        width: (fill * 20),
        height: "20",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "text-[#4a7aa5]/40" },
        fill: "currentColor",
        d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
    });
    /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/40']} */ ;
    if (fill > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            ...{ class: "text-[#96BEE6]" },
            fill: "currentColor",
            'clip-path': (`url(#${__VLS_ctx.clipId(i)})`),
            d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    }
    // @ts-ignore
    [tapTargetClass, svgSizeClass, clipId, clipId,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
