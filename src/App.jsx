/**
 * Componente Principal da Aplicação (App.jsx)
 *
 * @description Este é o componente raiz da sua aplicação React. Ele é o
 * ponto central onde a configuração do roteamento é definida, usando
 * o React Router DOM. Ele organiza as rotas em diferentes layouts
 * (público, pré-painel, e painel principal) e as protege com um
 * componente de autenticação.
 */

// Importa os módulos necessários do React e do React Router DOM
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importa os componentes de Layout
import PublicLayout from './components/PublicLayout';
import PreDashboardLayout from './components/PreDashboardLayout';
import DashboardLayout from './components/DashboardLayout';

// Importa o componente de proteção de rotas privadas
import PrivateRoutes from './components/PrivateRoutes';

// Importa todas as páginas (componentes de rota) da aplicação
// Páginas Públicas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CoupleSitePage from './pages/CoupleSitePage';
import RsvpPage from './pages/RsvpPage';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Páginas Pré-Dashboard (privadas, mas com um layout diferente)
import WeddingSelectionPage from './pages/WeddingSelectionPage';
import CreateWeddingPage from './pages/CreateWeddingPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import PendingInvitationsPage from './pages/PendingInvitationsPage'; // Adicione esta linha

// Páginas do Dashboard (privadas, com o layout do painel principal)
import DashboardPage from './pages/DashboardPage';
import MyWeddingPage from './pages/MyWeddingPage';
import GuestsPage from './pages/GuestsPage';
import SiteEditorPage from './pages/SiteEditorPage';
import VendorsPage from './pages/VendorsPage';
import BudgetPage from './pages/BudgetPage';
import TeamPage from './pages/TeamPage';


/**
 * @returns {JSX.Element} O componente raiz da aplicação com a configuração de rotas.
 */
function App() {
	return (
		// Envolve toda a aplicação com o Router para habilitar o roteamento.
		<Router>
			{/* O componente Routes gerencia a renderização da rota correspondente */}
			<Routes>
				{/*
				 * Rotas Públicas Aninhadas
				 * O elemento pai <Route element={<PublicLayout />}> define um layout
				 * comum para todas as rotas filhas. O conteúdo de cada rota filha
				 * será renderizado dentro do <Outlet /> do PublicLayout.
				 */}
				<Route element={<PublicLayout />}>
					<Route path="/" element={<LandingPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/verify-email" element={<VerifyEmailPage />} />
					<Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
					<Route path="/reset-password" element={<ResetPasswordPage />} />
				</Route>

				{/*
				 * Rotas Públicas Especiais (sem um layout aninhado)
				 * Estas rotas não compartilham o layout padrão e são renderizadas
				 * diretamente.
				 */}
				<Route path="/site/:slug" element={<CoupleSitePage />} />
				<Route path="/rsvp/:token" element={<RsvpPage />} />
				
				{/*
				 * Rotas Privadas (Protegidas)
				 * O componente <PrivateRoutes /> atua como um "guardião". Ele
				 * verifica a autenticação do usuário. Se autenticado, ele renderiza
				 * as rotas filhas; caso contrário, ele redireciona para a página de login.
				 */}
				<Route element={<PrivateRoutes />}>
					{/*
					 * Rotas Aninhadas com o Layout Pré-Dashboard
					 * Usado para a seleção e criação de casamentos.
					 */}
					<Route element={<PreDashboardLayout />}>
						<Route path="/select-wedding" element={<WeddingSelectionPage />} />
						<Route path="/create-wedding" element={<CreateWeddingPage />} />
						<Route path="/accept-invitation" element={<AcceptInvitationPage />} />
						<Route path="/pending-invitations" element={<PendingInvitationsPage />} /> {/* Adicione esta linha */}
					</Route>
					
					{/*
					 * Rotas Aninhadas com o Layout do Dashboard Principal
					 * O componente DashboardLayout fornece a barra lateral e a estrutura
					 * do painel para todas as rotas filhas.
					 */}
					<Route path="/dashboard" element={<DashboardLayout />}>
						{/* `index` define a rota padrão para `/dashboard` */}
						<Route index element={<DashboardPage />} />
						<Route path="edit-wedding" element={<MyWeddingPage />} />
						<Route path="guests" element={<GuestsPage />} />
						<Route path="site-editor" element={<SiteEditorPage />} />
						<Route path="vendors" element={<VendorsPage />} />
						<Route path="budget" element={<BudgetPage />} />
						<Route path="team" element={<TeamPage />} />
					</Route>
				</Route>
			</Routes>
		</Router>
	);
}

export default App;