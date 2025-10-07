/**
 * Componente: BudgetModal
 *
 * @description Este componente React representa um modal para adicionar ou
 * editar um item do orçamento de casamento. Ele é um formulário que coleta
 * informações como categoria, status de decisão, descrição e valores financeiros.
 * O componente utiliza React-Bootstrap para a estrutura e estado local
 * para gerenciar os dados do formulário.
 */

// Importa os módulos necessários do React e bibliotecas de UI
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import ErrorMessage from './ErrorMessage';

/**
 * @param {object} props - As propriedades do componente.
 * @param {boolean} props.show - Controla a visibilidade do modal.
 * @param {function} props.onHide - Função para fechar o modal.
 * @param {function} props.onSave - Função para salvar os dados do formulário.
 * @param {string} props.weddingId - O ID do casamento ao qual o item pertence.
 * @param {object} [props.initialData={}] - Dados iniciais para o formulário, usados no modo de edição.
 */
export default function BudgetModal({ show, onHide, onSave, weddingId, initialData = {} }) {
	// Estado local para armazenar os dados do formulário.
	const [formData, setFormData] = useState({});
	// Estado local para gerenciar mensagens de erro.
	const [error, setError] = useState('');

	/**
	 * Efeito para inicializar o formulário quando o modal é exibido ou
	 * quando os dados iniciais mudam.
	 */
	useEffect(() => {
		if (show) {
			const data = initialData || {};
			setFormData({
				category: 'Outro',
				final_value: 0,
				paid_value: 0,
				decision_status: 'Analisando',
				...data,
			});
			setError('');
		}
	}, [show, initialData]);

	/**
	 * Manipulador de eventos para atualizar o estado do formulário
	 * à medida que o usuário digita nos campos.
	 */
	const handleFormChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	/**
	 * Manipulador de eventos para o envio do formulário.
	 *
	 * @param {object} e - O objeto do evento.
	 */
	const handleFormSubmit = async (e) => {
		e.preventDefault();
		try {
			// Chama a função onSave passada como prop.
			await onSave(formData, weddingId);
			// Fecha o modal após o salvamento bem-sucedido.
			onHide();
		} catch (err) {
			// Captura e exibe mensagens de erro.
			setError(err.response?.data?.error || 'Ocorreu um erro ao salvar o item.');
		}
	};

	// Verifica se o formulário está no modo de edição (se há um item_id).
	const isEditMode = !!formData.item_id;

	return (
		// Componente Modal do React-Bootstrap.
		<Modal show={show} onHide={onHide} centered size="lg">
			<Form onSubmit={handleFormSubmit}>
				{/* Cabeçalho do Modal */}
				<Modal.Header closeButton>
					<Modal.Title>{isEditMode ? 'Editar Item do Orçamento' : 'Adicionar Novo Item'}</Modal.Title>
				</Modal.Header>

				{/* Corpo do Modal (o formulário) */}
				<Modal.Body>
					{/* Exibe a mensagem de erro, se houver. */}
					<ErrorMessage>{error}</ErrorMessage>
					
					<Row>
						<Col md={7}>
							<Form.Group className="mb-3">
								<Form.Label className="form_label">Categoria</Form.Label>
								{/* Campo de seleção para a categoria */}
								<Form.Select name="category" value={formData.category || ''} onChange={handleFormChange} required className="form_input">
									{/* Opções de categoria */}
									<option value="Espaço">Espaço / Local</option>
									<option value="Buffet">Buffet / Catering</option>
									<option value="Decoração">Decoração / Flores</option>
									<option value="Fotografia">Fotografia</option>
									<option value="Vídeo">Vídeo / Filmagem</option>
									<option value="Música">Música / DJ / Banda</option>
									<option value="Trajes">Trajes (Noiva e Noivo)</option>
									<option value="Beleza">Beleza (Cabelo e Maquilhagem)</option>
									<option value="Convites">Convites e Papelaria</option>
									<option value="Bolo">Bolo e Doces</option>
									<option value="Lembrancinhas">Lembrancinhas</option>
									<option value="Transporte">Transporte</option>
									<option value="Cerimonialista">Cerimonialista / Assessoria</option>
									<option value="Lua de Mel">Lua de Mel</option>
									<option value="Outro">Outro</option>
								</Form.Select>
							</Form.Group>
						</Col>
						<Col md={5}>
							<Form.Group className="mb-3">
								<Form.Label className="form_label">Status da Decisão</Form.Label>
								{/* Campo de seleção para o status da decisão */}
								<Form.Select name="decision_status" value={formData.decision_status || ''} onChange={handleFormChange} required className="form_input">
									<option value="Analisando">Analisando</option>
									<option value="Contratado">Contratado</option>
									<option value="Recusado">Recusado</option>
								</Form.Select>
							</Form.Group>
						</Col>
					</Row>
					<Form.Group className="mb-3">
						<Form.Label className="form_label">Descrição</Form.Label>
						{/* Campo de texto para a descrição do item */}
						<Form.Control as="textarea" rows={2} name="description" value={formData.description || ''} onChange={handleFormChange} placeholder="Ex: Proposta 1 do fotógrafo" />
					</Form.Group>
					
					<hr className="my-3"/>
					
					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label className="form_label">Valor Final (R$)</Form.Label>
								{/* Campo numérico para o valor final */}
								<Form.Control type="number" step="0.01" name="final_value" value={formData.final_value || ''} onChange={handleFormChange} required />
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label className="form_label">Valor Já Pago (R$)</Form.Label>
								{/* Campo numérico para o valor já pago */}
								<Form.Control type="number" step="0.01" name="paid_value" value={formData.paid_value || ''} onChange={handleFormChange} />
							</Form.Group>
						</Col>
					</Row>
				</Modal.Body>
				
				{/* Rodapé do Modal com botões de ação */}
				<Modal.Footer>
					<Button variant="secondary" className="button_secondary" onClick={onHide}>Cancelar</Button>
					<Button type="submit" className="button_primary">{isEditMode ? 'Salvar Alterações' : 'Adicionar Item'}</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
}