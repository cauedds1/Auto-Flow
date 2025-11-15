import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, Trash2, FileCheck, FileWarning, FileBadge } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "CRLV", label: "CRLV", description: "Certificado de Registro", icon: FileCheck },
  { value: "Nota Fiscal", label: "Nota Fiscal", description: "Compra do veículo", icon: FileBadge },
  { value: "Laudo Cautelar", label: "Laudo Cautelar", description: "Vistoria técnica", icon: FileWarning },
  { value: "Contrato de Compra", label: "Contrato de Compra", description: "Aquisição do veículo", icon: FileText },
  { value: "Transferência", label: "Transferência", description: "Documentação de transferência", icon: FileText },
];

interface VehicleDocumentsProps {
  vehicleId: string;
}

export function VehicleDocuments({ vehicleId }: VehicleDocumentsProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; docId: string | null }>({ 
    open: false, 
    docId: null 
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/vehicles/${vehicleId}/documents`],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", type);

      const response = await fetch(`/api/vehicles/${vehicleId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/documents`] });
      setSelectedFile(null);
      setSelectedType("");
      toast({
        title: "Documento enviado!",
        description: "O documento foi adicionado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar documento",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const response = await fetch(`/api/vehicles/${vehicleId}/documents/${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar documento");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/documents`] });
      toast({
        title: "Documento removido!",
        description: "O documento foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao remover documento",
        description: "Não foi possível excluir o documento.",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Apenas arquivos PDF são permitidos.",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedType) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Selecione o tipo de documento e o arquivo PDF.",
      });
      return;
    }

    uploadMutation.mutate({ file: selectedFile, type: selectedType });
  };

  const handleDownload = (docId: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `/api/vehicles/${vehicleId}/documents/${docId}/download`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (docId: string) => {
    setDeleteDialog({ open: true, docId });
  };

  const confirmDelete = () => {
    if (deleteDialog.docId) {
      deleteMutation.mutate(deleteDialog.docId);
    }
    setDeleteDialog({ open: false, docId: null });
  };

  const getDocumentTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[0];
  };

  const groupedDocuments = DOCUMENT_TYPES.map(docType => ({
    ...docType,
    documents: documents.filter(doc => doc.documentType === docType.value),
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Upload className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Upload de Documento
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tipo de Documento
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Arquivo PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !selectedType || uploadMutation.isPending}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? "Enviando..." : "Enviar Documento"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Documentos do Veículo
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum documento adicionado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedDocuments.map(group => {
              if (group.documents.length === 0) return null;
              
              const Icon = group.icon;
              
              return (
                <div key={group.value}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Icon className="h-4 w-4 mr-1" />
                    {group.label}
                  </h4>
                  <div className="space-y-2">
                    {group.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {doc.originalFileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(doc.id, doc.originalFileName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, docId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
