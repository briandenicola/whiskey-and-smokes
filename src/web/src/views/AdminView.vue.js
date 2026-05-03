/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { usersApi } from '../services/users';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
const router = useRouter();
const feedbackTimers = [];
const users = ref([]);
const prompts = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const activeTab = ref('users');
const showMenu = ref(false);
function selectTab(tab) {
    activeTab.value = tab;
    showMenu.value = false;
}
function goToActivity() {
    showMenu.value = false;
    router.push('/history');
}
// Reset password state
const resetPasswordUserId = ref(null);
const newPassword = ref('');
const resetMessage = ref('');
// Delete user state
const deleteConfirmUserId = ref(null);
// Prompt viewing state (read-only — prompts are managed as files in AgentInitiator/Prompts/)
const expandedPromptId = ref(null);
// Logging state
const loggingData = ref(null);
const editedLevels = ref({});
const editedDefaultLevel = ref('Information');
const loggingMessage = ref('');
const loggingSaving = ref(false);
// Foundry state
const foundryStatus = ref(null);
const foundryTesting = ref(false);
const filteredUsers = computed(() => {
    if (!searchQuery.value)
        return users.value;
    const q = searchQuery.value.toLowerCase();
    return users.value.filter(u => u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q));
});
onMounted(async () => {
    try {
        const [usersRes, promptsRes, loggingRes, foundryRes] = await Promise.all([
            usersApi.listUsers(),
            usersApi.listPrompts(),
            usersApi.getLoggingSettings(),
            usersApi.getFoundryStatus()
        ]);
        users.value = usersRes.data;
        prompts.value = promptsRes.data;
        loggingData.value = loggingRes.data;
        foundryStatus.value = foundryRes.data;
        resetLoggingForm();
    }
    finally {
        isLoading.value = false;
    }
});
onBeforeUnmount(() => {
    feedbackTimers.forEach(clearTimeout);
});
async function toggleRole(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const { data } = await usersApi.updateRole(user.id, newRole);
    const index = users.value.findIndex(u => u.id === user.id);
    if (index !== -1)
        users.value[index] = data;
}
function startResetPassword(userId) {
    resetPasswordUserId.value = userId;
    newPassword.value = '';
    resetMessage.value = '';
}
async function confirmResetPassword() {
    if (!resetPasswordUserId.value || newPassword.value.length < 8) {
        resetMessage.value = 'Password must be at least 8 characters';
        return;
    }
    try {
        await usersApi.resetPassword(resetPasswordUserId.value, newPassword.value);
        resetMessage.value = 'Password reset successfully';
        feedbackTimers.push(setTimeout(() => { resetPasswordUserId.value = null; }, 1500));
    }
    catch {
        resetMessage.value = 'Failed to reset password';
    }
}
function startDeleteUser(userId) {
    deleteConfirmUserId.value = userId;
}
async function confirmDeleteUser() {
    if (!deleteConfirmUserId.value)
        return;
    try {
        await usersApi.deleteUser(deleteConfirmUserId.value);
        users.value = users.value.filter(u => u.id !== deleteConfirmUserId.value);
        deleteConfirmUserId.value = null;
    }
    catch {
        // Could show error toast
    }
}
function togglePromptExpand(promptId) {
    expandedPromptId.value = expandedPromptId.value === promptId ? null : promptId;
}
function resetLoggingForm() {
    if (!loggingData.value)
        return;
    editedDefaultLevel.value = loggingData.value.settings.defaultLevel;
    // Merge available categories with current settings
    const merged = {};
    for (const [cat, defaultLevel] of Object.entries(loggingData.value.availableCategories)) {
        merged[cat] = loggingData.value.settings.categoryLevels[cat] ?? defaultLevel;
    }
    // Also include any custom categories from settings not in defaults
    for (const [cat, level] of Object.entries(loggingData.value.settings.categoryLevels)) {
        if (!(cat in merged))
            merged[cat] = level;
    }
    editedLevels.value = merged;
}
function getLevelColor(level) {
    switch (level) {
        case 'Trace': return 'text-[#96BEE6]/70';
        case 'Debug': return 'text-blue-400';
        case 'Information': return 'text-green-400';
        case 'Warning': return 'text-yellow-400';
        case 'Error': return 'text-red-400';
        case 'Critical': return 'text-red-600';
        case 'None': return 'text-[#4a7aa5]/60';
        default: return 'text-[#96BEE6]';
    }
}
async function saveLoggingSettings() {
    loggingSaving.value = true;
    loggingMessage.value = '';
    try {
        // Only send categories that differ from "Default" override
        const categoryLevels = {};
        for (const [cat, level] of Object.entries(editedLevels.value)) {
            if (cat !== 'Default')
                categoryLevels[cat] = level;
        }
        const settings = {
            defaultLevel: editedDefaultLevel.value,
            categoryLevels
        };
        const { data } = await usersApi.updateLoggingSettings(settings);
        if (loggingData.value) {
            loggingData.value.settings = data;
        }
        loggingMessage.value = 'Log levels updated — changes take effect immediately';
        feedbackTimers.push(setTimeout(() => { loggingMessage.value = ''; }, 3000));
    }
    catch {
        loggingMessage.value = 'Failed to save logging settings';
    }
    finally {
        loggingSaving.value = false;
    }
}
async function testFoundryConnectivity() {
    foundryTesting.value = true;
    try {
        const { data } = await usersApi.testFoundryConnectivity();
        foundryStatus.value = data;
    }
    catch {
        // handled by status display
    }
    finally {
        foundryTesting.value = false;
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "p-4 max-w-lg mx-auto" },
});
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center justify-between mb-6" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink} */
routerLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "/profile",
    ...{ class: "text-sm text-[#96BEE6] hover:text-white" },
}));
const __VLS_2 = __VLS_1({
    to: "/profile",
    ...{ class: "text-sm text-[#96BEE6] hover:text-white" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-xl font-semibold" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showMenu = !__VLS_ctx.showMenu;
            // @ts-ignore
            [showMenu, showMenu,];
        } },
    ...{ class: "text-[#96BEE6] hover:text-white p-1" },
});
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
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
    d: "M4 6h16M4 12h16M4 18h16",
});
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    name: "dropdown",
}));
const __VLS_8 = __VLS_7({
    name: "dropdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.showMenu) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "absolute right-0 top-8 z-50 w-44 bg-[#041e3e] border border-[#1e407c] rounded-xl shadow-xl overflow-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['absolute']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['top-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-44']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    for (const [item] of __VLS_vFor([
        { key: 'users', label: 'Users' },
        { key: 'prompts', label: 'AI Prompts' },
        { key: 'foundry', label: 'Foundry' },
        { key: 'logging', label: 'Logging' },
    ])) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showMenu))
                        return;
                    __VLS_ctx.selectTab(item.key);
                    // @ts-ignore
                    [showMenu, selectTab,];
                } },
            key: (item.key),
            ...{ class: "w-full text-left px-4 py-3 text-sm transition-colors" },
            ...{ class: (__VLS_ctx.activeTab === item.key
                    ? 'bg-[#1e407c]/30 text-white'
                    : 'text-[#96BEE6] hover:bg-[#0a2a52]') },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        (item.label);
        // @ts-ignore
        [activeTab,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.goToActivity) },
        ...{ class: "w-full text-left px-4 py-3 text-sm text-[#96BEE6] hover:bg-[#0a2a52] transition-colors border-t border-[#0a2a52]" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
}
// @ts-ignore
[goToActivity,];
var __VLS_9;
if (__VLS_ctx.showMenu) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showMenu))
                    return;
                __VLS_ctx.showMenu = false;
                // @ts-ignore
                [showMenu, showMenu,];
            } },
        ...{ class: "fixed inset-0 z-40" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
}
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-[#96BEE6]/70 text-center py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else if (__VLS_ctx.activeTab === 'users') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        placeholder: "Search users...",
        ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] mb-4" },
    });
    (__VLS_ctx.searchQuery);
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
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [user] of __VLS_vFor((__VLS_ctx.filteredUsers))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (user.id),
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "min-w-0 flex-1 mr-3" },
        });
        /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
        /** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "font-medium text-white truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (user.displayName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-[#96BEE6]/70 truncate" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        (user.email);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-[#4a7aa5]/60 mt-1" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
        (new Date(user.createdAt).toLocaleDateString());
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center gap-2 shrink-0" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['shrink-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!(__VLS_ctx.activeTab === 'users'))
                        return;
                    __VLS_ctx.toggleRole(user);
                    // @ts-ignore
                    [activeTab, isLoading, searchQuery, filteredUsers, toggleRole,];
                } },
            disabled: (user.id === __VLS_ctx.auth.user?.id),
            ...{ class: "text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50" },
            ...{ class: (user.role === 'admin'
                    ? 'border-[#1e407c] text-[#96BEE6] hover:bg-[#1e407c]/20'
                    : 'border-[#1e407c]/50 text-[#96BEE6] hover:bg-[#0a2a52]') },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
        (user.role);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 mt-3 pt-3 border-t border-[#0a2a52]" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-t']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!(__VLS_ctx.activeTab === 'users'))
                        return;
                    __VLS_ctx.startResetPassword(user.id);
                    // @ts-ignore
                    [auth, startResetPassword,];
                } },
            ...{ class: "text-xs px-3 py-2.5 min-h-[44px] rounded-lg bg-[#0a2a52] text-white/80 hover:bg-[#1e407c] transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        if (user.id !== __VLS_ctx.auth.user?.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isLoading))
                            return;
                        if (!(__VLS_ctx.activeTab === 'users'))
                            return;
                        if (!(user.id !== __VLS_ctx.auth.user?.id))
                            return;
                        __VLS_ctx.startDeleteUser(user.id);
                        // @ts-ignore
                        [auth, startDeleteUser,];
                    } },
                ...{ class: "text-xs px-3 py-2.5 min-h-[44px] rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/50 transition-colors" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-red-900/30']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:bg-red-900/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-red-800/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        }
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.filteredUsers.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]/70 text-center py-8" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    }
}
else if (__VLS_ctx.activeTab === 'prompts') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-[#041e3e]/50 border border-[#0a2a52] rounded-xl p-3 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-xs text-[#96BEE6]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({
        ...{ class: "text-[#96BEE6]/80 bg-[#0a2a52] px-1 rounded" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({
        ...{ class: "text-[#96BEE6]/80 bg-[#0a2a52] px-1 rounded" },
    });
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    for (const [prompt] of __VLS_vFor((__VLS_ctx.prompts))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (prompt.id),
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.activeTab === 'users'))
                        return;
                    if (!(__VLS_ctx.activeTab === 'prompts'))
                        return;
                    __VLS_ctx.togglePromptExpand(prompt.id);
                    // @ts-ignore
                    [activeTab, filteredUsers, prompts, togglePromptExpand,];
                } },
            ...{ class: "flex items-center justify-between mb-2 cursor-pointer" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "font-medium text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        (prompt.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        (prompt.description);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[#96BEE6]/70 text-sm transition-transform" },
            ...{ class: (__VLS_ctx.expandedPromptId === prompt.id ? 'rotate-180' : '') },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
        if (__VLS_ctx.expandedPromptId === prompt.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({
                ...{ class: "text-xs text-[#96BEE6] bg-[#001E44] rounded-lg p-3 whitespace-pre-wrap max-h-60 overflow-y-auto border border-[#0a2a52]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#001E44]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
            /** @type {__VLS_StyleScopedClasses['max-h-60']} */ ;
            /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            (prompt.content);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#4a7aa5]/60 mt-2" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
            (new Date(prompt.updatedAt).toLocaleString());
            if (prompt.updatedBy) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (prompt.updatedBy);
            }
        }
        // @ts-ignore
        [expandedPromptId, expandedPromptId,];
    }
    if (__VLS_ctx.prompts.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]/70 text-center py-8" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    }
}
else if (__VLS_ctx.activeTab === 'foundry') {
    if (__VLS_ctx.foundryStatus) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-sm font-semibold text-white mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-white/80 font-mono truncate ml-4 max-w-[60%] text-right" },
        });
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['max-w-[60%]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-right']} */ ;
        (__VLS_ctx.foundryStatus.projectEndpoint || 'Not configured');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-white/80 font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (__VLS_ctx.foundryStatus.visionModel || '—');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-white/80 font-mono" },
        });
        /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
        (__VLS_ctx.foundryStatus.reasoningModel || '—');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex justify-between text-xs" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (__VLS_ctx.foundryStatus.isProjectConfigured ? 'text-green-400' : 'text-red-400') },
            ...{ class: "font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (__VLS_ctx.foundryStatus.isProjectConfigured ? 'Configured' : 'Not Configured');
        if (__VLS_ctx.foundryStatus.agentValidation && __VLS_ctx.foundryStatus.agentValidation.foundAgents.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "text-sm font-semibold text-white mb-3" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "space-y-2" },
            });
            /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
            for (const [agentName] of __VLS_vFor((__VLS_ctx.foundryStatus.agentValidation.foundAgents))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (agentName),
                    ...{ class: "flex items-center justify-between text-xs py-1 border-b border-[#0a2a52] last:border-b-0" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-white/80 font-mono" },
                });
                /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                (agentName);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-green-400 font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['text-green-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                // @ts-ignore
                [activeTab, prompts, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus,];
            }
            for (const [agentName] of __VLS_vFor((__VLS_ctx.foundryStatus.agentValidation.missingAgents))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (agentName),
                    ...{ class: "flex items-center justify-between text-xs py-1 border-b border-[#0a2a52] last:border-b-0" },
                });
                /** @type {__VLS_StyleScopedClasses['flex']} */ ;
                /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
                /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
                /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
                /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
                /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
                /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-white/80 font-mono" },
                });
                /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
                (agentName);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "text-red-400 font-medium" },
                });
                /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
                /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
                // @ts-ignore
                [foundryStatus,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "text-sm font-semibold text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.testFoundryConnectivity) },
            disabled: (__VLS_ctx.foundryTesting || !__VLS_ctx.foundryStatus.isProjectConfigured),
            ...{ class: "text-xs px-4 py-2 min-h-[44px] rounded-xl bg-[#1e407c] text-white hover:bg-[#2a5299] transition-colors disabled:opacity-50" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
        (__VLS_ctx.foundryTesting ? 'Testing...' : 'Test Connection');
        if (__VLS_ctx.foundryStatus.connectivityTest) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-xs space-y-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[#96BEE6]/70" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: (__VLS_ctx.foundryStatus.connectivityTest.status === 'ok' ? 'text-green-400' : 'text-red-400') },
                ...{ class: "font-medium" },
            });
            /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
            (__VLS_ctx.foundryStatus.connectivityTest.status === 'ok' ? 'Connected' : 'Failed');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "flex justify-between" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-[#96BEE6]/70" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "text-white/80" },
            });
            /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
            (__VLS_ctx.foundryStatus.connectivityTest.latencyMs);
            if (__VLS_ctx.foundryStatus.connectivityTest.message) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "mt-2" },
                });
                /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "text-[#96BEE6] bg-[#001E44] rounded-lg p-2 break-words" },
                });
                /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
                /** @type {__VLS_StyleScopedClasses['bg-[#001E44]']} */ ;
                /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
                /** @type {__VLS_StyleScopedClasses['p-2']} */ ;
                /** @type {__VLS_StyleScopedClasses['break-words']} */ ;
                (__VLS_ctx.foundryStatus.connectivityTest.message);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-[#4a7aa5]/60 mt-1" },
            });
            /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]/60']} */ ;
            /** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
            (new Date(__VLS_ctx.foundryStatus.connectivityTest.testedAt).toLocaleString());
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs text-[#96BEE6]/70" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]/70 text-center py-8" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    }
}
else if (__VLS_ctx.activeTab === 'logging') {
    if (__VLS_ctx.loggingData) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-4" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-[#96BEE6] mb-4" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between py-3 border-b border-[#0a2a52]" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "font-medium text-white" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs text-[#96BEE6]/70" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.editedDefaultLevel),
            ...{ class: (__VLS_ctx.getLevelColor(__VLS_ctx.editedDefaultLevel)) },
            ...{ class: "bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e407c]" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
        /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
        for (const [level] of __VLS_vFor((__VLS_ctx.loggingData.availableLevels))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (level),
                value: (level),
            });
            (level);
            // @ts-ignore
            [activeTab, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, foundryStatus, testFoundryConnectivity, foundryTesting, foundryTesting, loggingData, loggingData, editedDefaultLevel, editedDefaultLevel, getLevelColor,];
        }
        for (const [_, category] of __VLS_vFor((__VLS_ctx.editedLevels))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (category),
                ...{ class: "flex items-center justify-between py-3 border-b border-[#0a2a52] last:border-b-0" },
            });
            /** @type {__VLS_StyleScopedClasses['flex']} */ ;
            /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
            /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "min-w-0 flex-1 mr-3" },
            });
            /** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
            /** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-sm text-white font-mono truncate" },
            });
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
            /** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
            /** @type {__VLS_StyleScopedClasses['truncate']} */ ;
            (category);
            __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                value: (__VLS_ctx.editedLevels[category]),
                ...{ class: (__VLS_ctx.getLevelColor(__VLS_ctx.editedLevels[category])) },
                ...{ class: "bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#1e407c]" },
            });
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['border']} */ ;
            /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
            /** @type {__VLS_StyleScopedClasses['focus:border-[#1e407c]']} */ ;
            for (const [level] of __VLS_vFor((__VLS_ctx.loggingData.availableLevels))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    key: (level),
                    value: (level),
                });
                (level);
                // @ts-ignore
                [loggingData, getLevelColor, editedLevels, editedLevels, editedLevels,];
            }
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-center justify-between" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        if (__VLS_ctx.loggingMessage) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "text-xs" },
                ...{ class: (__VLS_ctx.loggingMessage.includes('Failed') ? 'text-red-400' : 'text-green-400') },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.loggingMessage);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex gap-2 ml-auto" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.resetLoggingForm) },
            ...{ class: "text-xs px-4 py-2 rounded-xl bg-[#0a2a52] text-[#96BEE6] hover:bg-[#1e407c] transition-colors" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.saveLoggingSettings) },
            disabled: (__VLS_ctx.loggingSaving),
            ...{ class: "text-xs px-4 py-2 rounded-xl bg-[#1e407c] text-white hover:bg-[#2a5299] transition-colors disabled:opacity-50" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
        /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
        (__VLS_ctx.loggingSaving ? 'Saving...' : 'Save Log Levels');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]/70 text-center py-8" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/70']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    }
}
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    to: "body",
}));
const __VLS_14 = __VLS_13({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
if (__VLS_ctx.resetPasswordUserId) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.resetPasswordUserId))
                    return;
                __VLS_ctx.resetPasswordUserId = null;
                // @ts-ignore
                [loggingMessage, loggingMessage, loggingMessage, resetLoggingForm, saveLoggingSettings, loggingSaving, loggingSaving, resetPasswordUserId, resetPasswordUserId,];
            } },
        ...{ class: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-[#041e3e] border border-[#1e407c]/50 rounded-2xl p-6 w-full max-w-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-lg font-semibold text-white mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-[#96BEE6] mb-3" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    (__VLS_ctx.users.find(u => u.id === __VLS_ctx.resetPasswordUserId)?.displayName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onKeyup: (__VLS_ctx.confirmResetPassword) },
        type: "password",
        placeholder: "New password (min 8 characters)",
        ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 rounded-xl px-4 py-3 text-white placeholder-[#4a7aa5] focus:outline-none focus:border-[#1e407c] mb-3" },
    });
    (__VLS_ctx.newPassword);
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
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    if (__VLS_ctx.resetMessage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-xs mb-3" },
            ...{ class: (__VLS_ctx.resetMessage.includes('Failed') ? 'text-red-400' : 'text-green-400') },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        (__VLS_ctx.resetMessage);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-2 justify-end" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.resetPasswordUserId))
                    return;
                __VLS_ctx.resetPasswordUserId = null;
                // @ts-ignore
                [resetPasswordUserId, resetPasswordUserId, users, confirmResetPassword, newPassword, resetMessage, resetMessage, resetMessage,];
            } },
        ...{ class: "px-4 py-2 text-sm rounded-xl bg-[#0a2a52] text-[#96BEE6] hover:bg-[#1e407c]" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.confirmResetPassword) },
        ...{ class: "px-4 py-2 text-sm rounded-xl bg-[#1e407c] text-white hover:bg-[#2a5299]" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#1e407c]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#2a5299]']} */ ;
}
// @ts-ignore
[confirmResetPassword,];
var __VLS_15;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    to: "body",
}));
const __VLS_20 = __VLS_19({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
if (__VLS_ctx.deleteConfirmUserId) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.deleteConfirmUserId))
                    return;
                __VLS_ctx.deleteConfirmUserId = null;
                // @ts-ignore
                [deleteConfirmUserId, deleteConfirmUserId,];
            } },
        ...{ class: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/60']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-[#041e3e] border border-[#1e407c]/50 rounded-2xl p-6 w-full max-w-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-w-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-lg font-semibold text-red-400 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-white/80 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white/80']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.users.find(u => u.id === __VLS_ctx.deleteConfirmUserId)?.displayName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex gap-2 justify-end" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.deleteConfirmUserId))
                    return;
                __VLS_ctx.deleteConfirmUserId = null;
                // @ts-ignore
                [users, deleteConfirmUserId, deleteConfirmUserId,];
            } },
        ...{ class: "px-4 py-2 text-sm rounded-xl bg-[#0a2a52] text-[#96BEE6] hover:bg-[#1e407c]" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-[#1e407c]']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.confirmDeleteUser) },
        ...{ class: "px-4 py-2 text-sm rounded-xl bg-red-700 text-white hover:bg-red-600" },
    });
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-red-600']} */ ;
}
// @ts-ignore
[confirmDeleteUser,];
var __VLS_21;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
