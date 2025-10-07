/**
 * Contexto: WeddingContext
 *
 * @description Este arquivo implementa um contexto de React para gerenciar
 * o estado global dos casamentos de um usuário. Ele centraliza a lógica
 * de busca, seleção e atualização dos dados de casamento, tornando-os
 * acessíveis a qualquer componente na árvore da aplicação.
 */

// Importa os módulos e hooks necessários do React
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

// Importa o serviço de API para fazer requisições HTTP
import api from '../services/api';

/**
 * 1. Cria o Contexto
 */
const WeddingContext = createContext();

/**
 * 2. Cria o Provedor (Provider)
 */
export const WeddingProvider = ({ children }) => {
	// Estados locais para armazenar os dados e o estado da aplicação
	const [weddings, setWeddings] = useState([]);
	const [selectedWedding, setSelectedWedding] = useState(null);
	const [loading, setLoading] = useState(true);

	/**
	 * 3. Lógica de Busca de Dados
	 */
	const fetchWeddings = useCallback(async () => {
		try {
			setLoading(true);
			const response = await api.get('/weddings');
			setWeddings(response.data);
		} catch (error) {
			console.error("Falha ao buscar casamentos", error);
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * 4. Executa a Busca de Dados ao Montar o Componente
	 */
	useEffect(() => {
		fetchWeddings();
	}, [fetchWeddings]);

    // --- NOVO: Variável de estado derivada para a permissão de edição ---
    // useMemo garante que `canEdit` só é recalculado quando `selectedWedding` muda.
    const canEdit = useMemo(() => selectedWedding?.permission_level === 'edit', [selectedWedding]);

	/**
	 * 5. Funções de Manipulação de Estado
	 */
	const selectWeddingById = (weddingId) => {
		if (!weddingId) {
			setSelectedWedding(null);
			return;
		}
		const wedding = weddings.find(w => w.wedding_id === weddingId);
		setSelectedWedding(wedding);
	};
	
	const clearSelectedWedding = () => {
		setSelectedWedding(null);
	};

	const refreshWeddings = () => {
		fetchWeddings();
	};

	/**
	 * 6. Fornece o Valor do Contexto
	 */
	return (
		// Adicionamos `canEdit` ao valor fornecido pelo contexto
		<WeddingContext.Provider value={{ weddings, selectedWedding, selectWeddingById, loading, refreshWeddings, clearSelectedWedding, canEdit }}>
			{children}
		</WeddingContext.Provider>
	);
};

/**
 * 7. Cria um Hook Personalizado
 */
export const useWedding = () => useContext(WeddingContext);