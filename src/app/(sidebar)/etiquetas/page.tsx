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
                    className="py-2 px-2"
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
    </div>
  );
}