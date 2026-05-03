import { ref } from 'vue';
export function useLocation() {
    const location = ref(null);
    const error = ref(null);
    const isLocating = ref(false);
    async function requestLocation() {
        if (!navigator.geolocation) {
            error.value = 'Geolocation is not supported';
            return null;
        }
        isLocating.value = true;
        error.value = null;
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition((position) => {
                location.value = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                isLocating.value = false;
                resolve(location.value);
            }, (err) => {
                error.value = err.message;
                isLocating.value = false;
                resolve(null);
            }, { enableHighAccuracy: true, timeout: 10000 });
        });
    }
    return { location, error, isLocating, requestLocation };
}
