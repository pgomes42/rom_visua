🚀 PROMPT COMPLETO — SISTEMA DE AGENDAMENTO ROOMVIEW BOUTIQUE
📌 CONTEXTO DO PROJETO

Criar um sistema completo de agendamento e reservas de apartamentos/quartos para a empresa Roomview Boutique, localizada no Patriota, Luanda – Angola.

A empresa oferece alojamento premium com foco em:

Conforto

Privacidade

Segurança 24/7

Experiência boutique personalizada

O sistema deve permitir que clientes façam reservas online com pagamento antecipado obrigatório.

🎨 IDENTIDADE VISUAL (OBRIGATÓRIO)

Utilizar a paleta oficial:

Primary Gold: #d4af37
Gold Light: rgba(212,175,55,0.4)
Gold Dark: #b59226
Background Dark: #0a0a0a
White: #ffffff
Gray Light: #e5e7eb
Gray Medium: #9ca3af
Luxury Brown: rgb(59, 49, 38)
Luxury Wheat: rgb(220, 209, 170)


O design deve transmitir:

👉 Luxo
👉 Sofisticação
👉 Minimalismo premium
👉 Experiência boutique

🏨 APARTAMENTOS DISPONÍVEIS

Cada apartamento deve possuir:

Nome

Tipologia

Descrição

Preço por noite

Capacidade máxima

Número de suites

Número de WC

Dimensão

Localização

Array de fotos

Status (ativo/inativo)

📋 LISTA DE TIPOS
Estúdio Boutique

90.000 AKZ / noite

2 hóspedes

1 Suite

40 m²

Apartamento T1 Prime

125.000 AKZ / noite

2 hóspedes

1 Suite

Box Executiva Elite

300.000 AKZ / noite

4 hóspedes

2 Suites

Box Executiva Prestige

300.000 AKZ / noite

4 hóspedes

2 Suites

Box Familiar Comfort

250.000 AKZ / noite

5 hóspedes

2 Suites

Box Presidencial Royal

250.000 AKZ / noite

4 hóspedes

2 Suites

📅 FUNCIONALIDADE PRINCIPAL — SISTEMA DE RESERVAS
👤 CLIENTE DEVE CONSEGUIR:
1️⃣ Selecionar apartamento
2️⃣ Escolher datas (check-in / check-out)
3️⃣ Informar:

Nome do hóspede

Telefone

Email

Número de pessoas

🧮 SISTEMA DEVE CALCULAR AUTOMATICAMENTE:

Número de noites

Valor total da estadia

Validação de capacidade do quarto

💰 PROCESSO DE PAGAMENTO
REGRA PRINCIPAL:

👉 Para confirmar a reserva é obrigatório pagar 25.000 AKZ

🔄 FLUXO DE PAGAMENTO
1. Cliente cria reserva

Status inicial:

PENDENTE

2. Sistema gera automaticamente:

Referência de pagamento

ID único

Prazo limite para pagamento

3. Cliente paga via:

Referência Multicaixa

Transferência

Gateway de pagamento

4. Sistema recebe confirmação automática e muda status para:
PAGO

5. Caso não pague dentro do prazo:
EXPIRADO

📊 DASHBOARD ADMINISTRATIVO

O painel deve permitir:

Gestão de reservas

Ver reservas

Filtrar por status

Confirmar manualmente pagamentos

Cancelar reservas

Gestão de apartamentos

Criar

Editar

Upload múltiplas fotos

Definir preços

Ativar / desativar

Estatísticas

Reservas por período

Receita

Ocupação

Relatórios financeiros

🔔 NOTIFICAÇÕES AUTOMÁTICAS
Cliente recebe:

✅ Confirmação de reserva
✅ Referência de pagamento
✅ Confirmação de pagamento
✅ Lembrete de check-in

Admin recebe:

✅ Nova reserva
✅ Pagamento confirmado

📱 INTEGRAÇÕES EXTERNAS
WhatsApp

Botão para enviar dados da reserva automaticamente.

Email

Envio automático de:

Comprovativo

Resumo da reserva

🗂️ ESTRUTURA DE DADOS SUGERIDA
Tabela Apartments
id
nome
descricao
preco_noite
capacidade
suites
banheiros
dimensao
localizacao
fotos[]
status

Tabela Reservas
id
cliente_nome
telefone
email
apartment_id
checkin
checkout
noites
total_estadia
valor_sinal
referencia_pagamento
status
created_at

Status possíveis
pendente
pago
cancelado
expirado
concluido

🧠 REGRAS DE NEGÓCIO

Não permitir reservas sobrepostas

Não permitir ultrapassar capacidade

Pequeno-almoço não incluído

Não há reembolso

