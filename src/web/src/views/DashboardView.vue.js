/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { inject, onMounted } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import { RefreshKey } from '../composables/refreshKey';
import SummaryCards from '../components/dashboard/SummaryCards.vue';
import ActivityTimeline from '../components/dashboard/ActivityTimeline.vue';
import MonthlySnapshot from '../components/dashboard/MonthlySnapshot.vue';
import RatingsChart from '../components/dashboard/RatingsChart.vue';
const dashboard = useDashboardStore();
const registerRefresh = inject(RefreshKey);
registerRefresh?.(dashboard.loadAll);
onMounted(dashboard.loadAll);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-4 lg:p-6 max-w-6xl mx-auto space-y-6" },
});
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-xl font-semibold text-white" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
if (__VLS_ctx.dashboard.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center py-12 text-[#96BEE6]/70" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
}
else if (__VLS_ctx.dashboard.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center py-12 text-red-400" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    (__VLS_ctx.dashboard.error);
}
else if (__VLS_ctx.dashboard.summary) {
    if (__VLS_ctx.dashboard.summary.totalItems === 0 && __VLS_ctx.dashboard.summary.wishlistSize === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center py-12 text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-lg mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    else {
        const __VLS_0 = SummaryCards;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            summary: (__VLS_ctx.dashboard.summary),
        }));
        const __VLS_2 = __VLS_1({
            summary: (__VLS_ctx.dashboard.summary),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid lg:grid-cols-2 gap-6" },
        });
        /** @type {__VLS_StyleScopedClasses['grid']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
        if (__VLS_ctx.dashboard.thisMonth) {
            const __VLS_5 = MonthlySnapshot;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                snapshot: (__VLS_ctx.dashboard.thisMonth),
            }));
            const __VLS_7 = __VLS_6({
                snapshot: (__VLS_ctx.dashboard.thisMonth),
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        }
        const __VLS_10 = RatingsChart;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
            buckets: (__VLS_ctx.dashboard.ratingDistribution),
        }));
        const __VLS_12 = __VLS_11({
            buckets: (__VLS_ctx.dashboard.ratingDistribution),
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        const __VLS_15 = ActivityTimeline;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
            activities: (__VLS_ctx.dashboard.recentActivity),
        }));
        const __VLS_17 = __VLS_16({
            activities: (__VLS_ctx.dashboard.recentActivity),
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    }
}
// @ts-ignore
[dashboard, dashboard, dashboard, dashboard, dashboard, dashboard, dashboard, dashboard, dashboard, dashboard, dashboard,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
