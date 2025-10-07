/**
 * Componente: PreDashboardLayout
 *
 * @description Este componente React é um layout container projetado para as
 * páginas que antecedem o painel de controle principal, como a seleção de
 * um casamento ou a criação de um novo. Ele fornece uma estrutura de página
 * consistente, incluindo um cabeçalho de navegação (UserNavbar) e uma área de
 * conteúdo principal.
 */

// Importa os módulos e hooks necessários do React e React Router
import React from 'react';
import { Outlet } from 'react-router-dom';

// Importa os componentes e estilos específicos
import UserNavbar from './UserNavbar';
import '../css/PreDashboardLayout.css';

/**
 * @returns {JSX.Element} O layout para as páginas pré-painel.
 */
export default function PreDashboardLayout() {
	return (
		<div className="pre_dashboard_layout">
			{/* Componente de navegação do usuário, fixo no topo da página. */}
			<UserNavbar />
			
			{/* Área de conteúdo principal onde as rotas aninhadas serão renderizadas. */}
			<main className="pre_dashboard_content">
				{/*
				 * O componente <Outlet /> é um espaço reservado do React Router
				 * que renderiza o componente da rota filha correspondente.
				 * Neste caso, ele renderizará páginas como `SelectWedding.jsx`
				 * ou `CreateWedding.jsx`.
				 */}
				<Outlet />
			</main>
		</div>
	);
}