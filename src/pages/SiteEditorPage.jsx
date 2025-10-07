/**
 * Página: SiteEditorPage
 *
 * @description Este componente permite que os noivos editem o conteúdo do site público do casamento.
 * Ele busca dados existentes, gerencia o estado do formulário e salva as alterações na API.
 * Também fornece um link direto para o site público.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCoupleNames } from '../utils/formatters'; // Adicione esta linha
import '../css/SiteEditorPage.css';

/**
 * @returns {JSX.Element} A página do editor do site.
 */
export default function SiteEditorPage() {
    // Acessa o contexto do casamento para obter o casamento selecionado e o estado de carregamento
    const { selectedWedding, loading: weddingLoading } = useWedding();
    
    // Estados do componente
    const [ourStory, setOurStory] = useState(''); // Estado para o campo 'Nossa História'
    const [loadingSite, setLoadingSite] = useState(true); // Estado de carregamento para a busca de dados do site
    const [error, setError] = useState(''); // Estado para mensagens de erro
    const [successMessage, setSuccessMessage] = useState(''); // Estado para mensagens de sucesso

    /**
     * Hook useEffect: Busca os detalhes do site do casamento.
     * É ativado sempre que o 'selectedWedding' muda.
     */
    useEffect(() => {
        // Se não houver casamento selecionado, para o carregamento e retorna
        if (!selectedWedding) {
            setLoadingSite(false);
            return;
        }

        const fetchSiteDetails = async () => {
            try {
                setLoadingSite(true);
                setError('');
                // Faz uma chamada GET para a API para obter os dados do site
                const siteRes = await api.get(`/weddings/${selectedWedding.wedding_id}/site`);
                // Define o estado com a história retornada, ou uma string vazia se não houver
                setOurStory(siteRes.data.our_story || '');
            } catch (error) {
                console.error("Erro ao buscar detalhes do site:", error);
                setError("Não foi possível carregar os dados do editor.");
            } finally {
                setLoadingSite(false);
            }
        };

        fetchSiteDetails();
    }, [selectedWedding]);

    /**
     * Lida com a submissão do formulário.
     * Envia as alterações para a API.
     *
     * @param {Event} e - O evento de submissão do formulário.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        try {
            // Faz uma chamada PUT para a API para atualizar a história
            await api.put(`/weddings/${selectedWedding.wedding_id}/site`, { our_story: ourStory });
            setSuccessMessage('Site atualizado com sucesso!');
            // Faz a mensagem de sucesso desaparecer após 4 segundos
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setError('Falha ao salvar. Tente novamente.');
        }
    };

    // Renderização condicional: se o contexto ainda está carregando os casamentos
    if (weddingLoading) return <LoadingSpinner message="Carregando dados do casamento..." />;

    // Renderização condicional: se nenhum casamento foi selecionado
    if (!selectedWedding) {
        return (
            <div className="container mt-4">
                <h1>Editor do Site</h1>
                <p>Por favor, selecione um casamento para editar o site.</p>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <h1 className="page_title">Editor do Site dos Noivos</h1>
			{/* A linha abaixo foi alterada para usar a função de formatação */}
            <p className="page_subtitle">
                Personalize as informações para o site de <strong>{formatCoupleNames(selectedWedding.bride_name, selectedWedding.groom_name)}</strong>.
            </p>
            <ErrorMessage>{error}</ErrorMessage>

            <div className="row">
                {/* Coluna Principal do Editor */}
                <div className="col-lg-8">
                    <div className="form_card">
                        <h2 className="form_card_title">Conteúdo do Site</h2>
                        {loadingSite ? <LoadingSpinner /> : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3">
                                    <label className="form_label" htmlFor="ourStory">Nossa História</label>
                                    <textarea
                                        id="ourStory"
                                        className="form-control form_input editor_textarea"
                                        value={ourStory}
                                        onChange={(e) => setOurStory(e.target.value)}
                                        placeholder="Conte aos seus convidados um pouco sobre a jornada de vocês..."
                                        rows="10"
                                    />
                                </div>
                                
                                <button type="submit" className="button_primary">Salvar Alterações</button>
                                {successMessage && <div className="success_message mt-3">{successMessage}</div>}
                            </form>
                        )}
                    </div>
                </div>

                {/* Coluna Lateral de Informações */}
                <div className="col-lg-4">
                    <div className="link_card">
                        <h2 className="form_card_title">Link Público</h2>
                        <div className="public_link_container">
                            <p>Este é o endereço que você pode compartilhar com seus convidados:</p>
                            <Link to={`/site/${selectedWedding.website_slug}`} target="_blank" rel="noopener noreferrer">
                                {window.location.origin}/site/{selectedWedding.website_slug} <i className="bi bi-box-arrow-up-right ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}