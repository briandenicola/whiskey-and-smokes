/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { useChartTheme } from '../../composables/useChartTheme';
use([BarChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);
const { theme } = useChartTheme();
const props = defineProps();
const chartOption = computed(() => {
    const ratings = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    const drinkData = ratings.map(r => {
        const bucket = props.buckets.find(b => b.rating === r && b.category === 'drink');
        return bucket?.count ?? 0;
    });
    const dessertData = ratings.map(r => {
        const bucket = props.buckets.find(b => b.rating === r && b.category === 'dessert');
        return bucket?.count ?? 0;
    });
    return {
        ...theme,
        tooltip: {
            ...theme.tooltip,
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
        },
        legend: {
            ...theme.legend,
            data: ['Drinks', 'Desserts'],
            bottom: 0,
        },
        grid: {
            left: '3%',
            right: '4%',
            top: '10%',
            bottom: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: ratings.map(String),
            ...theme.categoryAxis,
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            ...theme.valueAxis,
        },
        series: [
            {
                name: 'Drinks',
                type: 'bar',
                stack: 'total',
                data: drinkData,
                itemStyle: { color: '#96BEE6' },
                barMaxWidth: 24,
            },
            {
                name: 'Desserts',
                type: 'bar',
                stack: 'total',
                data: dessertData,
                itemStyle: { color: '#d4956a' },
                barMaxWidth: 24,
            },
        ],
    };
});
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
if (!__VLS_ctx.buckets.length) {
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
[buckets, chartOption,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
