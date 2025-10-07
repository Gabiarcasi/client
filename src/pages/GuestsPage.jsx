/**
 * Página: GuestsPage
 *
 * @description Este componente React é a interface de gestão de convidados.
 * Ele permite aos utilizadores visualizar, adicionar, editar, remover e
 * filtrar convidados para o casamento selecionado. A página inclui um
 * sistema de filtros, uma tabela interativa e um modal para a gestão de
 * detalhes de cada convidado.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Dropdown } from 'react-bootstrap';
import api from '../services/api';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatPhoneNumber } from '../utils/formatters';
import { formatCoupleNames } from '../utils/formatters';
import '../css/GuestsPage.css';

/**
 * Componente de crachá para exibir o status do RSVP.
 *
 * @param {object} props - As propriedades do componente.
 * @param {string} props.status - O status do convidado ('confirmed', 'declined', 'pending').
 * @returns {JSX.Element} O crachá de status formatado.
 */
const RsvpStatusBadge = ({ status }) => {
	let statusClass = '', statusText = 'Pendente';
	switch (status) {
		case 'confirmed':
			statusClass = 'status_confirmed';
			statusText = 'Confirmado';
			break;
		case 'declined':
			statusClass = 'status_declined';
			statusText = 'Recusado';
			break;
		default:
			statusClass = 'status_pending';
			break;
	}
	return (
		<div className={`guest_status_badge ${statusClass}`}>
			<span className="status_dot"></span>
			{statusText}
		</div>
	);
};

/**
 * Componente de alternância para o dropdown de status.
 *
 * @param {object} props - As propriedades do componente.
 * @param {React.Ref} ref - Referência para o elemento.
 * @returns {JSX.Element} O botão de alternância do dropdown.
 */
const CustomStatusToggle = React.forwardRef(({ children, onClick }, ref) => (
	<a href="" ref={ref} onClick={(e) => { e.preventDefault(); onClick(e); }} className="custom_status_toggle">{children}</a>
));

/**
 * @returns {JSX.Element} A página de gestão de convidados.
 */
