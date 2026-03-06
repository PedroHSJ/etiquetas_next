"use client";

import { useState, useEffect } from "react";
import { Copy, PlusCircle, Printer, Download, Terminal, WifiHigh, WifiOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DevicesService, PrinterInfo } from "@/lib/services/client/devices-service";

// Temporary direct import maps for standard Shadcn if not globally aliased 
import { Card as UICard, CardContent as UICardContent, CardDescription as UICardDescription, CardHeader as UICardHeader, CardTitle as UICardTitle, CardFooter as UICardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DevicesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(true);

  const fetchPrinters = async () => {
    setLoadingPrinters(true);
    try {
      const data = await DevicesService.getConnectedPrinters();
      setPrinters(data);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao comunicar com o Hub de Impressoras.");
    } finally {
      setLoadingPrinters(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
    const interval = setInterval(fetchPrinters, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setToken(null);
    try {
      const newToken = await DevicesService.generateInstallationToken();
      if (newToken) {
        setToken(newToken);
        toast.success("Token de Integração gerado com sucesso.");
      } else {
        toast.error("Ocorreu um erro gerando o Token.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    toast.success("Token copiado para a Área de Transferência!");
  };

  const isOnline = printers.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Printer className="h-6 w-6 text-primary" />
          Dispositivos e Impressoras
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie e integre suas impressoras locais com a Nuvem.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <UICard className="border-none shadow-sm h-full flex flex-col">
          <UICardHeader className="pb-3 border-b">
            <UICardTitle className="text-base font-semibold flex items-center justify-between">
              Status do Serviço Windows
              {loadingPrinters ? (
                 <Skeleton className="w-16 h-6 rounded-full" />
              ) : isOnline ? (
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1 px-2.5 py-0.5" variant="outline">
                  <WifiHigh className="h-3.5 w-3.5" /> Online
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 gap-1 px-2.5 py-0.5">
                  <WifiOff className="h-3.5 w-3.5" /> Offline
                </Badge>
              )}
            </UICardTitle>
            <UICardDescription>Status da ponte de comunicação local.</UICardDescription>
          </UICardHeader>
          <UICardContent className="pt-6 flex-1 flex flex-col justify-center">
             {loadingPrinters ? (
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                </div>
             ) : (
                <div className="space-y-4">
                  {!isOnline ? (
                    <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-800">Serviço Desconectado</h3>
                          <div className="mt-2 text-sm text-amber-700">
                            <p>
                              Parece que não há nenhum serviço de impressão (LabelPrintService) online para o seu restaurante. Certifique-se de que instalou o aplicativo no seu computador principal.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                        <Label className="text-slate-500 font-medium">Impressoras Físicas Detectadas localmente:</Label>
                        <ul className="grid gap-2">
                            {printers.map((p, i) => (
                                <li key={i} className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                                    <div className="bg-white p-1.5 shadow-sm rounded border border-slate-200">
                                        <Printer className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700">{p.printerName}</span>
                                        {p.status && <span className="text-xs text-slate-400 capitalize">{p.status}</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                  )}
                </div>
             )}
          </UICardContent>
        </UICard>

        {/* Integration Card */}
        <UICard className="border-none shadow-sm flex flex-col h-full">
            <UICardHeader className="pb-3 border-b">
                <UICardTitle className="text-base font-semibold">Credencial de Instalação</UICardTitle>
                <UICardDescription>Gere o Token de Integração Inquebrável (JWT) para instalar o Serviço.</UICardDescription>
            </UICardHeader>
            <UICardContent className="pt-6 flex-1 flex flex-col gap-6">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Para habilitar impressões por nuvem, você deve ter o **Serviço Físico de Etiquetas** instalado na máquina conectada via USB na impressora, e inserir um Token para assinar a conexão no momento da instalação.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                            variant="default" 
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                            onClick={handleGenerateToken}
                            disabled={isGenerating}
                        >
                            {isGenerating ? "Gerando..." : (
                                <>
                                    <Terminal className="mr-2 h-4 w-4" />
                                    Gerar Novo Token
                                </>
                            )}
                        </Button>
                        <Button variant="outline" className="shadow-sm">
                            <Download className="mr-2 h-4 w-4 text-indigo-600" />
                            Baixar Instalador Windows (.msi)
                        </Button>
                    </div>
                </div>

                {token && (
                    <div className="mt-auto bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Label htmlFor="token" className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 block">
                            Token de Autenticação Gerado
                        </Label>
                        <div className="flex space-x-2">
                            <Input
                                id="token"
                                value={token}
                                readOnly
                                className="font-mono text-xs text-slate-600 bg-white border-slate-200 cursor-text select-all"
                            />
                            <Button 
                                variant="secondary"
                                size="icon"
                                className="shrink-0 text-slate-500 hover:text-slate-900 border-slate-200"
                                onClick={copyToClipboard}
                                title="Copiar Token"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Aviso: Copie o token agora e cole-o na etapa solicitada do Assistente de Instalação.
                        </p>
                    </div>
                )}
            </UICardContent>
        </UICard>
      </div>
    </div>
  );
}
