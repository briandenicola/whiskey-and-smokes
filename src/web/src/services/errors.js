/**
 * Extract a user-friendly error message from an Axios error or unknown exception.
 * Falls back to the provided default message if no specific message is available.
 */
export function getErrorMessage(error, fallback) {
    const axiosError = error;
    return axiosError?.response?.data?.message
        ?? (error instanceof Error ? error.message : null)
        ?? fallback;
}
