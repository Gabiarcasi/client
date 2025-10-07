/**
 * Utilitários
 *
 * @description Este arquivo centraliza funções utilitárias que podem ser
 * reutilizadas em diferentes partes da aplicação. Ele contém lógicas
 * independentes de formatação, como a de números de telefone e nomes de
 * casais.
 */

/**
 * Formata um número de telefone com a máscara (XX) XXXXX-XXXX.
 *
 * @param {string} value O valor do campo de entrada.
 * @returns {string} O número de telefone formatado.
 */
export const formatPhoneNumber = (value) => {
	// Retorna uma string vazia se o valor for nulo ou vazio.
	if (!value) return "";

	// Remove todos os caracteres não numéricos.
	const cleaned = value.replace(/\D/g, '');
	// Trunca o número para um máximo de 11 dígitos.
	const truncated = cleaned.slice(0, 11);

	// Aplica a máscara com base no número de dígitos.
	if (truncated.length > 10) {
		// (XX) XXXXX-XXXX (para 11 dígitos)
		return truncated.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2$3-$4');
	} else if (truncated.length > 6) {
		// (XX) XXXX-XXXX (para 7 a 10 dígitos)
		return truncated.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
	} else if (truncated.length > 2) {
		// (XX) XXXX (para 3 a 6 dígitos)
		return truncated.replace(/(\d{2})(\d*)/, '($1) $2');
	} else {
		// (XX) (para 1 a 2 dígitos)
		return truncated.replace(/(\d*)/, '($1');
	}
};

/**
 * Formata os nomes do casal para exibição.
 *
 * @param {string} brideName O nome da noiva.
 * @param {string} groomName O nome do noivo.
 * @returns {string} Os nomes formatados (ex: "Maria & João").
 */
export const formatCoupleNames = (brideName = '', groomName = '') => {
	// Função auxiliar para formatar um único nome.
	const formatName = (name) => {
		if (!name) return '';
		const parts = name.trim().split(' ');
		// Pega o primeiro e o segundo nome, se existirem.
		if (parts.length > 1) {
			return `${parts[0]} ${parts[1]}`;
		}
		// Se houver apenas um nome, retorna-o.
		return parts[0];
	};

	const formattedBride = formatName(brideName);
	const formattedGroom = formatName(groomName);

	// Combina os nomes formatados.
	if (formattedBride && formattedGroom) {
		return `${formattedBride} & ${formattedGroom}`;
	}
	// Retorna apenas um dos nomes se o outro estiver vazio.
	return formattedBride || formattedGroom;
};