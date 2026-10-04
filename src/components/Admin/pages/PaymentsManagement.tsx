import React from 'react';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function PaymentsManagement() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-white">Assinaturas e Pagamentos</h1>
        <p className="text-purple-300 mt-1">Controle o faturamento, assinaturas ativas e histórico.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider">Receita Total</p>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-4xl font-black text-white">R$ 12.450</h2>
            <span className="flex items-center text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +15%
            </span>
          </div>
        </div>
        
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider">Assinantes Ativos</p>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-4xl font-black text-white">842</h2>
            <span className="flex items-center text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +5%
            </span>
          </div>
        </div>

        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider">Inadimplentes</p>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-4xl font-black text-white">24</h2>
            <span className="flex items-center text-sm font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">
              <ArrowDownRight className="w-4 h-4 mr-1" /> -2%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 h-64 flex flex-col items-center justify-center text-center mt-8">
        <DollarSign className="w-16 h-16 text-purple-700 mb-4" />
        <h3 className="text-xl font-bold text-purple-300">Integração com Gateway de Pagamento</h3>
        <p className="text-sm text-purple-400 max-w-md mt-2">
          Esta tela será conectada via API ao Stripe/MercadoPago para processar cobranças reais, gerar faturas e gerenciar cartões.
        </p>
        <button className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors">
          Configurar Gateway
        </button>
      </div>
    </div>
  );
}
