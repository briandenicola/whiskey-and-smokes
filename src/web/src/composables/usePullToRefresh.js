import { ref } from 'vue';
const PULL_THRESHOLD = 80;
const MAX_PULL = 120;
/**
 * Composable for pull-to-refresh gesture detection.
 * Attach the returned handlers to the scrollable container.
 * Call setRefreshCallback to register the async function invoked on pull.
 */
export function usePullToRefresh() {
    const isPulling = ref(false);
    const isRefreshing = ref(false);
    const pullDistance = ref(0);
    const pullProgress = ref(0);
    let startY = 0;
    let refreshCallback = null;
    function setRefreshCallback(fn) {
        refreshCallback = fn;
    }
    function onTouchStart(e) {
        if (isRefreshing.value)
            return;
        // Check scroll position of the element the handler is attached to
        const target = e.currentTarget;
        const scrollTop = target
            ? target.scrollTop
            : document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop <= 0) {
            startY = e.touches[0].clientY;
            isPulling.value = true;
        }
    }
    function onTouchMove(e) {
        if (!isPulling.value || isRefreshing.value)
            return;
        const currentY = e.touches[0].clientY;
        const delta = currentY - startY;
        if (delta > 0) {
            pullDistance.value = Math.min(delta * 0.5, MAX_PULL);
            pullProgress.value = Math.min(pullDistance.value / PULL_THRESHOLD, 1);
        }
        else {
            pullDistance.value = 0;
            pullProgress.value = 0;
        }
    }
    async function onTouchEnd() {
        if (!isPulling.value || isRefreshing.value)
            return;
        if (pullDistance.value >= PULL_THRESHOLD && refreshCallback) {
            isRefreshing.value = true;
            pullDistance.value = 50;
            try {
                await refreshCallback();
            }
            finally {
                isRefreshing.value = false;
            }
        }
        isPulling.value = false;
        pullDistance.value = 0;
        pullProgress.value = 0;
    }
    return {
        isPulling,
        isRefreshing,
        pullDistance,
        pullProgress,
        setRefreshCallback,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };
}
