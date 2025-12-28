import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { cep } = await request.json();
    if (!cep) {
      return NextResponse.json({ error: "CEP is required" }, { status: 400 });
    }
    // Use anon supabase-js client for server-side RPC
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // Busca dados do CEP na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch CEP" },
        { status: 500 }
      );
    }
    const cepData = await response.json();
    if (cepData.erro) {
      return NextResponse.json({ error: "CEP not found" }, { status: 404 });
    }
    // Chama a função RPC do Supabase
    const { data, error } = await supabase.rpc("find_or_create_city", {
      p_name: cepData.localidade,
      p_state_code: cepData.uf,
      p_ibge_code: cepData.ibge || null,
      p_zip_code: cep,
      p_latitude: null,
      p_longitude: null,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }
    // Normaliza resposta
    const normalized = {
      id: data.id,
      nome: data.name,
      estado: {
        id: data.state.id,
        codigo: data.state.code,
        nome: data.state.name,
      },
    };
    return NextResponse.json(normalized);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
