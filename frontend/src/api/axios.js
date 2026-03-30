import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        const skipRefresh =
            originalRequest.url?.includes('/users/refresh-token') ||
            originalRequest.url?.includes('/users/profile') ||  // ← NEW
            originalRequest.url?.includes('/users/login')       // ← NEW

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !skipRefresh                                         // ← UPDATED
        ) {
            originalRequest._retry = true
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                )
                return api(originalRequest)
            } catch (refreshError) {
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
