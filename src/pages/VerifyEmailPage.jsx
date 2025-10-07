/**
 * Página: VerifyEmailPage
 *
 * @description Este componente gerencia o processo de verificação de e-mail do utilizador.
 * Ele lida com a entrada do código de verificação, envia-o para a API para validação
 * e, em caso de sucesso, autentica o utilizador e o redireciona para a próxima etapa.
 */

// Importa os hooks e componentes necessários do React e React Router
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

/**
 * @returns {JSX.Element} A página de verificação de e-mail.
 */
export default function VerifyEmailPage() {
    // Estados do componente
    const [code, setCode] = useState(''); // Estado para o código de verificação
    const [error, setError] = useState(''); // Estado para mensagens de erro
    const [isLoading, setIsLoading] = useState(false); // Estado para o feedback de carregamento
    
    // Hooks do React Router
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extrai o e-mail do estado da navegação, passado pela página de registo
    const email = location.state?.email;

    // Redireciona o utilizador se ele tentar aceder à página diretamente
    if (!email) {
        navigate('/register');
        return null; // Retorna null para não renderizar nada
    }

    /**
     * Lida com a submissão do formulário de verificação.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Faz a chamada POST para a API de verificação de e-mail
            const response = await api.post('/auth/verify-email', { email, code });
            
            // Se a verificação for bem-sucedida, salva o token de acesso
            localStorage.setItem('authToken', response.data.accessToken);
            
            // --- ALTERAÇÃO AQUI ---
            // Verifica se a resposta contém convites pendentes
            if (response.data.pendingInvitations && response.data.pendingInvitations.length > 0) {
                // Se houver, navega para a página de convites, passando os dados
                navigate('/pending-invitations', { state: { invitations: response.data.pendingInvitations } });
            } else {
                // Se não, segue o fluxo normal
                navigate('/select-wedding');
            }
        } catch (err) {
            // Exibe a mensagem de erro da API ou uma genérica
            setError(err.response?.data?.error || 'Ocorreu um erro ao verificar o código.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="card_base text-center" style={{ maxWidth: '480px' }}>
            <h1 className="title_h1">Verifique o seu E-mail</h1>
            <p className="subtitle_main mb-4">
                Enviámos um código de 6 dígitos para <strong>{email}</strong>. Por favor, insira-o abaixo.
            </p>

            <form onSubmit={handleSubmit} className="text-start">
                <div className="mb-3">
                    <label htmlFor="codeInput" className="form_label">Código de Verificação</label>
                    <input
                        type="text"
                        className="form-control form_input"
                        id="codeInput"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        disabled={isLoading}
                        maxLength="6"
                    />
                </div>

                <ErrorMessage>{error}</ErrorMessage>

                <button type="submit" className="button_primary w-100 mt-3" disabled={isLoading}>
                    {isLoading ? 'A verificar...' : 'Verificar e Entrar'}
                </button>
            </form>
            
            <p className="mt-4">
                Não recebeu o código? <Link to="/register">Tente registar-se novamente</Link>.
            </p>
        </div>
    );
}