/**
 * Página: RequestPasswordResetPage
 *
 * @description Este componente React é a primeira etapa do fluxo de recuperação de senha.
 * Ele solicita ao utilizador que insira o seu endereço de e-mail para que um
 * código de recuperação seja enviado, permitindo que ele redefina sua senha.
 */

// Importa os hooks e componentes necessários
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

/**
 * @returns {JSX.Element} A página de solicitação de recuperação de senha.
 */
export default function RequestPasswordResetPage() {
    // Estados para gerir o e-mail, mensagens de feedback e estado de carregamento
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Hook para navegação programática
    const navigate = useNavigate();

    /**
     * Função assíncrona para lidar com a submissão do formulário.
     * Envia o e-mail para a API para iniciar o processo de redefinição de senha.
     *
     * @param {Event} e - O evento de submissão do formulário.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Faz a chamada à API para solicitar a redefinição de senha
            await api.post('/auth/request-password-reset', { email });
            // Navega para a próxima etapa (ResetPasswordPage), passando o e-mail no estado
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            // Exibe uma mensagem de erro em caso de falha
            setError(err.response?.data?.error || 'Ocorreu um erro. Tente novamente mais tarde.');
        } finally {
            // Desativa o estado de carregamento, independentemente do resultado
            setIsLoading(false);
        }
    };

    return (
        <div className="card_base text-center" style={{ maxWidth: '450px' }}>
            <h1 className="title_h1">Recuperar Senha</h1>
            <p className="subtitle_main mb-4">
                Insira o seu e-mail para receber um código de recuperação.
            </p>

            <form onSubmit={handleSubmit} className="text-start">
                {/* Campo de E-mail */}
                <div className="mb-3">
                    <label htmlFor="emailInput" className="form_label">E-mail</label>
                    <input
                        type="email"
                        className="form-control form_input"
                        id="emailInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading} // Desativa o campo enquanto a requisição está em andamento
                    />
                </div>

                {/* Mensagem de Erro */}
                <ErrorMessage>{error}</ErrorMessage>

                {/* Botão de Submissão */}
                <button type="submit" className="button_primary w-100 mt-3" disabled={isLoading}>
                    {isLoading ? 'A enviar...' : 'Enviar Código'}
                </button>
            </form>
            
            {/* Link para voltar à página de login */}
            <p className="mt-4">
                Lembrou-se da senha? <Link to="/login">Voltar ao Login</Link>
            </p>
        </div>
    );
}