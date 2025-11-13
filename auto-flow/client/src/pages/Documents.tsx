import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Download, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Documents() {
  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie documentos e arquivos importantes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos de Veículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              CRLVs, notas fiscais e outros documentos dos veículos
            </p>
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Contratos de compra e venda
            </p>
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Arquivo Morto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Documentos arquivados de veículos vendidos
            </p>
            <Button variant="outline" className="w-full">
              Visualizar Arquivo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
