/**
 * Componente: LoadingSpinner
 *
 * @description Este é um componente React simples e reutilizável, projetado para
 * exibir uma animação de carregamento (spinner) junto com uma mensagem de texto.
 * Ele é usado para indicar ao usuário que uma operação assíncrona está em
 * andamento, como o carregamento de dados da API.
 */

// Importa o módulo React
import React from 'react';
// Importa o arquivo de estilos CSS para o spinner.
import '../css/LoadingSpinner.css';

/**
 * @param {object} props - As propriedades do componente.
 * @param {string} [props.message='A carregar...'] - A mensagem de texto a ser exibida. O valor padrão é 'A carregar...'.
 * @returns {JSX.Element} O elemento JSX que renderiza o spinner e a mensagem.
 */
const LoadingSpinner = ({ message = 'A carregar...' }) => {
	return (
		<div className="spinner_container">
			<div className="loading_spinner"></div>
			<p>{message}</p>
		</div>
	);
};

export default LoadingSpinner;