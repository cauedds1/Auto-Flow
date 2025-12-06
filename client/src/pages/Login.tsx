import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Login() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = "/";
      } else {
        toast({
          title: t("auth.loginFailed"),
          description: data.message || t("auth.loginFailedDesc"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: t("auth.connectionError"),
        description: t("auth.connectionErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-green-600 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <Car className="w-7 h-7 text-purple-600" />
          </div>
          <span className="text-3xl font-bold text-white">VeloStock</span>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">{t("auth.loginTitle")}</CardTitle>
            <CardDescription>
              {t("auth.loginSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? t("auth.entering") : t("auth.login")}
              </Button>
            </form>

            <div className="text-center text-sm pt-4 space-y-2">
              <div>
                <button
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold underline"
                  onClick={() => window.location.href = '/forgot-password'}
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
              <div>
                <span className="text-muted-foreground">{t("auth.noAccount")} </span>
                <button
                  className="p-0 h-auto font-semibold text-purple-600 hover:text-purple-700 underline"
                  onClick={() => window.location.href = '/signup'}
                >
                  {t("auth.createAccount")}
                </button>
              </div>
              <div>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => window.location.href = '/'}
                >
                  ← {t("auth.backToHome")}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
