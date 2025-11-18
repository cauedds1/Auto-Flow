import { Button } from "@/components/ui/button";
import { Car, TrendingUp, BarChart, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-green-600 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-white">VeloStock</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Título */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Gestão Completa para
              <span className="block bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Revenda de Veículos
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto">
              Controle total do estoque, preparação, custos e vendas em uma plataforma inteligente e moderna.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 py-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <TrendingUp className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Pipeline Visual</h3>
              <p className="text-purple-100 text-sm">
                Acompanhe cada veículo da entrada à venda em um kanban intuitivo
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <BarChart className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Análise Completa</h3>
              <p className="text-purple-100 text-sm">
                Dashboard com métricas em tempo real e controle de custos detalhado
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Sparkles className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">IA Integrada</h3>
              <p className="text-purple-100 text-sm">
                Sugestões de preço e geração de anúncios com inteligência artificial
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl"
              onClick={() => window.location.href = '/api/login'}
            >
              Começar Agora
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent text-white border-white/30 hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-xl"
              onClick={() => window.location.href = '/api/login'}
            >
              Entrar na Conta
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-8">
            <p className="text-purple-200 text-sm">
              Sistema multi-tenant • Seguro e escalável • Login com Google, GitHub, Apple
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-purple-200 text-sm">
        <p>© 2024 VeloStock. Gestão inteligente para sua revenda.</p>
      </footer>
    </div>
  );
}
