// Script para testar a geração de dados com diferentes modalidades de pagamento
// Execute isso no console do navegador após abrir a página

// Simular ambiente do navegador
const localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; }
};

console.log('='.repeat(60));
console.log('🧪 TESTE DE GERAÇÃO DE DADOS COM MODALIDADES DE PAGAMENTO');
console.log('='.repeat(60));

// Instruções para o usuário
console.log(`
✨ Para testar a geração de dados com diferentes modalidades de pagamento:

1. Abra a página do Admin (http://localhost:8080/rom_visua/admin)
2. Abra o Console do navegador (F12 -> Console)
3. Execute um destes comandos:

   • seedBookings()          - Gerar 50 reservas padrão
   • seedBookings(100)       - Gerar 100 reservas
   • getBookingsStats()      - Ver estatísticas das reservas
   • clearAllBookings()      - Limpar todas as reservas

📊 Dados que serão gerados:
   ✅ Reservas CONFIRMADA e FINALIZADA
   ✅ Diferentes modalidades de pagamento:
      - EXPRESS (Cartão/Débito imediato)
      - REFERENCIA (Referência Banco)
      - TRANSFERENCIA (Transferência Bancária)
      - PRESENCIAL (Pagamento Presencial)
   
   ✅ Pagamentos simulados:
      - 70% com pagamento completo (restante_pagar = 0)
      - 30% com pagamento parcial (com metodo_pagamento_saldo diferente)
      
   ✅ Modalidades de saldo:
      - TRANSFERENCIA
      - DINHEIRO
      - TPA

📈 Após gerar, verifique no painel de Relatório!
`);

console.log('='.repeat(60));
