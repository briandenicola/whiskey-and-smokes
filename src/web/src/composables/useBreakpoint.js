import { ref, onMounted, onUnmounted } from 'vue';
const DESKTOP_QUERY = '(min-width: 1024px)';
export function useBreakpoint() {
    const isDesktop = ref(false);
    let mql = null;
    function update(e) {
        isDesktop.value = e.matches;
    }
    onMounted(() => {
        mql = window.matchMedia(DESKTOP_QUERY);
        isDesktop.value = mql.matches;
        mql.addEventListener('change', update);
    });
    onUnmounted(() => {
        mql?.removeEventListener('change', update);
    });
    return { isDesktop };
}
