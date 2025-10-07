/**
 * Página: TermsOfServicePage
 *
 * @description Este componente React exibe os Termos de Serviço da
 * plataforma Mariage. É uma página de conteúdo estático, acessível publicamente.
 */

import React from 'react';

export default function TermsOfServicePage() {
	return (
		<div className="container py-5">
			<div className="card_base" style={{ maxWidth: '800px', margin: '0 auto' }}>
				<h1 className="title_h1 text-center mb-4">Termos de Serviço</h1>
				<p className="text-muted text-center">Última atualização: 7 de outubro de 2025</p>
				
				<p>
					Bem-vindo(a) ao Mariage! Estes Termos de Serviço ("Termos") regem o seu uso da nossa plataforma de planejamento de casamentos. Ao criar uma conta ou usar nossos serviços, você concorda com estes Termos.
				</p>

				<h2 className="title_h2 mt-4">1. Descrição do Serviço</h2>
				<p>
					O Mariage é uma plataforma online que oferece ferramentas para auxiliar no planejamento de casamentos, incluindo gestão de convidados, controle de orçamento, lista de fornecedores e criação de um site público para o evento ("Serviço").
				</p>

				<h2 className="title_h2 mt-4">2. Suas Responsabilidades como Usuário</h2>
				<ul>
					<li><strong>Segurança da Conta:</strong> Você é responsável por manter a confidencialidade da sua senha e por todas as atividades que ocorrem na sua conta.</li>
					<li><strong>Conteúdo do Usuário:</strong> Você é inteiramente responsável por todo o conteúdo que insere na plataforma (informações de convidados, fornecedores, etc.). Você declara que tem o direito de usar e compartilhar esse conteúdo.</li>
					<li><strong>Uso Aceitável:</strong> Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida por estes Termos.</li>
				</ul>

				<h2 className="title_h2 mt-4">3. Nossos Direitos</h2>
				<ul>
					<li><strong>Propriedade Intelectual:</strong> O Serviço, incluindo seu design e logo, é propriedade do Mariage.</li>
					<li><strong>Suspensão de Conta:</strong> Reservamo-nos o direito de suspender ou encerrar sua conta se você violar estes Termos.</li>
				</ul>

				<h2 className="title_h2 mt-4">4. Limitação de Responsabilidade</h2>
				<p>
					O Serviço é fornecido "como está". O Mariage não se responsabiliza por qualquer perda de dados ou por disputas entre você, seus convidados ou seus fornecedores.
				</p>

				<h2 className="title_h2 mt-4">5. Encerramento da Conta</h2>
				<p>
					Você pode encerrar sua conta a qualquer momento através da opção "Apagar Minha Conta" no seu perfil. O encerramento resultará na exclusão permanente de todos os seus dados, conforme descrito em nossa Política de Privacidade.
				</p>
				
				<h2 className="title_h2 mt-4">6. Legislação Aplicável</h2>
				<p>Estes Termos serão regidos pelas leis da República Federativa do Brasil.</p>

				<h2 className="title_h2 mt-4">7. Contato</h2>
				<p>Para qualquer dúvida sobre estes Termos, entre em contato conosco: <strong>mariage.planejar.casamentos@gmail.com</strong>.</p>
			</div>
		</div>
	);
}