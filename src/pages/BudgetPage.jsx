/**
 * Página: BudgetPage
 *
 * @description Este componente React representa a página de gerenciamento
 * de orçamento e despesas do casamento. Ele permite que os usuários
 * visualizem, adicionem, editem e excluam itens de orçamento, vinculando-os
 * a fornecedores e rastreando seus status de decisão e pagamento.
 */

// Importa os hooks e componentes necessários do React e React Router
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Importa componentes do React-Bootstrap para a UI
import { Dropdown, Button, Form, Row, Col } from 'react-bootstrap';

// Importa os serviços e componentes personalizados
import api from '../services/api';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BudgetModal from '../components/BudgetModal';

/**
 * Componente auxiliar para exibir um badge com base no status da decisão.
 * @param {object} props - As propriedades do componente.
 * @param {string} props.status - O status da decisão ('Contratado', 'Recusado', 'Analisando').
 */
const DecisionStatusBadge = ({ status }) => {
	let bg = 'secondary';
	if (status === 'Contratado') bg = 'success';
	if (status === 'Recusado') bg = 'danger';
	if (status === 'Analisando') bg = 'warning';
	return <span className={`badge rounded-pill bg-${bg}`}>{status}</span>;
};

/**
 * Componente auxiliar para exibir um badge com base no status do pagamento.
 * @param {object} props - As propriedades do componente.
 * @param {string} props.status - O status do pagamento ('Pago', 'Pago Parcialmente', 'Pendente').
 */
const PaymentStatusBadge = ({ status }) => {
	let badgeClass = '';
	switch (status) {
		case 'Pago': badgeClass = 'status_hired'; break;
		case 'Pago Parcialmente': badgeClass = 'status_contacted'; break;
		default: badgeClass = 'status_pending'; break;
	}
	return <span className={`status_badge ${badgeClass}`}>{status || 'Pendente'}</span>;
};

/**
 * @returns {JSX.Element} A página de orçamento.
 */
