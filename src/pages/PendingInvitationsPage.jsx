/**
 * Página: PendingInvitationsPage
 *
 * @description Esta página é exibida ao usuário após o login, caso ele
 * tenha convites de equipe pendentes. Ela permite visualizar e aceitar
 * os convites para participar do planejamento de casamentos.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import { useWedding } from '../contexts/WeddingContext';
// Importando o CSS da página de seleção para reaproveitar os estilos.
import '../css/WeddingSelectionPage.css';
// NOVO: Importando a função para formatar os nomes do casal.
import { formatCoupleNames } from '../utils/formatters';

export default function PendingInvitationsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshWeddings } = useWedding(); // Para atualizar a lista de casamentos após aceitar

    const [invitations, setInvitations] = useState([]);
    const [error, setError] = useState('');
    const [accepted, setAccepted] = useState([]); // Guarda os tokens dos convites aceitos

    useEffect(() => {
        // Pega os convites passados pela página de login
        if (location.state?.invitations) {
            setInvitations(location.state.invitations);
        } else {
            // Se não houver convites, redireciona para a seleção de casamento
            navigate('/select-wedding');
        }
    }, [location, navigate]);

    const handleAccept = async (token) => {
        try {
            await api.post('/team/accept-invitation', { token });
            // Marca o convite como aceito para desabilitar o botão
            setAccepted([...accepted, token]);
            // Força a atualização da lista de casamentos no contexto global
            refreshWeddings();
        } catch (err) {
            setError(err.response?.data?.error || 'Não foi possível aceitar o convite.');
        }
    };

    const handleContinue = () => {
        navigate('/select-wedding');
    };

    return (
        <div className="container py-5">
            <div className="list_container" style={{ maxWidth: '800px' }}>
                <div className="list_header">
                    <div>
                        <h1 className="page_title">Convites Pendentes</h1>
                        <p className="page_subtitle">
                            Você foi convidado(a) para participar do planejamento dos seguintes casamentos.
                        </p>
                    </div>
                </div>

                <ErrorMessage>{error}</ErrorMessage>

                <div className="list_card">
                    {invitations.length > 0 ? (
                        invitations.map(inv => (
                            <div key={inv.invitation_id} className="wedding_list_item">
                                <div className="item_details">
                                    {/* ALTERADO: Título agora usa a função de formatação de nomes */}
                                    <h3>{formatCoupleNames(inv.bride_name, inv.groom_name)}</h3>
                                    <p>Sua relação: <strong>{inv.relationship}</strong> | Permissão: {inv.permission_level === 'edit' ? 'Edição' : 'Visualização'}</p>
                                </div>
                                <div className="item_action">
                                    <button
                                        // ALTERADO: Estilo do botão agora é "button_secondary"
                                        className="button_secondary"
                                        style={{width: 'auto', marginTop: '0', fontSize: '0.9rem', padding: '10px 25px'}}
                                        onClick={() => handleAccept(inv.invitation_token)}
                                        disabled={accepted.includes(inv.invitation_token)}
                                    >
                                        {/* ALTERADO: Texto do botão simplificado */}
                                        {accepted.includes(inv.invitation_token) ? 'Aceito!' : 'Aceitar'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="p-4 text-center">
                            <p>Todos os convites foram respondidos.</p>
                        </div>
                    )}
                </div>
                
                <div className="text-center mt-4">
                    <button className="button_primary" style={{width: 'auto'}} onClick={handleContinue}>
                        Continuar para Meus Casamentos
                    </button>
                </div>
            </div>
        </div>
    );
}