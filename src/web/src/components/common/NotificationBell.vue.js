/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { notificationsApi } from '../../services/notifications';
const router = useRouter();
const unreadCount = ref(0);
const showDropdown = ref(false);
const notifications = ref([]);
const isLoading = ref(false);
async function loadCount() {
    try {
        const res = await notificationsApi.unreadCount();
        unreadCount.value = res.data.unreadCount;
        return true;
    }
    catch (e) {
        console.warn('Failed to load notification count', e);
        return false;
    }
}
async function loadCountWithRetry() {
    const ok = await loadCount();
    if (!ok) {
        // Token may not be ready yet on cold start — retry after a short delay
        setTimeout(loadCount, 3000);
    }
}
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        loadCount();
    }
}
async function toggleDropdown() {
    showDropdown.value = !showDropdown.value;
    if (showDropdown.value) {
        isLoading.value = true;
        try {
            const res = await notificationsApi.list(20);
            notifications.value = res.data.notifications;
            unreadCount.value = res.data.unreadCount;
        }
        catch (e) {
            console.warn('Failed to load notifications', e);
        }
        isLoading.value = false;
    }
}
async function markAllRead() {
    try {
        await notificationsApi.markAllRead();
        notifications.value.forEach(n => n.isRead = true);
        unreadCount.value = 0;
    }
    catch (e) {
        console.warn('Failed to mark notifications read', e);
    }
}
async function handleNotificationClick(n) {
    if (!n.isRead) {
        try {
            await notificationsApi.markRead(n.id);
            n.isRead = true;
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        catch (e) {
            console.warn('Failed to mark notification read', e);
        }
    }
    showDropdown.value = false;
    if (n.type === 'friend-request' || n.type === 'friend-accepted') {
        router.push('/friends');
    }
    else if (n.type === 'new-thought') {
        if (n.referenceType && n.referenceId) {
            // Navigate to the item/venue that got the thought
            router.push(`/${n.referenceType}s/${n.referenceId}`);
        }
    }
    else if (n.type === 'workflow-completed' || n.type === 'workflow-failed') {
        // Navigate to the relevant resource
        if (n.referenceType === 'venue' && n.referenceId) {
            router.push(`/venues/${n.referenceId}`);
        }
        else if (n.referenceType === 'item' && n.referenceId) {
            router.push(`/items/${n.referenceId}`);
        }
        else if (n.referenceType === 'capture' && n.referenceId) {
            router.push(`/history/${n.referenceId}`);
        }
        else {
            router.push('/items');
        }
    }
}
function closeDropdown(e) {
    const target = e.target;
    if (!target.closest('.notification-bell-container')) {
        showDropdown.value = false;
    }
}
let refreshInterval = null;
onMounted(() => {
    loadCountWithRetry();
    refreshInterval = setInterval(loadCount, 60000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('click', closeDropdown);
});
onUnmounted(() => {
    if (refreshInterval)
        clearInterval(refreshInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('click', closeDropdown);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "notification-bell-container relative" },
});
/** @type {__VLS_StyleScopedClasses['notification-bell-container']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleDropdown) },
    ...{ class: "relative p-1 text-[#96BEE6] hover:text-white transition-colors" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
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
    d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
});
if (__VLS_ctx.unreadCount > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['-top-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['-right-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[10px]']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
    (__VLS_ctx.unreadCount > 9 ? '9+' : __VLS_ctx.unreadCount);
}
if (__VLS_ctx.showDropdown) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute right-0 top-8 w-80 max-h-96 overflow-y-auto bg-[#041e3e] border border-[#0a2a52] rounded-xl shadow-xl z-50" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-80']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-96']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center justify-between p-3 border-b border-[#0a2a52]" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-sm font-medium text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    if (__VLS_ctx.unreadCount > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.markAllRead) },
            ...{ class: "text-xs text-[#96BEE6] hover:text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
    }
    if (__VLS_ctx.isLoading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-4 text-center text-[#5a8ab5] text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    else if (__VLS_ctx.notifications.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "p-4 text-center text-[#5a8ab5] text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        for (const [n] of __VLS_vFor((__VLS_ctx.notifications))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showDropdown))
                            return;
                        if (!!(__VLS_ctx.isLoading))
                            return;
                        if (!!(__VLS_ctx.notifications.length === 0))
                            return;
                        __VLS_ctx.handleNotificationClick(n);
                        // @ts-ignore
                        [toggleDropdown, unreadCount, unreadCount, unreadCount, unreadCount, showDropdown, markAllRead, isLoading, notifications, notifications, handleNotificationClick,];
                    } },
                key: (n.id),
                ...{ class: "w-full text-left p-3 border-b border-[#0a2a52]/50 hover:bg-[#0a2a52]/50 transition-colors" },
                ...{ class: (n.isRead ? 'opacity-60' : '') },
            });
            /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-[#0a2a52]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex items-start gap-2" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
            /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
            if (!n.isRead) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "w-2 h-2 bg-[#96BEE6] rounded-full mt-1.5 shrink-0" },
                });
                /** @type {__VLS_StyleScopedClasses['w-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['h-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-1.5']} */ ;
                /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex-1 min-w-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-white" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            (n.title);
            if (n.detail) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-xs text-[#5a8ab5] truncate mt-0.5" },
                });
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
                /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
                /** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
                (n.detail);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#4a7aa5] mt-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (new Date(n.createdAt).toLocaleDateString());
            // @ts-ignore
            [];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
