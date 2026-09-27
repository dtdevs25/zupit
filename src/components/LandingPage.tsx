import React from 'react';
import { ArrowRight, Play, Star, Users, Zap, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onEnterPin: () => void;
  onGoToHost: () => void;
  onOpenPlans: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPin, onGoToHost, onOpenPlans }) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#46178f] flex flex-col text-white font-['Montserrat',sans-serif] overflow-y-auto">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 py-16 md:py-24">
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight text-white animate-slideUp">
          Engaje sua equipe com quizes em <span className="text-yellow-400 underline decoration-wavy">tempo real.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-purple-200 font-medium mb-12 leading-relaxed max-w-3xl mx-auto animate-slideUp" style={{animationDelay: '100ms'}}>
          Transforme treinamentos, aulas e reuniões tediosas em um <strong>verdadeiro espetáculo interativo!</strong> Nossa IA cria o quiz em segundos e seus participantes jogam pelo celular. <span className="text-pink-300 font-bold">100% adrenalina.</span>
        </p>

        <div className="w-full max-w-sm mx-auto animate-slideUp" style={{animationDelay: '200ms'}}>
          <button
            onClick={onEnterPin}
            className="w-full py-5 px-8 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-purple-950 font-black text-2xl rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-3 ring-4 ring-yellow-400/30"
          >
            <Play className="w-7 h-7 fill-current" />
            JOGAR AGORA
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#321066] py-16 md:py-24 px-4 border-t-4 border-purple-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">Por que escolher o ZUPiT!?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#46178f] p-8 rounded-3xl shadow-xl border border-purple-500/30">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-7 h-7 text-purple-950" />
              </div>
              <h3 className="text-2xl font-black mb-3">IA Generativa</h3>
              <p className="text-purple-200 leading-relaxed">
                Não perca horas criando perguntas. Digite um tema e nossa Inteligência Artificial gera um quiz completo e divertido em 5 segundos.
              </p>
            </div>

            <div className="bg-[#46178f] p-8 rounded-3xl shadow-xl border border-purple-500/30">
              <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">100% Interativo</h3>
              <p className="text-purple-200 leading-relaxed">
                Os jogadores acompanham o ranking em tempo real, ganham bônus por velocidade e personalizam seus próprios avatares 3D no celular.
              </p>
            </div>

            <div className="bg-[#46178f] p-8 rounded-3xl shadow-xl border border-purple-500/30">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Planos Flexíveis</h3>
              <p className="text-purple-200 leading-relaxed">
                Faça um teste grátis ou escolha planos acessíveis para turmas grandes. Sem fidelidade, cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Pricing Teaser */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para transformar sua aula?</h2>
        <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
          Crie sua conta agora e ganhe 1 quiz gratuito para testar com até 15 participantes.
        </p>
        <button
          onClick={onOpenPlans}
          className="py-5 px-10 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xl rounded-2xl shadow-2xl transition-transform active:scale-95 ring-4 ring-yellow-400/30"
        >
          Ver Planos e Preços
        </button>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-purple-400 bg-[#240b4d]">
        <p>© {new Date().getFullYear()} ZUPiT! - Desenvolvido para engajar.</p>
      </footer>
    </div>
  );
};
