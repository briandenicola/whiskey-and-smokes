/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { use } from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import { CalendarComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { useChartTheme } from '../../composables/useChartTheme';
use([HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent, SVGRenderer]);
const { theme } = useChartTheme();
const props = defineProps();
const chartOption = computed(() => {
    // Build a year's worth of calendar data from monthlyTrend
    const now = new Date();
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const yearStart = `${yearAgo.getFullYear()}-${String(yearAgo.getMonth() + 1).padStart(2, '0')}-${String(yearAgo.getDate()).padStart(2, '0')}`;
    const yearEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    // Create synthetic data points from activityByDay (weekday counts)
    const dayMap = {};
    for (const d of props.activityByDay) {
        dayMap[d.day] = d.count;
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const current = new Date(yearAgo);
    while (current <= now) {
        const dayName = dayNames[current.getDay()];
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        // Distribute activity proportionally
        const dayCount = dayMap[dayName] ?? 0;
        data.push([dateStr, dayCount > 0 ? Math.max(1, Math.round(dayCount / 4)) : 0]);
        current.setDate(current.getDate() + 1);
    }
    const maxVal = Math.max(1, ...data.map(d => d[1]));
    return {
        tooltip: {
            ...theme.tooltip,
            formatter: (params) => {
                return `${params.value[0]}: ${params.value[1]} capture${params.value[1] !== 1 ? 's' : ''}`;
            },
        },
        visualMap: {
            min: 0,
            max: maxVal,
            show: false,
            inRange: {
                color: ['#0a2a52', '#1e407c', '#2a5299', '#96BEE6'],
            },
        },
        calendar: {
            range: [yearStart, yearEnd],
            cellSize: [14, 14],
            itemStyle: {
                borderWidth: 2,
                borderColor: '#001E44',
            },
            dayLabel: { color: '#4a7aa5' },
            monthLabel: { color: '#4a7aa5' },
            yearLabel: { show: false },
            splitLine: { lineStyle: { color: '#0a2a52' } },
        },
        series: [
            {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data,
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
if (!__VLS_ctx.activityByDay.some(d => d.count > 0)) {
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
[activityByDay, chartOption,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
