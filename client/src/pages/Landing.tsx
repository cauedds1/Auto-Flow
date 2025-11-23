import { Button } from "@/components/ui/button";
import { Car, TrendingUp, BarChart, Sparkles, Wrench, Gauge, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-green-600 flex flex-col relative overflow-hidden">
      {/* Automotive pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border-4 border-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Header */}
      <header className="p-6 relative z-10">
        <div className="flex items-center gap-3 group hover-elevate active-elevate-2 rounded-xl p-3 inline-flex transition-all duration-300">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Car className="w-7 h-7 text-purple-600" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">VeloStock</span>
          <Gauge className="w-6 h-6 text-green-300 ml-2 group-hover:rotate-12 transition-transform" />
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
          <div className="grid md:grid-cols-3 gap-6 py-8 relative z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-elevate active-elevate-2 cursor-default transition-all group">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Pipeline Visual</h3>
              <p className="text-purple-100 text-sm">
                Acompanhe cada veículo da entrada à venda em um kanban intuitivo
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-elevate active-elevate-2 cursor-default transition-all group">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <BarChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Análise Completa</h3>
              <p className="text-purple-100 text-sm">
                Dashboard com métricas em tempo real e controle de custos detalhado
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-elevate active-elevate-2 cursor-default transition-all group">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">IA Integrada</h3>
              <p className="text-purple-100 text-sm">
                Sugestões de preço e geração de anúncios com inteligência artificial
              </p>
            </div>
          </div>
          
          {/* Automotive-specific features */}
          <div className="grid md:grid-cols-3 gap-4 py-4 relative z-10">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <Wrench className="w-8 h-8 text-green-300" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Preparação</p>
                <p className="text-purple-200 text-xs">Checklists completos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <Car className="w-8 h-8 text-green-300" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Estoque</p>
                <p className="text-purple-200 text-xs">Controle total</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <Shield className="w-8 h-8 text-green-300" />
              <div className="text-left">
                <p className="text-white font-medium text-sm">Seguro</p>
                <p className="text-purple-200 text-xs">Multi-tenant</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-6 justify-center items-center pt-4 max-w-md mx-auto w-full relative z-10">
            <Button 
              size="lg" 
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl w-full hover-elevate transition-all"
              onClick={() => window.location.href = '/signup'}
              data-testid="button-criar-conta"
            >
              Criar Conta Grátis
            </Button>
            
            <div className="text-center">
              <p className="text-purple-200 text-sm mb-2">Já tem uma conta?</p>
              <Button 
                variant="link" 
                className="text-white hover:text-purple-100 font-semibold underline text-lg"
                onClick={() => window.location.href = '/login'}
                data-testid="button-fazer-login"
              >
                Fazer Login
              </Button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-8 relative z-10">
            <p className="text-purple-200 text-sm">
              Sistema multi-tenant • Seguro e escalável • Controle completo para revendas automotivas
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
