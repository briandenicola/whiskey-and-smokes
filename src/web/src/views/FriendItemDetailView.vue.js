/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { friendsApi } from '../services/friends';
import { thoughtsApi } from '../services/thoughts';
import { useAuthStore } from '../stores/auth';
import StarRating from '../components/common/StarRating.vue';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const friendId = computed(() => route.params.friendId);
const itemId = computed(() => route.params.id);
const item = ref(null);
const thoughts = ref([]);
const isLoading = ref(true);
const error = ref('');
// Thought composer
const newThoughtContent = ref('');
const newThoughtRating = ref(undefined);
const isSubmitting = ref(false);
async function load() {
    isLoading.value = true;
    error.value = '';
    try {
        const [itemRes, thoughtsRes] = await Promise.all([
            friendsApi.getFriendItem(friendId.value, itemId.value),
            thoughtsApi.getForTarget('item', itemId.value, friendId.value),
        ]);
        item.value = itemRes.data;
        thoughts.value = thoughtsRes.data;
    }
    catch {
        error.value = 'Failed to load item';
    }
    finally {
        isLoading.value = false;
    }
}
async function submitThought() {
    if (!newThoughtContent.value.trim())
        return;
    isSubmitting.value = true;
    try {
        const req = {
            content: newThoughtContent.value.trim(),
            targetUserId: friendId.value,
            targetType: 'item',
            targetId: itemId.value,
            rating: newThoughtRating.value,
        };
        const res = await thoughtsApi.create(req);
        thoughts.value.unshift(res.data);
        newThoughtContent.value = '';
        newThoughtRating.value = undefined;
    }
    catch {
        error.value = 'Failed to post thought';
    }
    finally {
        isSubmitting.value = false;
    }
}
async function deleteThought(thought) {
    try {
        await thoughtsApi.remove(thought.id);
        thoughts.value = thoughts.value.filter(t => t.id !== thought.id);
    }
    catch {
        error.value = 'Failed to delete thought';
    }
}
async function saveToWishlist() {
    if (!item.value)
        return;
    try {
        const { default: api } = await import('../services/api');
        await api.post('/api/items/wishlist', {
            name: item.value.name,
            type: item.value.type,
            brand: item.value.brand,
            notes: `From ${route.params.friendId}'s collection`,
            tags: item.value.tags,
        });
        alert('Added to your wishlist');
    }
    catch {
        error.value = 'Failed to save to wishlist';
    }
}
onMounted(load);
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
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.back();
            // @ts-ignore
            [router,];
        } },
    ...{ class: "text-[#96BEE6] text-sm mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center text-[#5a8ab5] py-12" },
    });
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-12']} */ ;
}
else if (__VLS_ctx.error && !__VLS_ctx.item) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-red-900/30']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-red-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    (__VLS_ctx.error);
}
else if (__VLS_ctx.item) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl overflow-hidden mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    if (__VLS_ctx.item.photoUrls?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.item.photoUrls[0]),
            ...{ class: "w-full h-48 object-cover" },
        });
        /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['h-48']} */ ;
        /** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "p-4 space-y-3" },
    });
    /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex items-center gap-2" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    (__VLS_ctx.item.type);
    if (__VLS_ctx.item.category) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#5a8ab5]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        (__VLS_ctx.item.category);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "text-xl font-semibold text-white" },
    });
    /** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    (__VLS_ctx.item.name);
    if (__VLS_ctx.item.brand) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-[#96BEE6]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
        (__VLS_ctx.item.brand);
    }
    if (__VLS_ctx.item.userRating) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        const __VLS_0 = StarRating;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            rating: (__VLS_ctx.item.userRating),
            size: "md",
        }));
        const __VLS_2 = __VLS_1({
            rating: (__VLS_ctx.item.userRating),
            size: "md",
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    if (__VLS_ctx.item.userNotes) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-[#5a8ab5]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        (__VLS_ctx.item.userNotes);
    }
    if (__VLS_ctx.item.venue) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-sm text-[#5a8ab5]" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        (__VLS_ctx.item.venue.name || 'Unknown');
    }
    if (__VLS_ctx.item.tags?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex flex-wrap gap-1" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
        /** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
        for (const [tag] of __VLS_vFor((__VLS_ctx.item.tags))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (tag),
                ...{ class: "text-xs px-2 py-0.5 rounded-full bg-[#0a2a52] text-[#96BEE6]" },
            });
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
            (tag);
            // @ts-ignore
            [isLoading, error, error, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item, item,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveToWishlist) },
        ...{ class: "w-full bg-[#0a2a52] border border-[#1e407c]/50 hover:border-[#1e407c] text-[#96BEE6] py-3 rounded-xl font-medium mb-4 transition-colors" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-[#0a2a52]']} */ ;
    /** @type {__VLS_StyleScopedClasses['border']} */ ;
    /** @type {__VLS_StyleScopedClasses['border-[#1e407c]/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:border-[#1e407c]']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "text-sm font-medium text-[#96BEE6] uppercase tracking-wide" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]']} */ ;
    /** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
    /** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
    (__VLS_ctx.thoughts.length);
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
        value: (__VLS_ctx.newThoughtContent),
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
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.error && !__VLS_ctx.item))
                        return;
                    if (!(__VLS_ctx.item))
                        return;
                    __VLS_ctx.newThoughtRating = __VLS_ctx.newThoughtRating === star ? undefined : star;
                    // @ts-ignore
                    [saveToWishlist, thoughts, newThoughtContent, newThoughtRating, newThoughtRating,];
                } },
            key: (star),
            ...{ class: "text-lg" },
            ...{ class: (__VLS_ctx.newThoughtRating && star <= __VLS_ctx.newThoughtRating ? 'text-[#96BEE6]' : 'text-[#1e407c]/50') },
        });
        /** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
        // @ts-ignore
        [newThoughtRating, newThoughtRating,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.submitThought) },
        disabled: (!__VLS_ctx.newThoughtContent.trim() || __VLS_ctx.isSubmitting),
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
    (__VLS_ctx.newThoughtContent.length);
    for (const [thought] of __VLS_vFor((__VLS_ctx.thoughts))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (thought.id),
            ...{ class: "bg-[#041e3e] border border-[#0a2a52] rounded-xl p-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-[#041e3e]']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-[#0a2a52]']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-4']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "flex items-start justify-between mb-2" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-start']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "font-medium text-white text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        (thought.authorDisplayName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "text-xs text-[#4a7aa5] ml-2" },
        });
        /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#4a7aa5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
        (new Date(thought.createdAt).toLocaleDateString());
        if (thought.authorId === __VLS_ctx.auth.user?.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.isLoading))
                            return;
                        if (!!(__VLS_ctx.error && !__VLS_ctx.item))
                            return;
                        if (!(__VLS_ctx.item))
                            return;
                        if (!(thought.authorId === __VLS_ctx.auth.user?.id))
                            return;
                        __VLS_ctx.deleteThought(thought);
                        // @ts-ignore
                        [thoughts, newThoughtContent, newThoughtContent, submitThought, isSubmitting, isSubmitting, auth, deleteThought,];
                    } },
                ...{ class: "text-red-400 text-xs hover:text-red-300" },
            });
            /** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            /** @type {__VLS_StyleScopedClasses['hover:text-red-300']} */ ;
        }
        if (thought.rating) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "mb-1" },
            });
            /** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
            for (const [star] of __VLS_vFor((5))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (star),
                    ...{ class: (star <= thought.rating ? 'text-[#96BEE6]' : 'text-[#1e407c]/50') },
                });
                // @ts-ignore
                [];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-[#96BEE6]/80" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#96BEE6]/80']} */ ;
        (thought.content);
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.thoughts.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "text-center text-[#5a8ab5] py-4 text-sm" },
        });
        /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-[#5a8ab5]']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    }
    if (__VLS_ctx.error) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-3 text-sm mt-4" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-red-900/30']} */ ;
        /** @type {__VLS_StyleScopedClasses['border']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-red-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
        (__VLS_ctx.error);
    }
}
// @ts-ignore
[error, error, thoughts,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