export default function BudgetPage() {
	// Obtém o casamento selecionado do contexto.
	const { selectedWedding } = useWedding();
	
	// Estados locais para gerenciar os dados da página e a UI.
	const [budgetItems, setBudgetItems] = useState([]);
	const [vendors, setVendors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentItem, setCurrentItem] = useState(null);

	// Estados para os filtros
	const [searchParams] = useSearchParams();
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [vendorFilter, setVendorFilter] = useState(searchParams.get('vendor') || 'all');

	/**
	 * Função para buscar os dados iniciais do orçamento e fornecedores.
	 * Usa `useCallback` para memorizar a função e evitar recriações desnecessárias.
	 */
	const fetchInitialData = useCallback(async () => {
		if (!selectedWedding) return;
		setLoading(true);
		try {
			// Busca os dados de forma paralela para melhor performance.
			const [budgetRes, vendorsRes] = await Promise.all([
				api.get(`/budget/wedding/${selectedWedding.wedding_id}`),
				api.get(`/vendors/wedding/${selectedWedding.wedding_id}`)
			]);
			setBudgetItems(budgetRes.data);
			setVendors(vendorsRes.data);
		} catch (err) {
			setError('Não foi possível carregar os dados da página.');
			console.error(err);
		} finally { setLoading(false); }
	}, [selectedWedding]);

	/**
	 * Efeito que busca os dados quando o componente é montado ou quando `fetchInitialData` muda.
	 */
	useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

	/**
	 * `useMemo` para filtrar os itens do orçamento de forma eficiente.
	 * A lista só é recalculada quando `budgetItems`, `categoryFilter` ou `vendorFilter` mudam.
	 */
	const filteredItems = useMemo(() => {
		return budgetItems.filter(item => {
			const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
			const vendorMatch = vendorFilter === 'all' || (vendorFilter === 'none' && !item.vendor_id) || item.vendor_id === vendorFilter;
			return categoryMatch && vendorMatch;
		});
	}, [budgetItems, categoryFilter, vendorFilter]);

	/**
	 * `useMemo` para calcular os totais de forma eficiente.
	 * Os totais só são recalculados quando a lista de itens filtrada muda.
	 */
	const totals = useMemo(() => {
		return filteredItems.reduce((acc, item) => {
			if (item.decision_status === 'Contratado') {
				acc.contracted += parseFloat(item.final_value) || 0;
				acc.paid += parseFloat(item.paid_value) || 0;
			}
			return acc;
		}, { contracted: 0, paid: 0 });
	}, [filteredItems]);

	// Funções para gerenciar o modal.
	const handleOpenModal = (item = null) => { setCurrentItem(item); setIsModalOpen(true); };
	const handleCloseModal = () => setIsModalOpen(false);

	/**
	 * Lógica para salvar ou atualizar um item do orçamento.
	 * @param {object} formData - Os dados do formulário.
	 * @param {string} weddingId - O ID do casamento.
	 */
	const handleSaveItem = (formData, weddingId) => {
		const isEditMode = !!formData.item_id;
		const apiCall = isEditMode ? api.put(`/budget/${formData.item_id}`, formData) : api.post(`/budget/wedding/${weddingId}`, formData);
		return apiCall.then(() => fetchInitialData());
	};

	/**
	 * Lógica para deletar um item do orçamento.
	 * @param {string} itemId - O ID do item a ser excluído.
	 */
	const handleDelete = async (itemId) => {
		if (window.confirm('Tem a certeza de que deseja apagar este item?')) {
			try {
				await api.delete(`/budget/${itemId}`);
				fetchInitialData();
			} catch (err) { setError('Não foi possível apagar o item.'); }
		}
	};

	/**
	 * Lógica para atualizar o status de decisão de um item.
	 * @param {object} item - O item a ser atualizado.
	 * @param {string} newStatus - O novo status de decisão.
	 */
	const handleDecisionStatusChange = async (item, newStatus) => {
		const originalItems = [...budgetItems];
		try {
			// Atualização otimista da UI para uma resposta instantânea.
			setBudgetItems(budgetItems.map(i => i.item_id === item.item_id ? { ...i, decision_status: newStatus } : i));
			await api.patch(`/budget/${item.item_id}/status`, { decision_status: newStatus });
			await fetchInitialData(); // Atualiza os dados após a requisição.
		} catch (error) {
			setError('Não foi possível alterar o status.');
			setBudgetItems(originalItems); // Reverte a UI em caso de erro.
		}
	};

	// Exibe o spinner de carregamento enquanto os dados são buscados.
	if (loading) return <LoadingSpinner />;

	// Cria uma lista única de categorias para o filtro.
	const categories = [...new Set(budgetItems.map(item => item.category))].sort();

	return (
		<div className="container-fluid">
			<Row className="align-items-center mb-4">
				<Col xs={9}>
					<h1 className="title_h1">Orçamentos e Despesas</h1>
					<p className="subtitle_main mb-0">Adicione propostas de fornecedores e gira as suas despesas contratadas.</p>
				</Col>
				<Col xs={3} className="text-end">
					<button className="button_primary" onClick={() => handleOpenModal()}><i className="bi bi-plus-lg me-2"></i>Adicionar Item</button>
				</Col>
			</Row>
			
			<div className="row mb-4">
				<div className="col-md-4"><div className="dashboard_widget_card text-center"><h2 className="widget_title justify-content-center">Total Contratado</h2><p className="countdown_number">R${totals.contracted.toFixed(2)}</p></div></div>
				<div className="col-md-4"><div className="dashboard_widget_card text-center"><h2 className="widget_title justify-content-center">Total Pago</h2><p className="countdown_number text-success">R${totals.paid.toFixed(2)}</p></div></div>
				<div className="col-md-4"><div className="dashboard_widget_card text-center"><h2 className="widget_title justify-content-center">Saldo Pendente</h2><p className="countdown_number text-danger">R${(totals.contracted - totals.paid).toFixed(2)}</p></div></div>
			</div>

			<div className="form_card filter_panel mb-4">
				<Row>
					<Col md={6}>
						<Form.Group>
							<Form.Label className="filter_label">Filtrar por Fornecedor</Form.Label>
							<Form.Select className="form_input" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
								<option value="all">Todos os Fornecedores</option>
								{vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>)}
								<option value="none">Sem Fornecedor Vinculado</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col md={6}>
						<Form.Group>
							<Form.Label className="filter_label">Filtrar por Categoria</Form.Label>
							<Form.Select className="form_input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
								<option value="all">Todas as Categorias</option>
								{categories.map(c => <option key={c} value={c}>{c}</option>)}
							</Form.Select>
						</Form.Group>
					</Col>
				</Row>
			</div>

			<ErrorMessage>{error}</ErrorMessage>
			
			<div className="form_card">
				<h2 className="form_card_title">Lista de Itens ({filteredItems.length})</h2>
				<div className="table-responsive">
					<table className="table guest_table">
						<thead>
							<tr>
								<th>Status da Decisão</th>
								<th>Status do Pagamento</th>
								<th>Descrição</th>
								<th>Fornecedor</th>
								<th>Valor Final</th>
								<th>Pago</th>
								<th className="text-center">Ações</th>
							</tr>
						</thead>
						<tbody>
							{filteredItems.map(item => (
								<tr key={item.item_id}>
									<td>
										<Dropdown onSelect={(status) => handleDecisionStatusChange(item, status)}>
											<Dropdown.Toggle as="a" bsPrefix="p-0" style={{ textDecoration: 'none', cursor: 'pointer' }}>
												<DecisionStatusBadge status={item.decision_status} />
											</Dropdown.Toggle>
											<Dropdown.Menu>
												<Dropdown.Item eventKey="Analisando">Analisando</Dropdown.Item>
												<Dropdown.Item eventKey="Contratado">Contratado</Dropdown.Item>
												<Dropdown.Item eventKey="Recusado">Recusado</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									</td>
									<td><PaymentStatusBadge status={item.payment_status} /></td>
									<td>{item.description}</td>
									<td>{vendors.find(v => v.vendor_id === item.vendor_id)?.vendor_name || '-'}</td>
									<td>R${(parseFloat(item.final_value) || 0).toFixed(2)}</td>
									<td>R${(parseFloat(item.paid_value) || 0).toFixed(2)}</td>
									<td className="text-center">
										<button className="button_action" title="Editar" onClick={() => handleOpenModal(item)}><i className="bi bi-pencil-square"></i></button>
										<button className="button_action text-danger" title="Apagar" onClick={() => handleDelete(item.item_id)}><i className="bi bi-trash3-fill"></i></button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			{/* Componente Modal para adicionar/editar itens */}
			<BudgetModal show={isModalOpen} onHide={handleCloseModal} onSave={handleSaveItem} weddingId={selectedWedding.wedding_id} initialData={currentItem} />
		</div>
	);
}