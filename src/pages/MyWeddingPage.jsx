/**
 * Página: MyWeddingPage
 *
 * @description Este componente React é responsável por permitir que o usuário visualize e edite os detalhes do casamento
 * que foi selecionado. Ele utiliza o `WeddingContext` para obter os dados do casamento atual e gerencia o estado do
 * formulário, a interação com a API e o feedback visual ao usuário.
 */

// Importa hooks e componentes
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCoupleNames } from '../utils/formatters'; // Adicione esta linha
import '../css/MyWeddingPage.css';

/**
 * @returns {JSX.Element} A página de edição de casamento.
 */
export default function MyWeddingPage() {
    // Acessa o contexto do casamento para obter os dados e funções
    const { selectedWedding, loading, refreshWeddings } = useWedding();
    
    // Estados para gerenciar os dados do formulário e feedback
    const [formData, setFormData] = useState({
        groom_name: '', bride_name: '', wedding_date: '', website_slug: '',
        wedding_style: '', estimated_guests: '', estimated_budget: '',
    });

    // Estado separado para o campo de paleta de cores (string)
    const [colorPaletteString, setColorPaletteString] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Hook useEffect: Popula o formulário quando um casamento é selecionado.
     * Esta função é executada sempre que `selectedWedding` muda.
     */
    useEffect(() => {
        if (selectedWedding) {
            // Função auxiliar para formatar a data para o input datetime-local
            const formatDateTimeLocal = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                // Previne erros de datas inválidas
                if (isNaN(date.getTime())) return '';
                // Ajusta o fuso horário para garantir que o input exiba a data correta localmente
                const offset = date.getTimezoneOffset();
                const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                return adjustedDate.toISOString().slice(0, 16);
            };

            // Preenche o estado do formulário com os dados do casamento selecionado
            setFormData({
                groom_name: selectedWedding.groom_name || '',
                bride_name: selectedWedding.bride_name || '',
                wedding_date: formatDateTimeLocal(selectedWedding.wedding_date),
                website_slug: selectedWedding.website_slug || '',
                wedding_style: selectedWedding.wedding_style || '',
                estimated_guests: selectedWedding.estimated_guests || '',
                estimated_budget: selectedWedding.estimated_budget || '',
                ceremony_location: selectedWedding.ceremony_location || '',
                ceremony_location_maps: selectedWedding.ceremony_location_maps || '',
                isReceptionSeparate: !!selectedWedding.reception_location,
                reception_location: selectedWedding.reception_location || '',
                reception_location_maps: selectedWedding.reception_location_maps || '',
                has_civil_ceremony: selectedWedding.has_civil_ceremony || false,
                civil_ceremony_date: formatDateTimeLocal(selectedWedding.civil_ceremony_date),
                civil_ceremony_location: selectedWedding.civil_ceremony_location || '',
            });

            // Popula o estado da string de cores
            setColorPaletteString((selectedWedding.color_palette || []).join(', '));
        }
    }, [selectedWedding]);

    /**
     * Lida com a mudança nos campos do formulário.
     * Atualiza o estado `formData` com o novo valor do campo.
     */
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    /**
     * Lida com a submissão do formulário.
     * Envia os dados atualizados para a API.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        if (!selectedWedding) {
            setError("Nenhum casamento selecionado para atualizar.");
            setIsLoading(false);
            return;
        }

        // Converte a string de cores num array antes de enviar
        const colorsArray = colorPaletteString.split(',').map(color => color.trim()).filter(Boolean);

        const dataToSend = {
            ...formData,
            color_palette: colorsArray // Adiciona o array ao objeto
        };

        try {
            await api.put(`/weddings/${selectedWedding.wedding_id}`, dataToSend);
            setSuccess('Casamento atualizado com sucesso!');
            refreshWeddings(); // Atualiza os dados no contexto após o sucesso
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Falha ao Salvar. Verifique os dados e tente novamente.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Renderização condicional para exibir o estado de carregamento
    if (loading) return <LoadingSpinner />;
    if (!selectedWedding) {
        return <p>Por favor, selecione um casamento para editar as suas informações.</p>;
    }

    return (
        <div className="container-fluid">
            <h1 className="title_h1">Editar Casamento</h1>
			{/* A linha abaixo foi alterada para usar a função de formatação */}
            <p className="subtitle_main mb-4">
                Altere as informações do casamento de <strong>{formatCoupleNames(selectedWedding.bride_name, selectedWedding.groom_name)}</strong>.
            </p>
            
            <form className="dashboard_widget_card" onSubmit={handleSubmit} style={{ maxWidth: '900px' }}>
                <ErrorMessage>{error}</ErrorMessage>
                {success && <div className="alert_message alert_success">{success}</div>}

                {/* Seção: Informações Gerais */}
                <h2 className="title_h2">Informações Gerais</h2>
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
                         <input
                             type="text"
                             className="form-control form_input"
                             id="color_palette"
                             name="color_palette"
                             value={colorPaletteString}
                             onChange={(e) => setColorPaletteString(e.target.value)}
                             placeholder="Ex: #FFFFFF, #C9A96A, #555555"
                         />
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

                <div className="col-12 text-end mt-4">
                    <button type="submit" className="button_primary" disabled={isLoading}>
                        {isLoading ? 'A Salvar...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
}