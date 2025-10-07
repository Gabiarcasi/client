/**
 * Página: RsvpPage
 *
 * @description Este componente React é uma página pública (sem necessidade de autenticação)
 * que permite que os convidados respondam a um convite de casamento. A página
 * usa um token único fornecido na URL para identificar o convidado e
 * processa a sua resposta de confirmação de presença (RSVP).
 */

// Importa os hooks e componentes necessários
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import '../css/RsvpPage.css'; 

/**
 * @returns {JSX.Element} A página de confirmação de presença (RSVP).
 */
export default function RsvpPage() {
    // Obtém o token da URL usando o hook useParams
    const { token } = useParams();
    
    // Estados para gerir a interface e os dados
    const [guestName, setGuestName] = useState('');
    const [status, setStatus] = useState(null); // 'confirmed' ou 'declined'
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Hook useEffect: Fetches the guest's name based on the token.
     * Esta função é executada uma única vez, quando o componente é montado.
     */
    useEffect(() => {
        const fetchGuestName = async () => {
            try {
                const response = await api.get(`/public/rsvp/${token}`);
                setGuestName(response.data.full_name);
            } catch (err) {
                // Se o token for inválido, exibe uma mensagem de erro
                setError('Convite inválido ou não encontrado.');
            } finally {
                setLoading(false);
            }
        };
        fetchGuestName();
    }, [token]);

    /**
     * Lida com a submissão do formulário.
     * Envia a resposta do convidado para a API.
     *
     * @param {Event} e - O evento de submissão do formulário.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validação básica: garante que uma opção foi selecionada
        if (!status) {
            setError('Por favor, selecione se irá comparecer.');
            return;
        }
        try {
            // Envia o status e a mensagem para a API
            await api.post(`/public/rsvp/${token}`, { status, message });
            // Se a requisição for bem-sucedida, define o estado para 'enviado'
            setSubmitted(true);
        } catch (err) {
            setError('Ocorreu um erro ao enviar a sua resposta. Tente novamente.');
        }
    };

    // Renderização condicional: Exibe o spinner enquanto os dados são carregados
    if (loading) return <LoadingSpinner />;

    // Renderização condicional: Exibe a mensagem de sucesso após o envio
    if (submitted) {
        return (
            <div className="page_container_centered">
                <div className="card_base text-center" style={{ maxWidth: '500px' }}>
                    <h1 className="title_h2">Obrigado por responder!</h1>
                    <p>A sua resposta foi registada com sucesso.</p>
                </div>
            </div>
        );
    }
    
    // Renderização padrão: Exibe o formulário RSVP
    return (
        <div className="page_container_centered">
            <div className="card_base text-center" style={{ maxWidth: '500px' }}>
                <h1 className="title_h2">Olá, {guestName}!</h1>
                <p className="subtitle_main">Confirma a sua presença no casamento?</p>
                
                <ErrorMessage>{error}</ErrorMessage>

                <form onSubmit={handleSubmit}>
                    <div className="rsvp_button_group">
                        {/* Botões para selecionar o status, com estilo condicional */}
                        <button type="button" onClick={() => setStatus('confirmed')} className="btn btn-lg mx-2" style={{ backgroundColor: status === 'confirmed' ? '#28a745' : '#f0f0f0', color: status === 'confirmed' ? 'white' : 'black' }}>
                            Sim, vou comparecer!
                        </button>
                        <button type="button" onClick={() => setStatus('declined')} className="btn btn-lg mx-2" style={{ backgroundColor: status === 'declined' ? '#dc3545' : '#f0f0f0', color: status === 'declined' ? 'white' : 'black' }}>
                            Não poderei comparecer
                        </button>
                    </div>

                    <textarea
                        className="form-control form_input rsvp_message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Deixe uma mensagem para os noivos (opcional)"
                    />

                    <button type="submit" className="button_primary mt-4">Enviar Resposta</button>
                </form>
            </div>
        </div>
    );
}