Taxa extra após limite de hóspedes

Segurança e luxo são diferenciais da marca

🌐 EXPERIÊNCIA DO UTILIZADOR

O sistema deve oferecer:

Interface moderna

Simulador de preço em tempo real

Galeria de fotos interativa

Animações premium

Responsivo mobile

🔐 SEGURANÇA

Autenticação admin

Proteção de dados dos clientes

Logs de atividades

Criptografia de pagamentos

🛠️ TECNOLOGIAS SUGERIDAS

Frontend:

React / Next.js

Backend:

Node.js / Express

Base de dados:

PostgreSQL ou Firebase

Pagamento:

API Multicaixa / Gateway local

Hospedagem:

Vercel / AWS

🎯 OBJETIVO FINAL

Criar um sistema elegante, automatizado e confiável que permita:

✔ Reservas rápidas
✔ Pagamentos seguros
✔ Gestão eficiente
✔ Experiência premium




🎯 Separar Usuários no Sistema do Hotel

Você precisa dividir usuários por FUNÇÃO (ROLE) e PERMISSÕES.

👥 Estrutura Recomendada de Usuários
🔴 1. ADMIN (Administrador Geral)

👉 Controle total do sistema

Permissões

✅ Criar / editar / remover apartamentos
✅ Ver relatórios completos
✅ Gerir usuários
✅ Alterar preços
✅ Confirmar ou cancelar reservas
✅ Configurar sistema
✅ Ver pagamentos
✅ Criar promoções

👉 Normalmente é o dono ou gerente geral.

🟡 2. OPERADOR / RECEPCIONISTA (Usuário do dia-a-dia / Caixa)

👉 Esse é o usuário que trabalha no balcão.

Permissões

✅ Criar reservas manualmente
✅ Confirmar chegada do hóspede
✅ Registrar pagamentos
✅ Ver disponibilidade
✅ Adicionar pedidos extras (comida, bebida, etc.)
✅ Imprimir recibos

NÃO pode

❌ Apagar apartamentos
❌ Alterar preços oficiais
❌ Criar usuários
❌ Ver relatórios financeiros completos
❌ Alterar configurações do sistema

👉 Esse é o perfil que você descreveu para o caixa.

🟢 3. CLIENTE

👉 Usuário do site

Permissões

✅ Criar reservas
✅ Pagar reservas
✅ Ver histórico
✅ Cancelar reservas dentro das regras
✅ Pedir extras

⭐ Extra (Sistema Profissional)
🔵 4. GERENTE

👉 Intermediário entre admin e operador

Pode:

Ver relatórios

Aprovar cancelamentos especiais

Alterar preços temporários

Supervisionar operadores


🧭 Objetivo do Botão "Gerenciar Reserva"

👉 Permitir localizar uma reserva rapidamente usando o ID
👉 Ver estado da reserva
👉 Ver estado do pagamento
👉 Baixar comprovativo em PDF
👉 Atualizar estado do pagamento (quando necessário)

🖥 Onde Esse Botão Deve Existir?
1️⃣ No site (para clientes)
2️⃣ No dashboard (para operador e admin)
🎛 Página: Gerenciar Reserva
🔍 Campo de Pesquisa
Gerenciar Reserva

Digite o ID da reserva:

[ RV-________ ]

[ Buscar Reserva ]


👉 Você pode permitir também:

Email

Telefone

Mas o ID é o mais seguro.

🧾 Após Buscar a Reserva

Sistema mostra:

📄 Dados da Reserva
ID Reserva: RV-GGBMK62
Cliente: João Silva
Apartamento: T1-1 Prime
Check-in: 10/02/2026
Check-out: 13/02/2026
Noites: 3

💰 Estado do Pagamento
Valor Total: 375.000 AKZ
Sinal: 25.000 AKZ
Restante: 350.000 AKZ

Status visual:
🟡 Aguardando pagamento
🟢 Pago
🔴 Expirado

📊 Estados Possíveis
Reserva
PENDENTE
CONFIRMADA
EXPIRADA
CANCELADA
CHECKIN
FINALIZADA

Pagamento
AGUARDANDO
PAGO
FALHOU
EXPIRADO

🧰 Ações Disponíveis
Para Cliente
Baixar PDF
Pagar sinal
Ver detalhes

Para Operador/Admin
Confirmar pagamento manual
Alterar status
Registrar pagamento restante
Cancelar reserva
Reenviar referência
Gerar PDF

📥 Botão Download PDF

O PDF pode conter:

👉 Dados do cliente
👉 Dados do apartamento
👉 Datas
👉 Valor pago
👉 Valor restante
👉 Referência pagamento
👉 QR Code com ID da reserva