/**
 * Página: DashboardPage
 *
 * @description Este componente React é o painel principal da aplicação.
 * Ele fornece uma visão geral rápida do casamento selecionado, incluindo
 * uma contagem regressiva para a data do evento, um resumo das confirmações
 * de presença (RSVP) e um resumo do orçamento.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { formatCoupleNames } from '../utils/formatters'; // Adicione esta linha
import '../css/DashboardPage.css';

/**
 * Hook customizado para gerenciar a contagem regressiva para uma data alvo.
 *
 * @param {string} targetDate - A data e hora para a qual a contagem é feita.
 * @returns {object} Um objeto contendo os dias, horas, minutos e segundos restantes.
 */
const useCountdown = (targetDate) => {
	const calculateTimeLeft = () => {
		const difference = +new Date(targetDate) - +new Date();
		let timeLeft = {};
		if (difference > 0) {
			timeLeft = {
				dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
				horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
				minutos: Math.floor((difference / 1000 / 60) % 60),
				segundos: Math.floor((difference / 1000) % 60),
			};
		}
		return timeLeft;
	};
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
	useEffect(() => {
		const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
		// Limpa o timer quando o componente é desmontado para evitar vazamento de memória.
		return () => clearTimeout(timer);
	});
	return timeLeft;
};

/**
 * Componente auxiliar para exibir um resumo do RSVP.
 *
 * @param {object} props - As propriedades do componente.
 * @param {string} props.weddingId - O ID do casamento para buscar as estatísticas.
 * @returns {JSX.Element} O widget de RSVP.
 */
const RsvpWidget = ({ weddingId }) => {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (!weddingId) return;
		const fetchRsvpStats = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/guests/stats/wedding/${weddingId}`);
				setStats(response.data);
			} catch (error) {
				console.error("Failed to fetch RSVP stats", error);
				setStats(null);
			} finally { setLoading(false); }
		};
		fetchRsvpStats();
	}, [weddingId]);

	if (loading) return <p className="widget_placeholder_text">A carregar estatísticas...</p>;
	if (!stats || stats.total_guests === '0') return <p className="widget_placeholder_text">Adicione convidados para ver as estatísticas.</p>;
	
	const total = parseInt(stats.total_guests);
	const confirmed = parseInt(stats.confirmed);
	const declined = parseInt(stats.declined);
	const responded = confirmed + declined;
	const respondedPercent = total > 0 ? (responded / total) * 100 : 0;
	const confirmedPercent = total > 0 ? (confirmed / total) * 100 : 0;
	const declinedPercent = total > 0 ? (declined / total) * 100 : 0;
	const gradient = `conic-gradient(var(--success-text) 0% ${confirmedPercent}%, var(--error-text) ${confirmedPercent}% ${confirmedPercent + declinedPercent}%, var(--border-color) ${confirmedPercent + declinedPercent}% 100%)`;

	return (
		<div className="rsvp_widget_container">
			<div className="rsvp_chart" style={{ background: gradient }}>
				<div className="chart_center"><span>{respondedPercent.toFixed(0)}%</span><small>Responderam</small></div>
			</div>
			<div className="rsvp_legend">
				<div className="legend_item">
					<span className="legend_color" style={{ backgroundColor: 'var(--success-text)' }}></span>
					<div><strong>{confirmed} Confirmados</strong><small>{confirmedPercent.toFixed(1)}% do total</small></div>
				</div>
				<div className="legend_item">
					<span className="legend_color" style={{ backgroundColor: 'var(--error-text)' }}></span>
					<div><strong>{declined} Recusaram</strong><small>{declinedPercent.toFixed(1)}% do total</small></div>
				</div>
				<div className="legend_item">
					<span className="legend_color" style={{ backgroundColor: 'var(--border-color)' }}></span>
					<div><strong>{stats.pending} Pendentes</strong><small>{((total - responded) / total * 100).toFixed(1)}% do total</small></div>
				</div>
			</div>
		</div>
	);
};

/**
 * Componente auxiliar para exibir um resumo do orçamento.
 *
 * @param {object} props - As propriedades do componente.
 * @param {string} props.weddingId - O ID do casamento para buscar os itens de orçamento.
 * @returns {JSX.Element} O widget de orçamento.
 */
const BudgetWidget = ({ weddingId }) => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!weddingId) return;
		const fetchBudgetItems = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/budget/wedding/${weddingId}`);
				setItems(response.data);
			} catch (error) {
				console.error("Failed to fetch budget items for widget", error);
				setItems([]);
			} finally {
				setLoading(false);
			}
		};
		fetchBudgetItems();
	}, [weddingId]);

	const totals = useMemo(() => {
		return items.reduce((acc, item) => {
			if (['Contratado', 'Pago Parcialmente', 'Pago'].includes(item.decision_status)) {
				acc.contracted += parseFloat(item.final_value) || 0;
				acc.paid += parseFloat(item.paid_value) || 0;
			}
			return acc;
		}, { contracted: 0, paid: 0 });
	}, [items]);
	
	if (loading) return <p className="widget_placeholder_text">Carregando orçamento...</p>;

	const progress = totals.contracted > 0 ? (totals.paid / totals.contracted) * 100 : 0;

	return (
		<div className="budget_widget_container">
			<div className="finance_labels">
				<span className="label_paid">PAGO: R${totals.paid.toFixed(2)}</span>
				<span className="label_total">DE: R${totals.contracted.toFixed(2)}</span>
			</div>
			<div className="progress_bar_container">
				<div className="progress_bar_fill" style={{ width: `${progress}%` }}></div>
			</div>
			<div className="widget_footer">
				<span>Saldo pendente: <strong>R${(totals.contracted - totals.paid).toFixed(2)}</strong></span>
				<Link to="/dashboard/budget" className="widget_link">Ver detalhes <i className="bi bi-arrow-right-short"></i></Link>
			</div>
		</div>
	);
};


