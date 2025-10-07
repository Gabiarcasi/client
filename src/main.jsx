/**
 * Ponto de Entrada da Aplicação (main.jsx)
 *
 * @description Este arquivo é o ponto de entrada principal do seu
 * frontend React. Ele é o primeiro script a ser executado no navegador,
 * responsável por inicializar a aplicação e renderizar o componente
 * raiz (<App />) na página.
 */

// Importa os módulos e bibliotecas necessários
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importa os estilos globais da aplicação
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importa o pacote JavaScript do Bootstrap para habilitar funcionalidades como dropdowns
// O `bootstrap.bundle.min.js` inclui o Popper.js, que é necessário para popovers, tooltips, e dropdowns.
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Importa o componente raiz da aplicação
import App from './App.jsx';

/**
 * Renderiza a aplicação React no DOM.
 *
 * @description Esta função localiza o elemento HTML com o ID 'root' (geralmente
 * uma div vazia no arquivo `index.html`) e renderiza a aplicação dentro dela.
 * O `<StrictMode>` é um utilitário do React que ajuda a identificar problemas
 * de código e práticas não recomendadas durante o desenvolvimento.
 */
createRoot(document.getElementById('root')).render(
	<StrictMode>
		<App />
	</StrictMode>,
);