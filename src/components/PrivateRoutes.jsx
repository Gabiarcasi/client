/**
 * Componente: PrivateRoutes
 *
 * @description Este componente atua como um "guardião de rota" para as páginas
 * privadas da aplicação. Ele é responsável por verificar a autenticação do
 * usuário e, se o usuário estiver autenticado, disponibilizar o contexto de
 * casamento (`WeddingContext`) para todas as rotas filhas.
 */

// Importa os módulos e hooks necessários do React e React Router
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Importa o provedor de contexto para o casamento
import { WeddingProvider } from '../contexts/WeddingContext';

/**
 * @returns {JSX.Element} O componente que protege as rotas.
 */
const PrivateRoutes = () => {
	// 1. Verifica a existência do token de autenticação no localStorage.
	const token = localStorage.getItem('authToken');
	
	// 2. Se o token não existir, redireciona o usuário para a página de login.
	// O `replace` impede que o usuário volte para a página anterior.
	if (!token) {
		return <Navigate to="/login" replace />;
	}

	// 3. Se o token existir, o usuário está autenticado.
	// O componente renderiza o WeddingProvider, que envolve o <Outlet />.
	// Isso garante que todas as rotas aninhadas renderizadas pelo <Outlet />
	// (todas as páginas do painel, por exemplo) terão acesso ao contexto de casamento.
	return (
		<WeddingProvider>
			<Outlet />
		</WeddingProvider>
	);
};

export default PrivateRoutes;