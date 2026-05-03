/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { useChartTheme } from '../../composables/useChartTheme';
use([PieChart, TooltipComponent, LegendComponent, SVGRenderer]);
const { theme } = useChartTheme();
const props = defineProps();
const drinkTypes = new Set(['whiskey', 'wine', 'cocktail', 'vodka', 'gin', 'espresso', 'latte', 'cappuccino', 'cold-brew', 'pour-over', 'coffee']);
const chartOption = computed(() => {
    const drinks = props.typeBreakdown.filter(t => drinkTypes.has(t.type));
    const desserts = props.typeBreakdown.filter(t => t.type === 'dessert');
    const other = props.typeBreakdown.filter(t => !drinkTypes.has(t.type) && t.type !== 'dessert');
    const data = [
        ...drinks.map(t => ({ name: capitalize(t.type), value: t.count })),
        ...desserts.map(t => ({ name: 'Dessert', value: t.count })),
        ...other.map(t => ({ name: capitalize(t.type), value: t.count })),
    ];
    return {
        tooltip: {
            ...theme.tooltip,
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        legend: {
            ...theme.legend,
            orient: 'horizontal',
            bottom: 0,
        },
        series: [
            {
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 4, borderColor: '#041e3e', borderWidth: 2 },
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 14, color: '#96BEE6' },
                },
                data,
            },
        ],
    };
});
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4 space-y-3" },
});
/** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "text-sm font-medium text-[#96BEE6] uppercase tracking-wide" },
});
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
if (!__VLS_ctx.typeBreakdown.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center py-6 text-[#96BEE6]/50 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
}
else {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
    vChart;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        option: (__VLS_ctx.chartOption),
        ...{ style: {} },
        autoresize: true,
    }));
    const __VLS_2 = __VLS_1({
        option: (__VLS_ctx.chartOption),
        ...{ style: {} },
        autoresize: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
// @ts-ignore
[typeBreakdown, chartOption,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
