/**
 * Página: LoginPage
 *
 * @description Este componente React representa a página de login da aplicação.
 * Ele gerencia a autenticação do utilizador, permitindo que os noivos
 * acedam às suas contas para gerir o planeamento do casamento. A página
 * lida com o estado do formulário, a interação com a API de autenticação,
 * e a navegação subsequente.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

/**
 * @returns {JSX.Element} A página de login.
 */
export default function LoginPage() {
	// Estados para gerir os dados do formulário e o estado da página
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	
	// Hooks de navegação
	const navigate = useNavigate();
	const location = useLocation();

	/**
	 * useEffect para verificar se existe uma mensagem de sucesso
	 * no estado de navegação (útil, por exemplo, após um registo bem-sucedido).
	 * A mensagem é exibida e, em seguida, removida do histórico do navegador
	 * para evitar que seja mostrada novamente em um reload.
	 */
	useEffect(() => {
		if (location.state?.message) {
			setSuccessMessage(location.state.message);
			// Remove a mensagem do histórico para que não apareça ao recarregar a página.
			window.history.replaceState({}, document.title)
		}
	}, [location]);

	/**
	 * Função assíncrona para lidar com a submissão do formulário.
	 *
	 * @param {Event} e - O evento de submissão do formulário.
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccessMessage('');
		setIsLoading(true);

		try {
			// Faz a chamada à API para autenticar o utilizador
			const response = await api.post('/auth/login', { email, password });
			// Armazena o token de acesso no armazenamento local
			localStorage.setItem('authToken', response.data.accessToken);
			
            // --- ALTERAÇÃO AQUI ---
            // Verifica se a resposta contém convites pendentes
            if (response.data.pendingInvitations && response.data.pendingInvitations.length > 0) {
                // Se houver, navega para a página de convites, passando os dados
                navigate('/pending-invitations', { state: { invitations: response.data.pendingInvitations } });
            } else {
                // Se não, segue o fluxo normal
			    navigate('/select-wedding');
            }
		} catch (err) {
			// Exibe uma mensagem de erro em caso de falha no login
			setError(err.response?.data?.error || 'Ocorreu um erro ao fazer login. Verifique as suas credenciais.');
		} finally {
			// Finaliza o estado de carregamento, independentemente do resultado
			setIsLoading(false);
		}
	};

	return (
		<div className="page_container_centered">
			<div className="card_base text-center" style={{ maxWidth: '450px' }}>
				<h1 className="title_h1">Bem-vindo(a) de volta!</h1>
				<p className="subtitle_main mb-4">Aceda à sua conta para continuar o planeamento.</p>

				<form onSubmit={handleSubmit} className="text-start">
					{/* Exibe mensagem de sucesso, se existir */}
					{successMessage && <div className="alert_message alert_success">{successMessage}</div>}
					
					{/* Campo de E-mail */}
					<div className="mb-3">
						<label htmlFor="emailInput" className="form_label">E-mail</label>
						<input
							type="email"
							className="form-control form_input"
							id="emailInput"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading} // Desativa o campo enquanto a requisição está em andamento
						/>
					</div>

					{/* Campo de Senha */}
					<div className="mb-3">
						<label htmlFor="passwordInput" className="form_label">Senha</label>
						<input
							type="password"
							className="form-control form_input"
							id="passwordInput"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isLoading} // Desativa o campo enquanto a requisição está em andamento
						/>
					</div>

					{/* Exibe mensagem de erro, se existir */}
					<ErrorMessage>{error}</ErrorMessage>

					{/* Botão de Submissão */}
					<button type="submit" className="button_primary w-100 mt-3" disabled={isLoading}>
						{isLoading ? 'A entrar...' : 'Entrar'}
					</button>
				</form>

				{/* Links para outras páginas */}
				<p className="mt-4">
					Ainda não tem uma conta? <Link to="/register">Crie uma agora</Link>
				</p>
				<p className="mt-2">
					<Link to="/request-password-reset">Esqueci a minha senha</Link>
				</p>
			</div>
		</div>
	);
}