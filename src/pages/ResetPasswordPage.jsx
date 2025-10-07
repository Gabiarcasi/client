/**
 * Página: ResetPasswordPage
 *
 * @description Este componente React é a segunda e última etapa do fluxo de recuperação de senha.
 * Ele permite que o utilizador insira o código de recuperação recebido por e-mail e uma nova senha
 * para redefinir o acesso à sua conta.
 */

// Importa os hooks e componentes necessários
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

/**
 * @returns {JSX.Element} A página de redefinição de senha.
 */
export default function ResetPasswordPage() {
    // Estados para gerir os dados do formulário e o estado da página
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hooks de navegação e para aceder ao estado da rota
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extrai o e-mail do estado de navegação. É crucial para o fluxo.
    const email = location.state?.email;

    /**
     * Validação inicial: se não houver um e-mail no estado,
     * redireciona o utilizador para o início do fluxo de recuperação de senha.
     * Isso evita que a página seja acessada diretamente, sem contexto.
     */
    if (!email) {
        navigate('/request-password-reset');
        return null;
    }

    /**
     * Função assíncrona para lidar com a submissão do formulário.
     * Envia o código e a nova senha para a API.
     *
     * @param {Event} e - O evento de submissão do formulário.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Envia o e-mail, código e nova senha para o endpoint de redefinição
            await api.post('/auth/reset-password', { email, code, password });
            // Redireciona para o login com uma mensagem de sucesso
            navigate('/login', { state: { message: 'Senha redefinida com sucesso! Pode fazer o login.' } });
        } catch (err) {
            // Exibe a mensagem de erro da API ou uma genérica
            setError(err.response?.data?.error || 'Ocorreu um erro ao redefinir a senha.');
        } finally {
            // Desativa o estado de carregamento, independentemente do resultado
            setIsLoading(false);
        }
    };

    return (
        <div className="card_base text-center" style={{ maxWidth: '480px' }}>
            <h1 className="title_h1">Redefinir Senha</h1>
            <p className="subtitle_main mb-4">
                Enviámos um código para <strong>{email}</strong>. Insira-o abaixo junto com a sua nova senha.
            </p>

            <form onSubmit={handleSubmit} className="text-start">
                {/* Campo para o Código de Recuperação */}
                <div className="mb-3">
                    <label htmlFor="codeInput" className="form_label">Código de Recuperação</label>
                    <input type="text" className="form-control form_input" id="codeInput" value={code} onChange={(e) => setCode(e.target.value)} required disabled={isLoading} maxLength="6" />
                </div>
                {/* Campo para a Nova Senha */}
                <div className="mb-3">
                    <label htmlFor="passwordInput" className="form_label">Nova Senha</label>
                    <input type="password" className="form-control form_input" id="passwordInput" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </div>

                {/* Exibe mensagem de erro */}
                <ErrorMessage>{error}</ErrorMessage>

                {/* Botão de Submissão */}
                <button type="submit" className="button_primary w-100 mt-3" disabled={isLoading}>
                    {isLoading ? 'A redefinir...' : 'Redefinir Senha'}
                </button>
            </form>
        </div>
    );
}