/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { useChartTheme } from '../../composables/useChartTheme';
use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);
const { theme } = useChartTheme();
const props = defineProps();
const chartOption = computed(() => {
    const months = props.ratingTrend.map(m => m.month);
    const ratings = props.ratingTrend.map(m => m.avgRating || null);
    return {
        tooltip: {
            ...theme.tooltip,
            trigger: 'axis',
        },
        grid: {
            left: '3%', right: '4%', top: '10%', bottom: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: months,
            ...theme.categoryAxis,
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 5,
            ...theme.valueAxis,
        },
        series: [
            {
                type: 'line',
                data: ratings,
                smooth: true,
                lineStyle: { color: '#96BEE6', width: 3 },
                itemStyle: { color: '#96BEE6' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(150,190,230,0.3)' },
                            { offset: 1, color: 'rgba(150,190,230,0.05)' },
                        ],
                    },
                },
                connectNulls: true,
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
if (!__VLS_ctx.ratingTrend.some(m => m.count > 0)) {
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
[ratingTrend, chartOption,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
