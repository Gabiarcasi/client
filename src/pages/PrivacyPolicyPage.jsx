/**
 * Página: PrivacyPolicyPage
 *
 * @description Este componente React exibe a Política de Privacidade da
 * plataforma Mariage. É uma página de conteúdo estático, acessível publicamente.
 */

import React from 'react';

export default function PrivacyPolicyPage() {
	return (
		<div className="container py-5">
			<div className="card_base" style={{ maxWidth: '800px', margin: '0 auto' }}>
				<h1 className="title_h1 text-center mb-4">Política de Privacidade</h1>
				<p className="text-muted text-center">Última atualização: 7 de outubro de 2025</p>
				
				<p>
					Bem-vindo(a) ao Mariage! A sua privacidade é de extrema importância para nós. Esta Política de Privacidade explica quais dados pessoais coletamos, como os usamos e quais são os seus direitos em relação a eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil.
				</p>
				
				<h2 className="title_h2 mt-4">1. Dados que Coletamos</h2>
				<p>Coletamos informações para fornecer e melhorar nossos serviços. Os tipos de dados coletados são:</p>
				<ul>
					<li>
						<strong>Informações que Você nos Fornece Diretamente:</strong>
						<ul>
							<li><strong>Criação de Conta:</strong> Ao se registrar, coletamos seu nome completo, endereço de e-mail e senha (que é armazenada de forma segura usando hash criptográfico).</li>
							<li><strong>Planejamento do Casamento:</strong> Ao criar e editar um casamento, você pode fornecer informações como os nomes dos noivos, data e local do evento, orçamento estimado, lista de convidados e fornecedores.</li>
							<li><strong>Lista de Convidados:</strong> Você pode inserir dados de seus convidados, como nome completo e informações de contato (e-mail ou telefone), para gerenciar a lista e o RSVP.</li>
							<li><strong>Equipe de Planejamento:</strong> Ao convidar membros para sua equipe, coletamos o endereço de e-mail do convidado para enviar o convite em seu nome.</li>
						</ul>
					</li>
					<li>
						<strong>Informações que Coletamos Automaticamente:</strong>
						<ul>
							<li><strong>Cookies:</strong> Utilizamos um cookie `HttpOnly` essencial e seguro para manter sua sessão de usuário autenticada (o `refreshToken`). Ele não é usado para rastreamento ou publicidade.</li>
						</ul>
					</li>
				</ul>

				<h2 className="title_h2 mt-4">2. Como Usamos Seus Dados</h2>
				<p>Utilizamos seus dados estritamente para os seguintes propósitos:</p>
				<ul>
					<li><strong>Fornecer e Manter o Serviço:</strong> Para permitir que você use todas as ferramentas de planejamento.</li>
					<li><strong>Comunicação:</strong> Para enviar e-mails transacionais essenciais, como verificação de conta, redefinição de senha e convites para a equipe.</li>
					<li><strong>Segurança:</strong> Para proteger sua conta contra acesso não autorizado.</li>
					<li><strong>Funcionalidades Públicas (Iniciadas por Você):</strong> Para exibir as informações do seu casamento no site público que você mesmo personaliza e para permitir que seus convidados respondam ao RSVP.</li>
				</ul>
				<p><strong>Nós não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</strong></p>

				<h2 className="title_h2 mt-4">3. Seus Direitos de Acordo com a LGPD</h2>
				<p>Você, como titular dos dados, tem os seguintes direitos:</p>
				<ul>
					<li><strong>Direito de Acesso:</strong> Você pode visualizar os dados da sua conta e casamento a qualquer momento no painel da aplicação.</li>
					<li><strong>Direito de Correção:</strong> Você pode editar e atualizar suas informações diretamente nas páginas de edição da plataforma.</li>
					<li><strong>Direito à Exclusão (Direito ao Esquecimento):</strong> Você pode excluir sua conta a qualquer momento através da opção "Apagar Minha Conta" no menu do seu perfil. Ao fazer isso, todos os seus dados pessoais e de planejamento associados serão permanentemente removidos.</li>
				</ul>

				<h2 className="title_h2 mt-4">4. Segurança dos Dados</h2>
				<p>Levamos a segurança dos seus dados a sério e implementamos medidas técnicas para protegê-los, incluindo criptografia de senhas, uso de cookies `HttpOnly` seguros, e controle de acesso rigoroso.</p>

				<h2 className="title_h2 mt-4">5. Contato</h2>
				<p>Se tiver qualquer dúvida sobre esta Política de Privacidade, entre em contato conosco pelo e-mail: <strong>mariage.planejar.casamentos@gmail.com</strong>.</p>
			</div>
		</div>
	);
}