/**
 * @returns {JSX.Element} A página principal do painel (Dashboard).
 */
export default function DashboardPage() {
	// Obtém o casamento selecionado e o estado de carregamento do contexto.
	const { selectedWedding, loading } = useWedding();
	// Usa o hook customizado para a contagem regressiva.
	const timeLeft = useCountdown(selectedWedding?.wedding_date);

	// Exibe o spinner se os dados do casamento ainda estiverem sendo carregados.
	if (loading) return <LoadingSpinner message="Carregando seu painel..." />;

	// Exibe uma mensagem de boas-vindas se nenhum casamento estiver selecionado.
	if (!selectedWedding) return (
		<div className="dashboard_header">
			<h1 className="page_title">Bem-vindo(a) ao Mariage!</h1>
			<p className="page_subtitle">Selecione um casamento ou crie um novo para começar.</p>
		</div>
	);

	return (
		<div>
			<div className="dashboard_header">
				{/* A linha abaixo foi alterada para usar a função de formatação */}
				<h1 className="page_title">Planejamento de {formatCoupleNames(selectedWedding.bride_name, selectedWedding.groom_name)}</h1>
				<p className="page_subtitle">Aqui está um resumo do seu grande dia.</p>
			</div>

			<div className="row g-4">
				{/* Widget de Contagem Regressiva */}
				<div className="col-12">
					<div className="dashboard_widget_card">
						<h2 className="widget_title"><i className="bi bi-clock-history"></i>Contagem Regressiva</h2>
						<div className="countdown_container">
							<div className="countdown_item">
								<span className="countdown_number">{timeLeft.dias || 0}</span>
								<span className="countdown_label">Dias</span>
							</div>
							<div className="countdown_item">
								<span className="countdown_number">{timeLeft.horas || 0}</span>
								<span className="countdown_label">Horas</span>
							</div>
							<div className="countdown_item">
								<span className="countdown_number">{timeLeft.minutos || 0}</span>
								<span className="countdown_label">Minutos</span>
							</div>
							<div className="countdown_item">
								<span className="countdown_number">{timeLeft.segundos || 0}</span>
								<span className="countdown_label">Segundos</span>
							</div>
						</div>
					</div>
				</div>
				
				{/* Widget de Orçamento */}
				<div className="col-md-6">
					<div className="dashboard_widget_card p-4" style={{ height: '100%' }}>
						<h2 className="widget_title"><i className="bi bi-cash-coin"></i>Resumo do Orçamento</h2>
						<BudgetWidget weddingId={selectedWedding.wedding_id} />
					</div>
				</div>
				
				{/* Widget de RSVP */}
				<div className="col-md-6">
					<div className="dashboard_widget_card p-4" style={{ height: '100%' }}>
						<h2 className="widget_title"><i className="bi bi-check2-circle"></i>Confirmações de Presença</h2>
						<RsvpWidget weddingId={selectedWedding.wedding_id} />
					</div>
				</div>
			</div>
		</div>
	);
}