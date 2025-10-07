/**
 * Página: WeddingSelectionPage
 *
 * @description Este componente é a primeira página que o utilizador vê após o login ou verificação
 * de e-mail. Ele exibe uma lista de todos os casamentos aos quais o utilizador tem acesso,
 * permitindo que ele selecione um para gerenciar. Também fornece a opção de criar um novo casamento.
 */

// Importa os hooks e componentes necessários
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWedding } from '../contexts/WeddingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCoupleNames } from '../utils/formatters';
import '../css/WeddingSelectionPage.css';

/**
 * @returns {JSX.Element} A página de seleção de casamento.
 */
export default function WeddingSelectionPage() {
    // Acessa o contexto do casamento para obter a lista de casamentos e as funções de seleção
    const navigate = useNavigate();
    const { weddings, selectWeddingById, loading, error } = useWedding();

    /**
     * Lida com a seleção de um casamento.
     * Chama a função do contexto para definir o casamento selecionado e navega para o painel.
     *
     * @param {string} weddingId - O ID do casamento selecionado.
     */
    const handleSelectWedding = (weddingId) => {
        selectWeddingById(weddingId);
        navigate('/dashboard');
    };

    // Renderização condicional para o estado de carregamento
    if (loading) {
        return <LoadingSpinner message="Buscando seus casamentos..." />;
    }

    // Renderização da interface principal
    return (
        <div className="container py-5">
            <div className="list_container">
                <div className="list_header">
                    <div>
                        <h1 className="page_title">Meus Casamentos</h1>
                        <p className="page_subtitle">Selecione um casamento para gerenciar.</p>
                    </div>
                    {/* Botão para criar um novo casamento, usando o componente Link do React Router */}
                    <Link to="/create-wedding" className="add_new_button">
                        <i className="bi bi-plus-lg"></i>
                        Novo Casamento
                    </Link>
                </div>
                
                {/* Exibe mensagens de erro, se houver */}
                <ErrorMessage>{error}</ErrorMessage>

                <div className="list_card">
                    {weddings.length > 0 ? (
                        // Mapeia a lista de casamentos e renderiza um item para cada um
                        weddings.map((wedding) => (
                            <div 
                                key={wedding.wedding_id} 
                                className="wedding_list_item" 
                                onClick={() => handleSelectWedding(wedding.wedding_id)}
                            >
                                <div className="item_details">
                                    {/* Usa a função auxiliar para formatar os nomes dos noivos */}
                                    <h3>{formatCoupleNames(wedding.bride_name, wedding.groom_name)}</h3>
                                    <p>
                                        {/* Formata a data do casamento ou exibe uma mensagem padrão */}
                                        {wedding.wedding_date 
                                            ? new Date(wedding.wedding_date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : 'Data a definir'}
                                    </p>
                                </div>
                                <div className="item_action">
                                    <span>Gerenciar <i className="bi bi-arrow-right-short"></i></span>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Mensagem exibida se não houver casamentos na lista
                        <div className="p-4 text-center">
                            <p>Nenhum casamento encontrado. Que tal criar o seu primeiro?</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}