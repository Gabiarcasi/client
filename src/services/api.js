/**
 * Serviço de API Central
 *
 * @description Este arquivo exporta uma instância do Axios pré-configurada,
 * que atua como o ponto central para todas as comunicações com o backend.
 * Ele utiliza uma variável de ambiente para definir o endereço da API,
 * permitindo que o frontend funcione tanto em ambiente de desenvolvimento
 * quanto em produção sem precisar de alterações no código.
 */

// Importa a biblioteca Axios para fazer requisições HTTP
import axios from 'axios';

// Cria uma instância personalizada do Axios
const api = axios.create({
	// --- ALTERAÇÃO PRINCIPAL AQUI ---
	// Usa a variável de ambiente `VITE_API_BASE_URL` definida na Vercel.
	// Se ela não existir (ambiente local), usa o endereço do servidor local como padrão.
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
	
	// Permite que o Axios envie cookies com as requisições, o que é crucial
	// para o Refresh Token que está armazenado em um cookie HTTP-only.
	withCredentials: true
});

/**
 * Interceptor de Requisições
 *
 * @description Intercepta cada requisição antes que ela seja enviada.
 * Se houver um `authToken` no `localStorage`, ele é adicionado ao cabeçalho
 * `Authorization` no formato `Bearer token`.
 */
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

/**
 * Interceptor de Respostas
 *
 * @description Intercepta cada resposta da API. Se uma requisição protegida
 * falhar com um erro `401 Unauthorized`, este interceptor tenta de forma
 * automática e silenciosa obter um novo Access Token.
 */
api.interceptors.response.use(
	(response) => response, // Se a resposta for bem-sucedida, simplesmente a retorna.
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