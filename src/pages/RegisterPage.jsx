/**
 * Página: RegisterPage
 *
 * @description Este componente React é responsável por gerir a página de registo de novos utilizadores.
 * Ele permite que os noivos criem uma nova conta na plataforma Mariage,
 * validando a força da senha em tempo real, obtendo o consentimento explícito
 * para os termos de serviço (LGPD) e lidando com a comunicação
 * com a API de autenticação.
 */

// Importa os hooks e componentes necessários
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Componente auxiliar para fornecer feedback visual sobre a força da senha.
 *
 * @param {object} props
 * @param {string} props.password - A senha atual digitada pelo usuário.
 * @returns {JSX.Element} Uma lista de verificações de senha.
 */
const PasswordStrengthIndicator = ({ password }) => {
    // Usa useMemo para memoizar a lista de verificações.
    // Isso garante que o array não seja recriado a cada renderização,
    // otimizando a performance, pois as expressões regulares não mudam.
    const checks = useMemo(() => [
        { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
        { regex: /[a-z]/, text: 'Uma letra minúscula' },
        { regex: /[A-Z]/, text: 'Uma letra maiúscula' },
        { regex: /\d/, text: 'Um número' },
        { regex: /[@$!%*?&]/, text: 'Um caractere especial (@$!%*?&)' },
    ], []);

    return (
        <div className="mt-2" style={{ fontSize: '0.85rem' }}>
            {checks.map((check, index) => {
                // Testa cada regex contra a senha atual
                const isValid = check.regex.test(password);
                return (
                    <div key={index} style={{ color: isValid ? 'var(--success-text)' : '#aaa', transition: 'color 0.3s ease' }}>
                        {/* Altera o ícone com base na validade */}
                        <i className={`bi bi-${isValid ? 'check-circle-fill' : 'x-circle'} me-2`}></i>
                        {check.text}
                    </div>
                );
            })}
        </div>
    );
};

/**
 * @returns {JSX.Element} A página de registo da aplicação.
 */
export default function RegisterPage() {
    // Estados para gerir os dados do formulário e o estado da página
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [consent, setConsent] = useState(false); // Estado para o consentimento da LGPD
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Função assíncrona para lidar com a submissão do formulário.
     *
     * @param {Event} e - O evento de submissão do formulário.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validação do consentimento antes de enviar
        if (!consent) {
            setError('Você precisa aceitar os termos de serviço para criar uma conta.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            // Envia os dados do registo para a API, incluindo o consentimento
            const response = await api.post('/auth/register', { name, email, password, consent });
            // Navega para a página de verificação de e-mail, passando o e-mail no estado
            navigate('/verify-email', { state: { email: response.data.email } });
        } catch (err) {
            // Exibe a mensagem de erro da API ou uma genérica
            const errorMessage = err.response?.data?.errors ? err.response.data.errors.map(e => e.msg).join(' ') : err.response?.data?.error;
            setError(errorMessage || 'Ocorreu um erro ao registar. Tente novamente.');
        } finally {
            // Finaliza o estado de carregamento
            setIsLoading(false);
        }
    };

    return (
        <div className="card_base text-center" style={{ maxWidth: '450px' }}>
            <h1 className="title_h1">Crie a Sua Conta</h1>
            <p className="subtitle_main mb-4">Comece a planear o seu dia inesquecível.</p>

            <form onSubmit={handleSubmit} className="text-start">
                {/* Campo de Nome */}
                <div className="mb-3">
                    <label htmlFor="nameInput" className="form_label">Nome Completo</label>
                    <input
                        type="text"
                        className="form-control form_input"
                        id="nameInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

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
                        disabled={isLoading}
                    />
                </div>

                {/* Campo de Senha */}
                <div className="mb-3">
                    <label htmlFor="passwordInput" className="form_label">Senha</label>
                    <input
                        type="password"
                        className="form-control form_input"
                        id="passwordInput"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    {/* Componente para feedback visual da senha */}
                    <PasswordStrengthIndicator password={password} />
                </div>

                {/* Checkbox de Consentimento (LGPD) */}
                <div className="mb-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="consentCheck"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="consentCheck" style={{ fontSize: '0.9rem' }}>
                        Eu li e aceito a <a href="/privacy-policy" target="_blank">Política de Privacidade</a> e os <a href="/terms-of-service" target="_blank">Termos de Serviço</a>.
                    </label>
                </div>

                {/* Mensagem de Erro */}
                <ErrorMessage>{error}</ErrorMessage>

                {/* Botão de Submissão */}
                <button type="submit" className="button_primary w-100 mt-3" disabled={isLoading}>
                    {isLoading ? 'A enviar código...' : 'Continuar'}
                </button>
            </form>

            {/* Link para a página de login */}
            <p className="mt-4">
                Já tem uma conta? <Link to="/login">Faça login</Link>
            </p>
        </div>
    );
}