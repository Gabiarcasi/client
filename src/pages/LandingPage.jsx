/**
 * Página: LandingPage
 *
 * @description Este componente React representa a página de destino (landing page)
 * da sua aplicação. É uma página de apresentação estática, projetada para
 * atrair novos utilizadores, destacando as principais funcionalidades do
 * serviço de planeamento de casamentos.
 */

// Importa o componente Link para navegação
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css'; 

/**
 * @returns {JSX.Element} A página de destino da aplicação.
 */
export default function LandingPage() {
	return (
		<>
			{/* Seção Principal (Hero Section) */}
			<section className="container-fluid hero_section landing_page_section">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<h1 className="hero_headline">O planejamento do seu casamento, organizado em um só lugar.</h1>
							<p className="hero_subheadline">
								Desde a lista de convidados até o controle de orçamento, tudo o que você precisa para o grande dia,
								com a elegância e simplicidade que vocês merecem.
							</p>
							{/* Link de Chamada para Ação (Call to Action) */}
							<Link to="/register" className="cta_button button_primary">
								Comece a planejar gratuitamente
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Seção de Funcionalidades (Features Section) */}
			<section className="container-fluid features_section landing_page_section">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<h2 className="section_title">Ferramentas para um Dia Perfeito</h2>
						</div>
					</div>
					<div className="row mt-4">
						{/* Item de Funcionalidade 1 */}
						<div className="col-md-4 feature_item">
							<div className="feature_icon"><i className="bi bi-people-fill"></i></div>
							<h3 className="feature_title">Gestão de Convidados</h3>
							<p>Organize sua lista, envie convites e controle confirmações (RSVP) sem esforço.</p>
						</div>
						{/* Item de Funcionalidade 2 */}
						<div className="col-md-4 feature_item">
							<div className="feature_icon"><i className="bi bi-gem"></i></div>
							<h3 className="feature_title">Site dos Noivos</h3>
							<p>Crie um site lindo e personalizado para compartilhar sua história e detalhes do evento.</p>
						</div>
						{/* Item de Funcionalidade 3 */}
						<div className="col-md-4 feature_item">
							<div className="feature_icon"><i className="bi bi-cash-coin"></i></div>
							<h3 className="feature_title">Controle de Orçamento</h3>
							<p>Uma planilha inteligente para você não perder nenhum detalhe dos seus investimentos.</p>
						</div>
					</div>
				</div>
			</section>

			{/* Seção de Depoimentos (Testimonial Section) */}
			<section className="container-fluid testimonial_section landing_page_section">
				<div className="container">
					<div className="row">
						<div className="col-12 text-center">
							<h2 className="section_title">O que dizem os nossos casais</h2>
							<blockquote className="testimonial_text">
								"Usar o Mariage foi a decisão mais acertada do nosso planejamento. A plataforma é intuitiva,
								delicada e nos deu a paz de espírito que precisávamos. Nossos convidados amaram o site!"
							</blockquote> 
							<p className="testimonial_author">- Ana & João</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}