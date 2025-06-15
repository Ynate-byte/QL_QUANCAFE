import type { LoginRequest } from "../interfaces/Auth";

const API_BASE_URL = "http://localhost:5129/api/Auth";

export const loginApi = async (credentials: LoginRequest): Promise<Response> => {
    return fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
};