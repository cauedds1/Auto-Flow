import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCurrentCompany } from "../hooks/use-company";
import { CompanySetupDialog } from "../components/CompanySetupDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle } from "lucide-react";

export default function FirstTimeSetup() {
  const [, setLocation] = useLocation();
  const { hasCompany, isLoading } = useCurrentCompany();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!isLoading && hasCompany) {
      setLocation("/");
    }
  }, [hasCompany, isLoading, setLocation]);

  const handleSuccess = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-green-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Logo and main heading */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-8">
              <img 
                src="/velostock-logo.svg" 
                alt="VeloStock" 
                className="h-32 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Gerencie seu estoque<br />
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                com velocidade
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Plataforma completa de gestão operacional para concessionárias e lojas de veículos
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 hover:shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gestão Completa</h3>
              <p className="text-purple-100">
                Controle veículos, estoque de suprimentos, custos e documentos em um único lugar
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 hover:shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Inteligência Artificial</h3>
              <p className="text-purple-100">
                Sugestão automática de preços e gerador de anúncios profissionais
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 hover:shadow-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-green-400 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Alertas Inteligentes</h3>
              <p className="text-purple-100">
                Notificações automáticas para otimizar suas operações e vendas
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setShowSetup(true)}
              className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-500 to-green-500 text-white text-xl font-bold rounded-2xl hover:from-purple-600 hover:to-green-600 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50"
            >
              <span>Começar Agora</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-purple-200 mt-4 text-sm">
              Configure sua empresa em menos de 2 minutos
            </p>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <CompanySetupDialog
        open={showSetup}
        onOpenChange={setShowSetup}
        onSuccess={handleSuccess}
      />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
