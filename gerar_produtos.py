import os
import re
import json
import torch
import ollama
from sentence_transformers import SentenceTransformer, util

print("Inicializando modelos...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

SEED_FILE = "seed.sql"
OUTPUT_FILE = "seed_novos_produtos.sql"
OLLAMA_MODEL = "llama3"

def extract_groups(sql_content):
    groups = {}
    pattern = r"INSERT INTO public\.groups \(id, name\) VALUES\s+(.*?);"
    matches = re.search(pattern, sql_content, re.DOTALL)
    if matches:
        values_str = matches.group(1)
        values = re.findall(r"\((\d+),\s*'([^']+)'\)", values_str)
        for gid, gname in values:
            groups[int(gid)] = gname
    return groups

def extract_products(sql_content):
    products = []
    # Usando regex para encontrar inserts SEM o campo ID (apenas name e group_id)
    pattern = r"INSERT INTO public\.products \(name, group_id\) VALUES\s+(.*?);"
    
    for match in re.finditer(pattern, sql_content, re.DOTALL):
        values_str = match.group(1)
        # Regex para capturar os pares ('Nome', Grupo)
        values = re.findall(r"\(\s*'([^']+)'\s*,\s*(\d+)\s*\)", values_str)
        for pname, gid in values:
            if not any(exotico in pname.lower() for exotico in ["rã", "avestruz", "javali"]):
                products.append({
                    "name": pname,
                    "group_id": int(gid)
                })
                
    # Caso tenham sobrado inserts antigos com ID soltos no meio do arquivo, tentamos pegar tbm
    pattern_old = r"INSERT INTO public\.products \(id, name, group_id\) VALUES\s+(.*?);"
    for match in re.finditer(pattern_old, sql_content, re.DOTALL):
        values_str = match.group(1)
        values = re.findall(r"\(\d+,\s*'([^']+)',\s*(\d+)\)", values_str)
        for pname, gid in values:
            if not any(exotico in pname.lower() for exotico in ["rã", "avestruz", "javali"]):
                # evita duplicados se ja pegou
                if not any(p['name'] == pname for p in products):
                    products.append({
                        "name": pname,
                        "group_id": int(gid)
                    })
                    
    return products

def generate_new_products(existing_names, count=1000):
    new_products = []
    batch_size = 50 
    batches = count // batch_size
    
    print(f"\n🚀 Gerando {count} novos produtos via OLLAMA ({OLLAMA_MODEL}) em {batches} lotes...")
    
    for i in range(batches):
        print(f"Buscando Lote {i+1}/{batches}...")
        
        historico_recentes = ", ".join(new_products[-30:]) if new_products else "Nenhum ainda."
        
        prompt = f"""
        Você é o comprador-chefe (Gerente de Suprimentos) de um Restaurante ou Cozinha Industrial no Brasil.
        Gere uma lista de exatamente {batch_size} produtos de estoque REALISTAS (ingredientes bases).

        REGRAS RÍGIDAS (ATENÇÃO!):
        1. Retorne APENAS um JSON array de strings. NADA MAIS. Formato ["Produto 1", "Produto 2"].
        2. PROIBIDO: Carnes exóticas (rã, javali, avestruz, pato, codorna, faisão, macaco, tatu, etc).
        3. PROIBIDO: Ingredientes irreais ou absurdos. Use apenas o que se compra em atacados brasileiros comuns e ingredientes de cozinha industrial.
        4. Tente criar nomes sem especificações de embalagem, ex: "Leite de Coco", "Óleo de Soja", "Coxão Mole".
        5. NÃO repita esses produtos: {historico_recentes[:500]}
        6. Não use esse padrão: Castanha-do-Brazil, Leite-Integral
        7. Todos os produtos devem estar em pt-BR
"""
        try:
            response = ollama.chat(model=OLLAMA_MODEL, messages=[
              {'role': 'system', 'content': 'Você é um robô de backend que NUNCA fala. Apenas emite JSON válido.'},
              {'role': 'user', 'content': prompt}
            ])
            
            raw_content = response['message']['content']
            json_match = re.search(r"\[.*\]", raw_content, re.DOTALL)
            
            if json_match:
                batch_products = json.loads(json_match.group(0))
                
                # Filtros Rigorosos "anti-rã"
                termos_proibidos = ["rã", "avestruz", "javali", "pato", "codorna", "faisão", "jacaré", "coelho"]
                
                for p in batch_products:
                    if isinstance(p, str) and len(p) > 2 and p not in existing_names and p not in new_products:
                        # Se não contiver animal exótico
                        if not any(tp in p.lower() for tp in termos_proibidos):
                            new_products.append(p)
                        
                print(f"  ✅ Lote {i+1} obteve {len(batch_products)} nomes. Total: {len(new_products)}")
            else:
                print(f"  ❌ Lote {i+1} falhou. Não consegui extrair o JSON.")
                
        except Exception as e:
            print(f"  ❌ Erro no lote {i+1}: {e}")
            break
            
    return list(set(new_products))

def map_and_correct_products(products_list, groups_dict):
    print("\n🧠 Calculando similaridade semântica dos grupos...")
    group_ids = list(groups_dict.keys())
    group_names = [groups_dict[gid] for gid in group_ids]
    
    group_embeddings = embedder.encode(group_names, convert_to_tensor=True)
    mapped_products = []
    
    print("🧠 Categorizando produtos (pode demorar alguns segundos)...")
    product_names = [p["name"] if isinstance(p, dict) else p for p in products_list]
    
    product_embeddings = embedder.encode(product_names, convert_to_tensor=True)
    cosine_scores = util.cos_sim(product_embeddings, group_embeddings)
    
    new_group_threshold = 0.25 
    
    for i, product_name in enumerate(product_names):
        scores = cosine_scores[i]
        best_score_val, best_idx = torch.max(scores, dim=0)
        
        if best_score_val.item() < new_group_threshold:
            besg_group_id = 11 
        else:
            besg_group_id = group_ids[best_idx.item()]
            
        mapped_products.append({
            "name": product_name.strip(),
            "group_id": besg_group_id
        })
        
    return mapped_products

def run():
    groups = {}
    existing_names = []
    
    if os.path.exists(SEED_FILE):
        print(f"📖 Lendo produtos existentes de {SEED_FILE}...")
        with open(SEED_FILE, "r", encoding="utf-8") as f:
            sql_content = f.read()
        groups = extract_groups(sql_content)
        existing_products = extract_products(sql_content)
        existing_names = [p["name"] for p in existing_products]
    else:
        print(f"⚠️ Arquivo {SEED_FILE} não encontrado. Iniciando sem produtos base.")
        # Grupos padrão caso o seed não exista (para o mapeador não falhar)
        groups = {
            1: 'Cereais', 2: 'Verduras', 3: 'Frutos', 4: 'Gorduras', 5: 'Pescados',
            6: 'Carnes', 7: 'Leite', 8: 'Ovos', 9: 'Açúcares', 10: 'Miscelâneas',
            11: 'Industrializados', 12: 'Preparados', 13: 'Leguminosas', 
            14: 'Nozes e sementes', 15: 'Frutas', 16: 'Bebidas', 
            17: 'Conservas', 18: 'Congelados', 19: 'Especiarias', 20: 'Molhos'
        }

    print(f"Grupos carregados: {len(groups)}")
    print(f"Produtos atuais conhecidos: {len(existing_names)}")

    # Geração!
    new_products_names = generate_new_products(existing_names, count=1000)
    
    all_products_to_map = existing_names + new_products_names
    mapped_results = map_and_correct_products(all_products_to_map, groups)
    
    # Prepara statements SQL (SEM ID MANUAL, DEIXANDO O POSTGRES CUIDAR DISSO)
    print(f"\n💾 Gerando arquivo SQL final com {len(mapped_results)} produtos...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("-- ===== TODOS OS PRODUTOS (CORRIGIDOS E NOVOS - OLLAMA + MINILM) =====\n")
        out.write("-- Observação: Não inserimos o ID manualmente (deixamos a cargo da sequence do serial no Banco)\n")
        
        # O insert agora é apenas de Tabela (nome, group_id)
        out.write("INSERT INTO public.products (name, group_id) VALUES \n")
        
        values = []
        for item in mapped_results:
            pname = item["name"].replace("'", "''") 
            gid = item["group_id"]
            values.append(f"('{pname}', {gid})")
        
        batch_size = 100
        for i in range(0, len(values), batch_size):
            batch = values[i:i+batch_size]
            out.write(",\n".join(batch))
            if i + batch_size >= len(values):
                out.write(";\n")
            else:
                out.write(";\n\nINSERT INTO public.products (name, group_id) VALUES \n")

    print(f"✅ SUCESSO! Dados salvos em {OUTPUT_FILE}")

if __name__ == "__main__":
    run()
