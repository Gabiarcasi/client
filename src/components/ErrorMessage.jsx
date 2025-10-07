/**
 * Componente: ErrorMessage
 *
 * @description Este é um componente React simples e reutilizável, projetado para
 * exibir mensagens de erro de forma consistente em toda a aplicação. Sua
 * principal função é receber uma mensagem de erro como 'children' (filho) e
 * renderizá-la em um formato estilizado.
 */

// Importa o módulo React
import React from 'react';

/**
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - O conteúdo a ser exibido dentro do componente, geralmente uma string com a mensagem de erro.
 * @returns {JSX.Element | null} O elemento div com a mensagem de erro ou `null` se não houver mensagem.
 */
const ErrorMessage = ({ children }) => {
	// Se `children` for falso (por exemplo, null, undefined, ou uma string vazia),
	// o componente não renderiza nada, evitando um espaço vazio na UI.
	if (!children) {
		return null;
	}

	// Renderiza a mensagem de erro em uma div com classes de estilo predefinidas.
	return (
		<div className="alert_message alert_error">
			{children}
		</div>
	);
};

export default ErrorMessage;