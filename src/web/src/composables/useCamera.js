import { ref } from 'vue';
export function useCamera() {
    const photos = ref([]);
    const previews = ref([]);
    function addFromInput(event) {
        const input = event.target;
        if (!input.files)
            return;
        for (const file of Array.from(input.files)) {
            photos.value.push(file);
            previews.value.push(URL.createObjectURL(file));
        }
        input.value = '';
    }
    function removePhoto(index) {
        URL.revokeObjectURL(previews.value[index]);
        photos.value.splice(index, 1);
        previews.value.splice(index, 1);
    }
    function clearPhotos() {
        previews.value.forEach(url => URL.revokeObjectURL(url));
        photos.value = [];
        previews.value = [];
    }
    return { photos, previews, addFromInput, removePhoto, clearPhotos };
}
