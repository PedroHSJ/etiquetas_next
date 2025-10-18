"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Grupo, Produto } from "@/types/etiquetas";
import { createClient } from "@supabase/supabase-js";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";

export default function Page() {
  const [horario, setHorario] = useState("");
  const [dataColeta, setDataColeta] = useState("");
  const [dataDescarte, setDataDescarte] = useState("");
  const [responsavelAmostra, setResponsavelAmostra] = useState("");
  const [obsAmostra, setObsAmostra] = useState("");
  const { user } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<number | null>(null);
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroProduto, setFiltroProduto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [dataAbertura, setDataAbertura] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tipoEtiqueta, setTipoEtiqueta] = useState<string>("produto_aberto");
  const isMobile = useMobile();

  // Configure o Supabase Client (ajuste para seu ambiente)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Buscar grupos ao carregar
  useEffect(() => {
    async function fetchGrupos() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .order("name", { ascending: true });
      if (!error && data) setGrupos(data);
      setCarregando(false);
    }
    fetchGrupos();
  }, []);

  // Buscar produtos do grupo selecionado
  useEffect(() => {
    if (!grupoSelecionado) {
      setProdutos([]);
      return;
    }
    async function fetchProdutos() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, group_id")
        .eq("group_id", grupoSelecionado)
        .order("name", { ascending: true });
      if (!error && data) setProdutos(data);
      setCarregando(false);
    }
    fetchProdutos();
  }, [grupoSelecionado]);

  // Filtragem
  const gruposFiltrados = grupos.filter((g) =>
    (g.name || g.nome || '').toLowerCase().includes(filtroGrupo.toLowerCase())
  );
  const produtosFiltrados = produtos.filter((p) =>
    (p.name || p.nome || '').toLowerCase().includes(filtroProduto.toLowerCase())
  );

  // Função para abrir modal ao clicar no produto
  function handleProdutoClick(produto: Produto) {
    setProdutoSelecionado(produto);
    setQuantidade(1);
    setObservacoes("");
    setErro(null);
    setModalAberto(true);
  }

  // Função para inserir etiqueta
  async function handleSalvarEtiqueta() {
    setSalvando(true);
    setErro(null);
    
    if (!produtoSelecionado) {
      setErro("Selecione um produto");
      setSalvando(false);
      return;
    }
    
    // TODO: obter usuario_id e organizacao_id do contexto/auth
    const usuario_id = null;
    const organizacao_id = null;
    const etiquetaData: Record<string, unknown> = {
      produto_id: produtoSelecionado.id,
      quantidade,
      observacoes,
      usuario_id,
      organizacao_id,
      tipo: tipoEtiqueta,
    };
    if (tipoEtiqueta === "produto_aberto") {
      etiquetaData.data_abertura = dataAbertura;
      etiquetaData.data_validade = dataValidade;
      etiquetaData.responsavel = responsavel;
    }
    if (tipoEtiqueta === "amostra") {
      etiquetaData.horario = horario;
      etiquetaData.data_coleta = dataColeta;
      etiquetaData.data_descarte = dataDescarte;
      etiquetaData.responsavel =
        user?.user_metadata?.full_name || user?.email || responsavelAmostra;
      etiquetaData.obs = obsAmostra;
    }
    const { error } = await supabase.from("etiquetas").insert(etiquetaData);
    setSalvando(false);
    if (error) {
      setErro("Erro ao salvar etiqueta: " + error.message);
    } else {
      setModalAberto(false);
      setProdutoSelecionado(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gerar etiquetas</h1>
          </div>
        </div>
      </div>

      <Card className="">
        <CardHeader>
          {grupoSelecionado ? (
            <p className="text-lg font-medium">Selecione o produto</p>
          ) : (
            <p className="text-lg font-medium">Selecione o grupo</p>
          )}
        </CardHeader>
        <CardContent className="h-[420px] overflow-y-auto">
          {carregando && <div className="text-gray-500">Carregando...</div>}
          {!grupoSelecionado ? (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Filtrar grupos..."
                className="input input-bordered w-full mb-2 px-3 py-2 border rounded"
                value={filtroGrupo}
                onChange={(e) => setFiltroGrupo(e.target.value)}
              />
              <ul className="divide-y">
                {gruposFiltrados.map((grupo) => (
                  <li
                    key={grupo.id}
                    className="py-2 cursor-pointer hover:bg-emerald-50 px-2 rounded"
                    onClick={() => setGrupoSelecionado(grupo.id)}
                  >
                    {grupo.name || grupo.nome}
                  </li>
                ))}
                {gruposFiltrados.length === 0 && (
                  <li className="text-gray-400 py-2">
                    Nenhum grupo encontrado.
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                className="text-sm text-emerald-700 underline w-fit mb-2"
                onClick={() => setGrupoSelecionado(null)}
              >
                ← Voltar para grupos
              </button>
              <input
                type="text"
                placeholder="Filtrar produtos..."
                className="input input-bordered w-full mb-2 px-3 py-2 border rounded"
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
              />
              <ul className="divide-y">
                {produtosFiltrados.map((produto) => (
                  <li
                    key={produto.id}
                    className="py-2 px-2 cursor-pointer hover:bg-emerald-50 rounded"
                    onClick={() => handleProdutoClick(produto)}
                  >
                    {produto.name || produto.nome}
                  </li>
                ))}
                {produtosFiltrados.length === 0 && (
                  <li className="text-gray-400 py-2">
                    Nenhum produto encontrado.
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de criação de etiqueta */}
      {modalAberto && produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setModalAberto(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Nova etiqueta para:{" "}
              <span className="font-bold">{produtoSelecionado.name || produtoSelecionado.nome}</span>
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSalvarEtiqueta();
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="tipoEtiqueta"
                >
                  Tipo de etiqueta
                </label>
                <Select
                  value={tipoEtiqueta}
                  onValueChange={setTipoEtiqueta}
                  required
                >
                  <SelectTrigger
                    id="tipoEtiqueta"
                    className={
                      isMobile
                        ? "w-full px-3 py-3 border rounded text-lg"
                        : "w-full px-3 py-2 border rounded"
                    }
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipos</SelectLabel>
                      <SelectItem value="produto_aberto">
                        Produto Aberto
                      </SelectItem>
                      <SelectItem value="amostra">Amostra</SelectItem>
                      <SelectItem value="descongelo">Descongelo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {tipoEtiqueta === "amostra" && (
                <>
                  <div>
                    <Label
                      className="block text-sm font-medium mb-1"
                      htmlFor="horario"
                    >
                      Horário
                    </Label>
                    <Input
                      type="time"
                      id="horario"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label
                      className="block text-sm font-medium mb-1"
                      htmlFor="dataColeta"
                    >
                      Data da coleta
                    </Label>
                    <Input
                      type="date"
                      id="dataColeta"
                      value={dataColeta}
                      onChange={(e) => setDataColeta(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label
                      className="block text-sm font-medium mb-1"
                      htmlFor="dataDescarte"
                    >
                      Data do descarte
                    </Label>
                    <Input
                      type="date"
                      id="dataDescarte"
                      value={dataDescarte}
                      onChange={(e) => setDataDescarte(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label
                      className="block text-sm font-medium mb-1"
                      htmlFor="responsavelAmostra"
                    >
                      Responsável
                    </Label>
                    <Input
                      type="text"
                      id="responsavelAmostra"
                      value={
                        user?.user_metadata?.full_name ||
                        user?.email ||
                        responsavelAmostra
                      }
                      onChange={(e) => setResponsavelAmostra(e.target.value)}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label
                      className="block text-sm font-medium mb-1"
                      htmlFor="obsAmostra"
                    >
                      Observações
                    </Label>
                    <Textarea
                      id="obsAmostra"
                      value={obsAmostra}
                      onChange={(e) => setObsAmostra(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}
              {tipoEtiqueta === "produto_aberto" && (
                <>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="dataAbertura"
                    >
                      Data de abertura
                    </label>
                    <Input
                      type="date"
                      id="dataAbertura"
                      value={dataAbertura}
                      onChange={(e) => setDataAbertura(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="dataValidade"
                    >
                      Data de validade
                    </label>
                    <Input
                      type="date"
                      id="dataValidade"
                      value={dataValidade}
                      onChange={(e) => setDataValidade(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label
                      className="block text-sm font-medium mb-1"
                      htmlFor="responsavel"
                    >
                      Responsável
                    </Label>
                    <Input
                      type="text"
                      id="responsavel"
                      value={
                        user?.user_metadata?.full_name ||
                        user?.email ||
                        responsavel
                      }
                      onChange={(e) => setResponsavel(e.target.value)}
                      readOnly
                    />
                  </div>
                </>
              )}
              {erro && <div className="text-red-600 text-sm">{erro}</div>}
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-60"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar etiqueta"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
