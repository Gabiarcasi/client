/**
 * Página: CreateWeddingPage
 *
 * @description Este componente React é uma página de formulário
 * que permite aos utilizadores criar um novo casamento na aplicação.
 * Ele gerencia o estado do formulário, lida com a submissão dos
 * dados para a API e navega o utilizador para o painel principal
 * após a criação bem-sucedida.
 */

// Importa os hooks e componentes necessários
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useWedding } from '../contexts/WeddingContext';
import ErrorMessage from '../components/ErrorMessage';

/**
 * @returns {JSX.Element} A página de criação de casamento.
 */
export default function CreateWeddingPage() {
	// Hook para navegação programática.
	const navigate = useNavigate();
	// Obtém as funções do contexto do casamento.
	const { refreshWeddings, selectWeddingById } = useWedding();
	
	// Estado para os dados do formulário com valores iniciais.
	const [formData, setFormData] = useState({
		groom_name: '',
		bride_name: '',
		wedding_date: '',
		wedding_style: '',
		estimated_guests: '',
		estimated_budget: '',
		color_palette: [],
		ceremony_location: '',
		ceremony_location_maps: '',
		isReceptionSeparate: false,
		reception_location: '',
		reception_location_maps: '',
		has_civil_ceremony: false,
		civil_ceremony_date: '',
		civil_ceremony_location: '',
	});
	
	// Estados para gerenciar erros e o estado de carregamento.
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	/**
	 * Manipula as mudanças em campos de texto e checkbox do formulário.
	 */
	const handleFormChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prevState => ({
			...prevState,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	/**
	 * Manipula as mudanças no campo de paleta de cores.
	 * Converte a string de cores separada por vírgula em um array.
	 */
	const handleColorChange = (e) => {
		const colors = e.target.value.split(',').map(color => color.trim()).filter(Boolean);
		setFormData(prevState => ({ ...prevState, color_palette: colors }));
	};

	/**
	 * Manipula a submissão do formulário.
	 *
	 * @description Faz uma requisição POST para a API para criar um novo
	 * casamento. Em caso de sucesso, atualiza o contexto e navega o
	 * utilizador para o painel principal.
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');
		try {
			const response = await api.post('/weddings', formData);
			const newWedding = response.data;
			
			// Atualiza a lista de casamentos do usuário e seleciona o recém-criado.
			await refreshWeddings();
			selectWeddingById(newWedding.wedding_id);
			navigate('/dashboard');

		} catch (err) {
			const errorMessage = err.response?.data?.error || 'Falha ao criar o casamento. Verifique os dados e tente novamente.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="card_base" style={{ maxWidth: '900px' }}>
			{/* Botão para voltar */}
			<Link to="/select-wedding" className="link_icon">
				<i className="bi bi-arrow-left"></i>
				Voltar para a seleção
			</Link>

			{/* Títulos e subtítulos da página */}
			<h1 className="title_h2">Criar Novo Casamento</h1>
			<p className="subtitle_main mb-4">
				Preencha os detalhes abaixo para iniciar o planeamento do seu grande dia.
			</p>
			
			{/* Formulário principal */}
			<form onSubmit={handleSubmit}>
				<ErrorMessage>{error}</ErrorMessage>

				{/* Seção: Informações Gerais */}
				<h2 className="title_h2 border-top pt-3 mt-4">Informações Gerais</h2>
				<div className="row">
					<div className="col-md-6 mb-3">
						<label className="form_label" htmlFor="groomName">Nome do Noivo</label>
						<input type="text" className="form-control form_input" id="groomName" name="groom_name" value={formData.groom_name} onChange={handleFormChange} required />
					</div>
					<div className="col-md-6 mb-3">
						<label className="form_label" htmlFor="brideName">Nome da Noiva</label>
						<input type="text" className="form-control form_input" id="brideName" name="bride_name" value={formData.bride_name} onChange={handleFormChange} required />
					</div>
					<div className="col-md-6 mb-3">
						<label className="form_label" htmlFor="weddingDate">Data e Hora (Principal)</label>
						<input type="datetime-local" className="form-control form_input" id="weddingDate" name="wedding_date" value={formData.wedding_date} onChange={handleFormChange} />
					</div>
					<div className="col-md-6 mb-3">
						<label className="form_label" htmlFor="weddingStyle">Estilo do Casamento</label>
						<input type="text" className="form-control form_input" id="weddingStyle" name="wedding_style" value={formData.wedding_style} onChange={handleFormChange} placeholder="Ex: Clássico, Rústico, Moderno" />
					</div>
					<div className="col-md-6 mb-3">
						<label className="form_label" htmlFor="estimated_guests">Nº Estimado de Convidados</label>
						<input type="number" className="form-control form_input" id="estimated_guests" name="estimated_guests" value={formData.estimated_guests} onChange={handleFormChange} />
					</div>
					<div className="col-md-6 mb-3">
						<label className="form_label" htmlFor="estimated_budget">Orçamento Estimado (R$)</label>
						<input type="number" step="0.01" className="form-control form_input" id="estimated_budget" name="estimated_budget" value={formData.estimated_budget} onChange={handleFormChange} />
					</div>
					<div className="col-12 mb-3">
						<label className="form_label" htmlFor="color_palette">Paleta de Cores</label>
						<input type="text" className="form-control form_input" id="color_palette" name="color_palette" value={formData.color_palette.join(', ')} onChange={handleColorChange} placeholder="Ex: #FFFFFF, #C9A96A, #555555" />
						<small className="form-text text-muted">Insira os códigos hexadecimais das cores, separados por vírgula.</small>
					</div>
				</div>

				{/* Seção: Cerimónia */}
				<h2 className="title_h2 border-top pt-3 mt-4">Local da Cerimónia</h2>
				<div className="row">
					<div className="col-12 mb-3">
						<label className="form_label" htmlFor="ceremony_location">Endereço da Cerimónia</label>
						<textarea className="form-control form_input" id="ceremony_location" name="ceremony_location" rows="2" value={formData.ceremony_location} onChange={handleFormChange}></textarea>
					</div>
					<div className="col-12 mb-3">
						<label className="form_label" htmlFor="ceremony_location_maps">Link do Google Maps (Cerimónia)</label>
						<input type="url" className="form-control form_input" id="ceremony_location_maps" name="ceremony_location_maps" value={formData.ceremony_location_maps} onChange={handleFormChange} placeholder="https://maps.app.goo.gl/..." />
					</div>
					<div className="form-check mb-3">
						<input className="form-check-input" type="checkbox" id="isReceptionSeparate" name="isReceptionSeparate" checked={formData.isReceptionSeparate} onChange={handleFormChange} />
						<label className="form-check-label" htmlFor="isReceptionSeparate">
							A receção será num local diferente da cerimónia.
						</label>
					</div>
				</div>

				{/* Seção: Recepção (Condicional) */}
				{formData.isReceptionSeparate && (
					<div id="reception-details">
						<h2 className="title_h2 border-top pt-3 mt-4">Local da Receção</h2>
						<div className="row">
							<div className="col-12 mb-3">
								<label className="form_label" htmlFor="reception_location">Endereço da Receção</label>
								<textarea className="form-control form_input" id="reception_location" name="reception_location" rows="2" value={formData.reception_location} onChange={handleFormChange}></textarea>
							</div>
							<div className="col-12 mb-3">
								<label className="form_label" htmlFor="reception_location_maps">Link do Google Maps (Receção)</label>
								<input type="url" className="form-control form_input" id="reception_location_maps" name="reception_location_maps" value={formData.reception_location_maps} onChange={handleFormChange} placeholder="https://maps.app.goo.gl/..." />
							</div>
						</div>
					</div>
				)}

				{/* Seção: Cerimónia Civil (Condicional) */}
				<div className="border-top pt-3 mt-4">
					<div className="form-check mb-3">
						<input className="form-check-input" type="checkbox" id="has_civil_ceremony" name="has_civil_ceremony" checked={formData.has_civil_ceremony} onChange={handleFormChange} />
						<label className="form-check-label" htmlFor="has_civil_ceremony">
							Teremos uma cerimónia civil em data/local separado.
						</label>
					</div>
				</div>

				{formData.has_civil_ceremony && (
					<div id="civil-ceremony-details">
						<h2 className="title_h2">Detalhes da Cerimónia Civil</h2>
						<div className="row">
							<div className="col-md-6 mb-3">
								<label className="form_label" htmlFor="civil_ceremony_date">Data e Hora do Civil</label>
								<input type="datetime-local" className="form-control form_input" id="civil_ceremony_date" name="civil_ceremony_date" value={formData.civil_ceremony_date} onChange={handleFormChange} />
							</div>
							<div className="col-md-6 mb-3">
								<label className="form_label" htmlFor="civil_ceremony_location">Local do Civil</label>
								<input type="text" className="form-control form_input" id="civil_ceremony_location" name="civil_ceremony_location" value={formData.civil_ceremony_location} onChange={handleFormChange} />
							</div>
						</div>
					</div>
				)}

				{/* Botão de submissão */}
				<div className="col-12 text-end mt-4">
					<button type="submit" className="button_primary" disabled={isLoading}>
						{isLoading ? 'A criar...' : 'Criar e Aceder ao Painel'}
					</button>
				</div>
			</form>
		</div>
	);
}