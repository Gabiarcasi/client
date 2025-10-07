/**
 * Página: CoupleSitePage
 *
 * @description Este componente React representa uma página web pública
 * para o casamento. Ele exibe informações como os nomes dos noivos,
 * a data do evento, a história do casal e os detalhes da cerimónia e
 * recepção. Os dados são buscados da API usando um "slug" único
 * fornecido na URL.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCoupleNames } from '../utils/formatters'; // Adicione esta linha
import '../css/CoupleSitePage.css';

/**
 * @returns {JSX.Element} A página pública do site do casal.
 */
export default function CoupleSitePage() {
	// Hook para extrair parâmetros dinâmicos da URL, como o "slug".
	const { slug } = useParams();
	
	// Estados para armazenar os dados do site, o estado de carregamento e erros.
	const [siteData, setSiteData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	/**
	 * Efeito que busca os dados do site da API com base no "slug".
	 *
	 * @description O efeito é executado apenas quando o componente é montado
	 * ou quando o `slug` na URL muda. Ele faz uma requisição para um endpoint
	 * público da API para obter as informações do site.
	 */
	useEffect(() => {
		const fetchSiteData = async () => {
			if (!slug) return;
			try {
				const response = await api.get(`/public/site/${slug}`);
				setSiteData(response.data);
			} catch (err) {
				setError('Oops! Não encontrámos o site que procura.');
			} finally {
				setLoading(false);
			}
		};
		fetchSiteData();
	}, [slug]);

	// Renderização condicional com base no estado da requisição.
	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage>{error}</ErrorMessage>;
	// Retorna uma mensagem se nenhum dado for encontrado após o carregamento.
	if (!siteData) return <p>Nenhum dado para exibir.</p>;

	// Formata a data e hora do casamento para exibição amigável.
	const weddingDate = new Date(siteData.wedding_date).toLocaleDateString('pt-BR', {
		year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
	});

	return (
		<div className="site_container">
			{/* Cabeçalho do site com os nomes e a data */}
			<header className="site_header">
				{/* A linha abaixo foi alterada para usar a função de formatação */}
				<h1 className="site_couple_names">{formatCoupleNames(siteData.bride_name, siteData.groom_name)}</h1>
				<p className="site_date">Vão casar-se em {weddingDate}</p>
			</header>

			{/* Seção "A Nossa História" */}
			<section className="site_section">
				<h2 className="site_section_title">A Nossa História</h2>
				<p className="site_story">{siteData.our_story || 'Em breve, partilharemos a nossa história aqui.'}</p>
			</section>

			{/* Seção "Detalhes do Evento" */}
			<section className="site_section">
				<h2 className="site_section_title">Detalhes do Evento</h2>
				<div className="site_location">
					<p><strong>Cerimónia:</strong> {siteData.ceremony_location || 'Local a ser definido.'}</p>
					<p><strong>Festa:</strong> {siteData.reception_location || 'Local a ser definido.'}</p>
				</div>
			</section>
		</div>
	);
}