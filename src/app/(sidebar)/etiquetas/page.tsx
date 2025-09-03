"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Page() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null);
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroProduto, setFiltroProduto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tipoEtiqueta, setTipoEtiqueta] = useState<string>("produto_aberto");

  // Configure o Supabase Client (ajuste para seu ambiente)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Buscar grupos ao carregar
  useEffect(() => {
    async function fetchGrupos() {
      setCarregando(true);
      const { data, error } = await supabase
        .from("grupos")
        .select("id, nome")
        .order("nome", { ascending: true });
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
        .from("produtos")
        .select("id, nome, grupo_id")
        .eq("grupo_id", grupoSelecionado)
        .order("nome", { ascending: true });
      if (!error && data) setProdutos(data);
      setCarregando(false);
    }
    fetchProdutos();
  }, [grupoSelecionado]);

  // Filtragem
  const gruposFiltrados = grupos.filter((g) =>
    g.nome.toLowerCase().includes(filtroGrupo.toLowerCase())
  );
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(filtroProduto.toLowerCase())
  );

  // Função para abrir modal ao clicar no produto
  function handleProdutoClick(produto: any) {
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
    // TODO: obter usuario_id e organizacao_id do contexto/auth
    const usuario_id = null;
    const organizacao_id = null;
    const { error } = await supabase.from("etiquetas").insert({
      produto_id: produtoSelecionado.id,
      quantidade,
      observacoes,
      usuario_id,
      organizacao_id,
      tipo: tipoEtiqueta,
    });
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
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gerar etiquetas</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          {grupoSelecionado ? 
          <p className="text-lg font-medium">Selecione o produto</p> : <p className="text-lg font-medium">Selecione o grupo</p>}
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
                onChange={e => setFiltroGrupo(e.target.value)}
              />
              <ul className="divide-y">
                {gruposFiltrados.map((grupo) => (
                  <li
                    key={grupo.id}
                    className="py-2 cursor-pointer hover:bg-emerald-50 px-2 rounded"
                    onClick={() => setGrupoSelecionado(grupo.id)}
                  >
                    {grupo.nome}
                  </li>
                ))}
                {gruposFiltrados.length === 0 && (
                  <li className="text-gray-400 py-2">Nenhum grupo encontrado.</li>
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
                onChange={e => setFiltroProduto(e.target.value)}
              />
              <ul className="divide-y">
                {produtosFiltrados.map((produto) => (
                  <li
                    key={produto.id}
                    className="py-2 px-2 cursor-pointer hover:bg-emerald-50 rounded"
                    onClick={() => handleProdutoClick(produto)}
                  >
                    {produto.nome}
                  </li>
                ))}
                {produtosFiltrados.length === 0 && (
                  <li className="text-gray-400 py-2">Nenhum produto encontrado.</li>
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
            <h2 className="text-xl font-semibold mb-4">Nova etiqueta para: <span className="font-bold">{produtoSelecionado.nome}</span></h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSalvarEtiqueta();
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de etiqueta</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipoEtiqueta"
                      value="produto_aberto"
                      checked={tipoEtiqueta === "produto_aberto"}
                      onChange={() => setTipoEtiqueta("produto_aberto")}
                    /> Produto Aberto
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipoEtiqueta"
                      value="amostra"
                      checked={tipoEtiqueta === "amostra"}
                      onChange={() => setTipoEtiqueta("amostra")}
                    /> Amostra
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipoEtiqueta"
                      value="descongelo"
                      checked={tipoEtiqueta === "descongelo"}
                      onChange={() => setTipoEtiqueta("descongelo")}
                    /> Descongelo
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered w-full px-3 py-2 border rounded"
                  value={quantidade}
                  onChange={e => setQuantidade(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea
                  className="input input-bordered w-full px-3 py-2 border rounded"
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  rows={2}
                />
              </div>
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