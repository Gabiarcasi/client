/**
 * Componente: PublicLayout
 *
 * @description Este componente React serve como o layout principal para todas
 * as páginas públicas (acessíveis sem autenticação), como as de login, registro,
 * recuperação de senha e a página inicial. Ele define uma estrutura comum
 * com um cabeçalho, uma área de conteúdo principal e um rodapé.
 */

// Importa os módulos e hooks necessários do React e React Router
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

// Importa os estilos e ativos
import '../css/PublicLayout.css';
import logoImage from '../assets/logo_for_light.png';

/**
 * @returns {JSX.Element} O layout para as páginas públicas.
 */
export default function PublicLayout() {
	// Obtém o objeto de localização para saber a URL atual.
	const location = useLocation();

	// Define as rotas que devem ter o conteúdo centralizado.
	const centeredPages = ['/login', '/register', '/verify-email', '/request-password-reset', '/reset-password'];

	// Verifica se a rota atual está na lista de páginas centralizadas.
	const isCentered = centeredPages.includes(location.pathname);

	// Define a classe CSS do conteúdo principal com base na verificação.
	const mainContentClass = isCentered
		? 'public_main_content centered'
		: 'public_main_content';

	return (
		<div className="public_layout_container">
			{/* Cabeçalho de navegação */}
			<nav className="public_navbar">
				<div className="container navbar_content">
					<Link to="/">
						<img src={logoImage} alt="Mariage Logo" className="navbar_logo" />
					</Link>
					<div className="navbar_links">
						<Link to="/login">Login</Link>
						<Link to="/register">Criar Conta</Link>
					</div>
				</div>
			</nav>

			{/* Área de conteúdo principal */}
			<main className={mainContentClass}>
				{/*
				 * O <Outlet /> renderiza o componente da rota correspondente
				 * (por exemplo, Login.jsx, Register.jsx).
				 */}
				<Outlet />
			</main>

			{/* Rodapé fixo para todas as páginas públicas */}
			<footer className="public_footer">
				<div className="container footer_content">
					<p>&copy; {new Date().getFullYear()} Mariage. Todos os direitos reservados.</p>
				</div>
			</footer>
		</div>
	);
}