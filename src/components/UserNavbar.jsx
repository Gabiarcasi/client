/**
 * Componente: UserNavbar
 *
 * @description Este componente React representa a barra de navegação para
 * usuários autenticados. Ele exibe uma mensagem de boas-vindas personalizada,
 * o logo da aplicação e um menu suspenso para gerenciar as opções de conta,
 * como a lista de casamentos, logout e a exclusão da conta (LGPD).
 */

// Importa os módulos e hooks necessários
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Biblioteca para decodificar tokens JWT
import logo from '../assets/logo_for_light.png';
import '../css/UserNavbar.css'; // Estilos específicos da navbar
import api from '../services/api'; // Serviço de API para requisições

/**
 * @returns {JSX.Element} O componente de barra de navegação para usuários.
 */
export default function UserNavbar() {
	const navigate = useNavigate();
	// Estado local para armazenar o primeiro nome do usuário.
	const [userName, setUserName] = useState('');

	/**
	 * Efeito para extrair o nome do usuário do token JWT.
	 */
	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				const fullName = decodedToken.name || 'Usuário';
				const firstName = fullName.split(' ')[0];
				setUserName(firstName);
			} catch (error) {
				console.error("Falha ao decodificar o token", error);
				handleLogout();
			}
		}
	}, []);

	/**
	 * Manipulador de eventos para o logout.
	 */
	const handleLogout = async () => {
		try {
			await api.post('/auth/logout');
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		} finally {
			localStorage.removeItem('authToken');
			navigate('/login');
		}
	};

	/**
	 * Lida com a requisição de exclusão de conta.
	 * Pede confirmação ao usuário e, se confirmado, chama o endpoint da API,
	 * realiza o logout e redireciona para a página de login.
	 */
	const handleDeleteAccount = async () => {
		// Pede uma dupla confirmação para uma ação tão destrutiva.
		if (window.confirm('Você tem certeza que deseja apagar sua conta? Esta ação é PERMANENTE e todos os seus dados, incluindo casamentos, convidados e orçamentos, serão excluídos.')) {
			try {
				const response = await api.delete('/users/me');
				alert(response.data.message); // Exibe a mensagem de sucesso da API.
				
				// Limpa a sessão do frontend e redireciona.
				localStorage.removeItem('authToken');
				navigate('/login');

			} catch (error) {
				console.error("Erro ao apagar a conta:", error);
				alert(error.response?.data?.error || 'Não foi possível apagar a sua conta. Tente novamente mais tarde.');
			}
		}
	};


	return (
		<nav className="user_navbar">
			<div className="container">
				<div className="d-flex justify-content-between align-items-center w-100">
					{/* Link do logo para a página inicial */}
					<Link to="/">
						<img src={logo} alt="Mariage Logo" className="navbar_logo" />
					</Link>
					
					{/* Dropdown com informações do usuário e opções */}
					<div className="dropdown user_dropdown">
						<a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
							Olá, {userName}
						</a>
						<ul className="dropdown-menu dropdown-menu-end">
							<li>
								<Link className="dropdown-item" to="/select-wedding">
									<i className="bi bi-arrow-left-right"></i>
									Meus Casamentos
								</Link>
							</li>
							<li><hr className="dropdown-divider" /></li>
							<li>
								<button className="dropdown-item text-danger" onClick={handleDeleteAccount}>
									<i className="bi bi-trash3-fill"></i>
									Apagar Minha Conta
								</button>
							</li>
							<li>
								<button className="dropdown-item" onClick={handleLogout}>
									<i className="bi bi-box-arrow-right"></i>
									Sair
								</button>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</nav>
	);
}