export default function GuestsPage() {
	// Obtém o casamento selecionado do contexto
	const { selectedWedding } = useWedding();
	
	// Estados para dados, carregamento, erros e modal
	const [guests, setGuests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedGuest, setSelectedGuest] = useState(null);
	const [formData, setFormData] = useState({});
	
	// Estados para filtragem da lista
	const [statusFilter, setStatusFilter] = useState('all');
	const [groupFilter, setGroupFilter] = useState('all');

	/**
	 * Função para buscar a lista de convidados da API.
	 * O useCallback garante que a função só será recriada se o selectedWedding mudar.
	 */
	const fetchGuests = useCallback(async () => {
		if (!selectedWedding) { setLoading(false); return; }
		try {
			setLoading(true);
			const response = await api.get(`/guests/wedding/${selectedWedding.wedding_id}`);
			setGuests(response.data);
		} catch (err) {
			setError('Falha ao carregar a lista de convidados.');
		} finally {
			setLoading(false);
		}
	}, [selectedWedding]);

	// Chama a função de busca quando o componente é montado ou a dependência muda
	useEffect(() => { fetchGuests(); }, [fetchGuests]);

	/**
	 * Usa useMemo para filtrar a lista de convidados,
	 * recalculando apenas quando a lista de convidados ou os filtros mudam.
	 */
	const filteredGuests = useMemo(() => {
		return guests.filter(guest => {
			const statusMatch = statusFilter === 'all' || (guest.rsvp_status || 'pending') === statusFilter;
			const groupMatch = groupFilter === 'all' || guest.guest_group === groupFilter;
			return statusMatch && groupMatch;
		});
	}, [guests, statusFilter, groupFilter]);

	/**
	 * Funções para gerenciar o modal de adição/edição.
	 */
	const handleOpenModal = (guest = null) => {
		setError('');
		if (guest) {
			setIsEditMode(true);
			setSelectedGuest(guest);
			setFormData(guest);
		} else {
			setIsEditMode(false);
			setSelectedGuest(null);
			setFormData({ full_name: '', guest_group: 'Amigos da Noiva', rsvp_status: 'pending' });
		}
		setIsModalOpen(true);
	};
	
	const handleCloseModal = () => setIsModalOpen(false);

	/**
	 * Manipula as mudanças nos campos do formulário do modal.
	 * Utiliza a função formatPhoneNumber para formatar o número de telefone.
	 */
	const handleFormChange = (e) => {
		const { name, value } = e.target;
		if (name === 'contact_info') {
			const formattedValue = formatPhoneNumber(value);
			setFormData({ ...formData, [name]: formattedValue });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	/**
	 * Função para lidar com a submissão do formulário.
	 * Realiza uma requisição POST para adicionar ou PUT para editar.
	 */
	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const apiCall = isEditMode
			? api.put(`/guests/${selectedGuest.guest_id}`, formData)
			: api.post(`/guests/wedding/${selectedWedding.wedding_id}`, formData);
		try {
			await apiCall;
			fetchGuests();
			handleCloseModal();
		} catch (err) {
			setError(err.response?.data?.error || 'Ocorreu um erro ao salvar o convidado.');
		}
	};
	
	/**
	 * Função para remover um convidado.
	 */
	const handleDelete = async (guestId) => {
		if (window.confirm('Tem a certeza de que deseja remover este convidado?')) {
			try {
				await api.delete(`/guests/${guestId}`);
				setGuests(guests.filter(g => g.guest_id !== guestId));
			} catch (err) {
				setError('Erro ao remover convidado.');
			}
		}
	};

	/**
	 * Função para atualizar o status do RSVP diretamente da tabela.
	 * A abordagem otimista é usada (atualiza o estado primeiro, depois a API).
	 */
	const handleStatusChange = async (guestToUpdate, newStatus) => {
		const originalGuests = [...guests];
		const updatedGuests = guests.map(g => g.guest_id === guestToUpdate.guest_id ? { ...g, rsvp_status: newStatus } : g);
		setGuests(updatedGuests);
		try {
			await api.put(`/guests/${guestToUpdate.guest_id}`, { ...guestToUpdate, rsvp_status: newStatus });
		} catch (err) {
			setError('Não foi possível atualizar o status. Tente novamente.');
			setGuests(originalGuests);
		}
	};

	if (!selectedWedding) return <p>Por favor, selecione um casamento para gerir os convidados.</p>;

	return (
		<div className="container-fluid">
			{/* Título e botão de adicionar */}
			<Row className="align-items-center mb-4">
				<Col xs={9}>
					<h1 className="title_h1">Lista de Convidados</h1>
					<p className="subtitle_main mb-0">Gestão de convidados para o casamento de <strong>{formatCoupleNames(selectedWedding.bride_name, selectedWedding.groom_name)}</strong>.</p>
				</Col>
				<Col xs={3} className="text-end">
					<button className="button_primary" onClick={() => handleOpenModal()}>
						<i className="bi bi-plus-lg me-2"></i>Adicionar Convidado
					</button>
				</Col>
			</Row>
			{/* Painel de filtros */}
			<div className="form_card filter_panel mb-4">
				<Row className="align-items-center">
					<Col md={5}>
						<Form.Group>
							<Form.Label className="filter_label">Filtrar por Grupo</Form.Label>
							<Form.Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="form_input">
								<option value="all">Todos os Grupos</option>
								<option value="Amigos da Noiva">Amigos da Noiva</option>
								<option value="Amigos do Noivo">Amigos do Noivo</option>
								<option value="Família da Noiva">Família da Noiva</option>
								<option value="Família do Noivo">Família do Noivo</option>
								<option value="Outro">Outro</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col md={5}>
						<Form.Group>
							<Form.Label className="filter_label">Filtrar por Status</Form.Label>
							<Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form_input">
								<option value="all">Todos os Status</option>
								<option value="pending">Pendente</option>
								<option value="confirmed">Confirmado</option>
								<option value="declined">Recusado</option>
							</Form.Select>
						</Form.Group>
					</Col>
					<Col md={2} className="text-end">
						<span className="filter_results_count">{filteredGuests.length} convidado(s)</span>
					</Col>
				</Row>
			</div>
			{/* Tabela de convidados */}
			<div className="form_card">
				<ErrorMessage>{error}</ErrorMessage>
				{loading ? <LoadingSpinner message="A carregar convidados..." /> : (
					<div className="table-responsive">
						<table className="table guest_table">
							<thead>
								<tr>
									<th>Nome</th>
									<th>Contato</th>
									<th>Grupo</th>
									<th className="text-center">Status</th>
									<th className="text-center">Ações</th>
								</tr>
							</thead>
							<tbody>
								{filteredGuests.length > 0 ? filteredGuests.map(guest => (
									<tr key={guest.guest_id}>
										<td>{guest.full_name}</td>
										<td>{guest.contact_info}</td>
										<td>{guest.guest_group}</td>
										<td className="text-center">
											<Dropdown onSelect={(eventKey) => handleStatusChange(guest, eventKey)}>
												<Dropdown.Toggle as={CustomStatusToggle}>
													<RsvpStatusBadge status={guest.rsvp_status} />
												</Dropdown.Toggle>
												<Dropdown.Menu>
													<Dropdown.Item eventKey="confirmed">Confirmado</Dropdown.Item>
													<Dropdown.Item eventKey="declined">Recusado</Dropdown.Item>
													<Dropdown.Item eventKey="pending">Pendente</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
										</td>
										<td className="text-center">
											<button className="button_action" onClick={() => handleOpenModal(guest)} title="Editar"><i className="bi bi-pencil-square"></i></button>
											<button className="button_action text-danger" onClick={() => handleDelete(guest.guest_id)} title="Excluir"><i className="bi bi-trash3-fill"></i></button>
										</td>
									</tr>
								)) : (
									<tr>
										<td colSpan="5" className="text-center p-4">Nenhum convidado encontrado com os filtros selecionados.</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
			{/* Modal de Adicionar/Editar Convidado */}
			<Modal show={isModalOpen} onHide={handleCloseModal} centered>
				<Modal.Header closeButton><Modal.Title>{isEditMode ? 'Editar Convidado' : 'Adicionar Novo Convidado'}</Modal.Title></Modal.Header>
				<Modal.Body>
					<ErrorMessage>{error}</ErrorMessage>
					<Form onSubmit={handleFormSubmit}>
						<Form.Group className="mb-3">
							<Form.Label className="form_label">Nome Completo</Form.Label>
							<Form.Control type="text" name="full_name" value={formData.full_name || ''} onChange={handleFormChange} required />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label className="form_label">Email ou Telefone</Form.Label>
							<Form.Control type="text" name="contact_info" value={formData.contact_info || ''} onChange={handleFormChange} />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label className="form_label">Grupo</Form.Label>
							<Form.Select name="guest_group" value={formData.guest_group || ''} onChange={handleFormChange}>
								<option>Amigos da Noiva</option>
								<option>Amigos do Noivo</option>
								<option>Família da Noiva</option>
								<option>Família do Noivo</option>
								<option>Outro</option>
							</Form.Select>
						</Form.Group>
						<div className="text-end mt-4">
							<Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancelar</Button>
							<Button type="submit" className="button_primary">{isEditMode ? 'Salvar' : 'Adicionar'}</Button>
						</div>
					</Form>
				</Modal.Body>
			</Modal>
		</div>
	);
}
