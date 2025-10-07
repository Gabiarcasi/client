/**
 * Página: AcceptInvitationPage
 *
 * @description Este componente React é uma página dedicada ao processamento
 * e aceitação de convites para participar do planejamento de um casamento
 * como membro da equipe. Ele lê um token de convite da URL, envia-o para
 * o backend para validação e exibe uma mensagem de sucesso ou erro ao usuário.
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

// Importa os serviços e utilitários da sua aplicação
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useWedding } from '../contexts/WeddingContext';

/**
 * @returns {JSX.Element} A página de aceitação de convite.
 */
export default function AcceptInvitationPage() {
    // Hook para acessar os parâmetros de busca da URL.
    const [searchParams] = useSearchParams();
    // Hook para navegação programática.
    const navigate = useNavigate();
    // Hook para acessar as funções de contexto do casamento.
    const { refreshWeddings, selectWeddingById } = useWedding();

    // Estado local para gerenciar a UI
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const [acceptedWeddingId, setAcceptedWeddingId] = useState(null);

    /**
     * Efeito para processar o convite quando o componente é montado.
     *
     * @description Ele extrai o token da URL e faz uma requisição POST
     * para a API para aceitar o convite.
     */
    useEffect(() => {
        const token = searchParams.get('token');

        // Se nenhum token for encontrado, define o estado de erro.
        if (!token) {
            setStatus('error');
            setMessage('Nenhum token de convite encontrado. O link pode estar quebrado.');
            return;
        }

        // Função assíncrona para chamar a API.
        const acceptInvitation = async () => {
            try {
                // Envia o token para o endpoint de aceitação de convite.
                const response = await api.post('/team/accept-invitation', { token });
                
                // Em caso de sucesso
                setStatus('success');
                setMessage(response.data.message);
                setAcceptedWeddingId(response.data.weddingId);
                
                // Força a atualização da lista de casamentos do usuário.
                refreshWeddings();
            } catch (err) {
                // Em caso de erro
                setStatus('error');
                setMessage(err.response?.data?.error || 'Não foi possível aceitar o convite.');
            }
        };

        acceptInvitation();
    }, [searchParams, refreshWeddings]);

    /**
     * Manipulador para o botão "Ir para o Planeamento".
     *
     * @description Seleciona o casamento recém-aceito no contexto e navega
     * para o painel principal.
     */
    const handleGoToWedding = () => {
        if (acceptedWeddingId) {
            selectWeddingById(acceptedWeddingId);
            navigate('/dashboard');
        }
    };

    /**
     * Função auxiliar para renderizar o conteúdo com base no estado.
     *
     * @returns {JSX.Element} O conteúdo a ser exibido (spinner, mensagem de sucesso ou erro).
     */
    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <LoadingSpinner message="A processar o seu convite..." />;
            case 'success':
                return (
                    <>
                        <h1 className="title_h1">Convite Aceite!</h1>
                        <p className="subtitle_main mb-4">{message}</p>
                        <button className="button_primary" onClick={handleGoToWedding}>
                            Ir para o Planeamento
                        </button>
                    </>
                );
            case 'error':
                return (
                    <>
                        <h1 className="title_h1">Oops! Algo correu mal.</h1>
                        <ErrorMessage>{message}</ErrorMessage>
                        <Link to="/select-wedding" className="button_primary mt-3">
                            Voltar para os Meus Casamentos
                        </Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="card_base text-center" style={{ maxWidth: '550px' }}>
            {renderContent()}
        </div>
    );
}