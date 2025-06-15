export function getAuthHeader(): Record<string, string> {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
        const auth = JSON.parse(storedAuth);
        if (auth?.token) {
            return { 'Authorization': `Bearer ${auth.token}` };
        }
    }
    return {};
}