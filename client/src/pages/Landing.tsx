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
          <div className="flex flex-col gap-6 justify-center items-center pt-4 max-w-md mx-auto w-full">
            <Button 
              size="lg" 
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl w-full"
              onClick={() => window.location.href = '/signup'}
            >
              Criar Conta Grátis
            </Button>
            
            <div className="flex items-center gap-3 w-full">
              <div className="h-px bg-white/30 flex-1" />
              <span className="text-purple-200 text-sm">ou</span>
              <div className="h-px bg-white/30 flex-1" />
            </div>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-xl w-full flex items-center justify-center gap-3"
              onClick={() => window.location.href = '/api/auth/google'}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>
            
            <div className="text-center">
              <p className="text-purple-200 text-sm mb-2">Já tem uma conta?</p>
              <Button 
                variant="link" 
                className="text-white hover:text-purple-100 font-semibold underline"
                onClick={() => window.location.href = '/login'}
              >
                Fazer Login
              </Button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-8">
            <p className="text-purple-200 text-sm">
              Sistema multi-tenant • Seguro e escalável • Login nativo ou com Google
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
