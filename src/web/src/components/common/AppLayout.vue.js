/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { provide } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRoute } from 'vue-router';
import { usePullToRefresh } from '../../composables/usePullToRefresh';
import { useBreakpoint } from '../../composables/useBreakpoint';
import { RefreshKey } from '../../composables/refreshKey';
import NotificationBell from './NotificationBell.vue';
import PwaInstallPrompt from './PwaInstallPrompt.vue';
import DesktopSidebar from './DesktopSidebar.vue';
const auth = useAuthStore();
const route = useRoute();
const { isDesktop } = useBreakpoint();
const isPwa = ('standalone' in window.navigator && window.navigator.standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;
const { isRefreshing, pullDistance, pullProgress, setRefreshCallback, onTouchStart, onTouchMove, onTouchEnd, } = usePullToRefresh();
// Views call this to register their refresh function
provide(RefreshKey, (fn) => setRefreshCallback(fn));
const navItems = [
    { name: 'Collection', path: '/items' },
    { name: 'Venues', path: '/venues' },
    { name: 'Capture', path: '/capture' },
    { name: 'Search', path: '/search' },
    { name: 'Profile', path: '/profile' },
];
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "min-h-screen flex flex-col" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
if (__VLS_ctx.isDesktop && __VLS_ctx.auth.isAuthenticated) {
    const __VLS_0 = DesktopSidebar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "bg-[#041e3e] border-b border-[#0a2a52] px-4 py-3 flex items-center justify-between safe-area-top" },
    ...{ class: ({ 'lg:ml-64': __VLS_ctx.isDesktop && __VLS_ctx.auth.isAuthenticated, 'lg:hidden': __VLS_ctx.isDesktop && __VLS_ctx.auth.isAuthenticated }) },
});
/** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['safe-area-top']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:ml-64']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-lg font-bold text-[#96BEE6]" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-3" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
if (__VLS_ctx.auth.isAuthenticated) {
    let __VLS_5;
    /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
    routerLink;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        to: "/friends",
        ...{ class: "text-[#96BEE6] hover:text-white" },
    }));
    const __VLS_7 = __VLS_6({
        to: "/friends",
        ...{ class: "text-[#96BEE6] hover:text-white" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    const { default: __VLS_10 } = __VLS_8.slots;
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
        d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    });
    // @ts-ignore
    [isDesktop, isDesktop, isDesktop, auth, auth, auth, auth,];
    var __VLS_8;
}
if (__VLS_ctx.auth.isAuthenticated) {
    const __VLS_11 = NotificationBell;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
    const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
}
if (__VLS_ctx.auth.isAuthenticated) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.auth.isAuthenticated))
                    return;
                __VLS_ctx.auth.logout();
                // @ts-ignore
                [auth, auth, auth,];
            } },
        ...{ class: "text-[#96BEE6] hover:text-white" },
        ...{ class: (__VLS_ctx.isPwa ? 'p-1' : 'text-sm') },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    if (__VLS_ctx.isPwa) {
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
            d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-center overflow-hidden transition-all duration-200" },
    ...{ style: ({ height: __VLS_ctx.pullDistance + 'px' }) },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-center h-full" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
if (__VLS_ctx.isRefreshing) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "w-5 h-5 text-[#96BEE6] animate-spin" },
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
    });
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        ...{ class: "opacity-25" },
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    /** @type {__VLS_StyleScopedClasses['opacity-25']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        ...{ class: "opacity-75" },
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z",
    });
    /** @type {__VLS_StyleScopedClasses['opacity-75']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "w-5 h-5 text-[#96BEE6]/70 transition-transform duration-200" },
        ...{ style: ({ transform: `rotate(${__VLS_ctx.pullProgress * 180}deg)`, opacity: __VLS_ctx.pullProgress }) },
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        'stroke-width': "2",
    });
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        d: "M19 14l-7 7m0 0l-7-7m7 7V3",
    });
}
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ onTouchstart: (__VLS_ctx.onTouchStart) },
    ...{ onTouchmove: (__VLS_ctx.onTouchMove) },
    ...{ onTouchend: (__VLS_ctx.onTouchEnd) },
    ...{ class: "flex-1 overflow-y-auto transition-[margin] duration-300" },
    ...{ class: ([
            __VLS_ctx.isDesktop && __VLS_ctx.auth.isAuthenticated ? 'lg:ml-64' : 'pb-20',
            { 'pb-20': !__VLS_ctx.isDesktop }
        ]) },
});
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-[margin]']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-20']} */ ;
var __VLS_16 = {};
const __VLS_18 = PwaInstallPrompt;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
if (__VLS_ctx.auth.isAuthenticated && !__VLS_ctx.isDesktop) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "fixed bottom-0 inset-x-0 bg-[#041e3e] border-t border-[#0a2a52] safe-area-bottom" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['safe-area-bottom']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-around items-end pt-1 pb-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-around']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
        (item.path);
        if (item.path === '/capture') {
            let __VLS_23;
            /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
            routerLink;
            // @ts-ignore
            const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
                to: (item.path),
                ...{ class: "capture-fab flex flex-col items-center -mt-6" },
            }));
            const __VLS_25 = __VLS_24({
                to: (item.path),
                ...{ class: "capture-fab flex flex-col items-center -mt-6" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_24));
            /** @type {__VLS_StyleScopedClasses['capture-fab']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['-mt-6']} */ ;
            const { default: __VLS_28 } = __VLS_26.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all" },
                ...{ class: (__VLS_ctx.route.path === '/capture'
                        ? 'bg-[#96BEE6] shadow-[#1e407c]/30'
                        : 'bg-gradient-to-br from-[#1e407c] to-[#001E44] shadow-[#1e407c]/20 hover:shadow-[#1e407c]/30') },
            });
            /** @type {__VLS_StyleScopedClasses['w-14']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-14']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                ...{ class: "w-7 h-7 text-white" },
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            /** @type {__VLS_StyleScopedClasses['w-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['h-7']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "12",
                cy: "13",
                r: "3",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[10px] mt-1" },
                ...{ class: (__VLS_ctx.route.path === '/capture' ? 'text-[#96BEE6]' : 'text-[#96BEE6]/70') },
            });
            /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            // @ts-ignore
            [isDesktop, isDesktop, isDesktop, auth, auth, isPwa, isPwa, pullDistance, isRefreshing, pullProgress, pullProgress, onTouchStart, onTouchMove, onTouchEnd, navItems, route, route,];
            var __VLS_26;
        }
        else {
            let __VLS_29;
            /** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
            routerLink;
            // @ts-ignore
            const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
                to: (item.path),
                ...{ class: "flex flex-col items-center px-3 py-1 text-xs transition-colors" },
                ...{ class: (__VLS_ctx.route.path === item.path ? 'text-[#96BEE6]' : 'text-[#96BEE6]/70') },
            }));
            const __VLS_31 = __VLS_30({
                to: (item.path),
                ...{ class: "flex flex-col items-center px-3 py-1 text-xs transition-colors" },
                ...{ class: (__VLS_ctx.route.path === item.path ? 'text-[#96BEE6]' : 'text-[#96BEE6]/70') },
            }, ...__VLS_functionalComponentArgsRest(__VLS_30));
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            const { default: __VLS_34 } = __VLS_32.slots;
            if (item.path === '/items') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    ...{ class: "w-5 h-5 mb-0.5" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                });
            }
            else if (item.path === '/venues') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    ...{ class: "w-5 h-5 mb-0.5" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                });
            }
            else if (item.path === '/search') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    ...{ class: "w-5 h-5 mb-0.5" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                });
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    ...{ class: "w-5 h-5 mb-0.5" },
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    'stroke-width': "2",
                });
                /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
                /** @type {__VLS_StyleScopedClasses['mb-0.5']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                });
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (item.name);
            // @ts-ignore
            [route,];
            var __VLS_32;
        }
        // @ts-ignore
        [];
    }
}
// @ts-ignore
var __VLS_17 = __VLS_16;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({});
const __VLS_export = {};
export default {};
