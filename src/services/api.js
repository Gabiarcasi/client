/**
 * Serviço de API Central
 *
 * @description Este arquivo exporta uma instância do Axios pré-configurada,
 * que atua como o ponto central para todas as comunicações com o backend.
 * Ele utiliza "interceptors" para gerenciar automaticamente a autenticação
 * do usuário de forma transparente, lidando com a expiração de tokens.
 */

import axios from 'axios';

const api = axios.create({
	baseURL: 'https://mariage-api.onrender.com',
	withCredentials: true
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

        // Identifica se a requisição original que falhou foi para login ou logout.
        const isLoginRequest = originalRequest.url === '/auth/login';
        const isLogoutRequest = originalRequest.url === '/auth/logout';

		// O interceptador só deve tentar renovar o token se:
        // 1. O erro for 401 (Não Autorizado).
        // 2. Ainda não for uma tentativa de repetição.
        // 3. NÃO for uma requisição de login ou logout.
		if (error.response.status === 401 && !originalRequest._retry && !isLoginRequest && !isLogoutRequest) {
			originalRequest._retry = true;

			try {
				const { data } = await api.post('/auth/refresh-token');
				
				localStorage.setItem('authToken', data.accessToken);
				
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
				originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;

				return api(originalRequest);
			} catch (refreshError) {
				console.error("Sessão expirada. Erro ao renovar o token:", refreshError);
				localStorage.removeItem('authToken');
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}

		// Para todos os outros erros (incluindo 401 no login/logout), apenas propaga o erro.
		return Promise.reject(error);
	}
);

export default api;