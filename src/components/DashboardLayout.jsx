/**
 * Componente: DashboardLayout
 *
 * @description Este componente React serve como o layout principal para as
 * páginas do painel de controle da aplicação. Ele fornece uma estrutura
 * consistente, incluindo uma barra lateral de navegação e uma área de
 * conteúdo principal. Ele gerencia a navegação, o estado do casamento
 * selecionado e a funcionalidade de logout.
 */

// Importa os módulos e hooks necessários do React e React Router
import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

// Importa hooks e utilitários da sua aplicação
import { useWedding } from '../contexts/WeddingContext';
import { formatCoupleNames } from '../utils/formatters'; // Importa a função para formatar nomes
import '../css/DashboardLayout.css'; // Estilos específicos do layout
import logoImage from '../assets/logo_for_light.png';
import api from '../services/api'; // O serviço de API para fazer requisições

/**
 * @returns {JSX.Element} O layout do painel de controle.
 */
export default function DashboardLayout() {
	const navigate = useNavigate();
	// Usa o contexto para acessar e gerenciar o casamento selecionado.
	const { selectedWedding, clearSelectedWedding } = useWedding();

	/**
	 * Efeito para redirecionar o usuário caso nenhum casamento esteja selecionado.
	 *
	 * @description Garante que o usuário sempre tenha um casamento selecionado
	 * ao acessar as rotas do painel.
	 */
	useEffect(() => {
		if (!selectedWedding) {
			navigate('/select-wedding');
		}
	}, [selectedWedding, navigate]);

	/**
	 * Manipulador de eventos para o botão de logout.
	 *
	 * @description Tenta fazer o logout na API e, independentemente do resultado,
	 * limpa o token de autenticação e redireciona para a página de login.
	 */
	const handleLogout = async () => {
		try {
			// Faz uma requisição POST para a rota de logout.
			await api.post('/auth/logout');
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		} finally {
			// Limpa o token do localStorage e navega para a página de login.
			localStorage.removeItem('authToken');
			navigate('/login');
		}
	};
	
	// Se nenhum casamento estiver selecionado, não renderiza nada e espera o redirecionamento.
	if (!selectedWedding) {
		return null;
	}

	return (
		<div className="dashboard_layout">
			{/* Barra lateral de navegação */}
			<aside className="dashboard_sidebar">
				<div className="sidebar_header">
					<img src={logoImage} alt="Logo Mariage" className="sidebar_logo" />
					<div className="sidebar_wedding_info">
						{/* Exibe os nomes do casal usando a função de formatação */}
						{formatCoupleNames(selectedWedding.bride_name, selectedWedding.groom_name)}
					</div>
				</div>

				{/* Navegação principal com links para as seções do painel */}
				<nav className="sidebar_nav">
					{/* NavLink é usado para navegação no React Router */}
					<NavLink to="/dashboard" className="sidebar_nav_link" end>
						<i className="bi bi-grid-1x2-fill"></i>
						<span>Dashboard</span>
					</NavLink>
					<NavLink to="/dashboard/edit-wedding" className="sidebar_nav_link">
						<i className="bi bi-pencil-square"></i>
						<span>Editar Casamento</span>
					</NavLink>
					<NavLink to="/dashboard/guests" className="sidebar_nav_link">
						<i className="bi bi-people-fill"></i>
						<span>Convidados</span>
					</NavLink>
					<NavLink to="/dashboard/vendors" className="sidebar_nav_link">
						<i className="bi bi-briefcase-fill"></i>
						<span>Fornecedores</span>
					</NavLink>
					<NavLink to="/dashboard/budget" className="sidebar_nav_link">
						<i className="bi bi-piggy-bank-fill"></i>
						<span>Orçamento</span>
					</NavLink>
					<NavLink to="/dashboard/team" className="sidebar_nav_link">
						<i className="bi bi-person-plus-fill"></i>
						<span>Equipa</span>
					</NavLink>
					<NavLink to="/dashboard/site-editor" className="sidebar_nav_link">
						<i className="bi bi-gem"></i>
						<span>Editor do Site</span>
					</NavLink>
					
					{/* Link para trocar de casamento, que navega para a página de seleção */}
					<NavLink to="/select-wedding" className="sidebar_nav_link as_button">
						<i className="bi bi-arrow-left-right"></i>
						<span>Trocar Casamento</span>
					</NavLink>
				</nav>

				{/* Rodapé da barra lateral com o botão de logout */}
				<div className="sidebar_footer">
					<button onClick={handleLogout} className="sidebar_logout_button">
						<i className="bi bi-box-arrow-right"></i>
						<span>Sair</span>
					</button>
				</div>
			</aside>

			{/* Área de conteúdo principal onde as rotas aninhadas serão renderizadas */}
			<main className="dashboard_content">
				<Outlet />
			</main>
		</div>
	);
}