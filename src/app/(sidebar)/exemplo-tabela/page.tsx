'use client'

import { useState } from 'react'
import { GenericTable, BulkAction } from '@/components/ui/generic-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Download, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  departamento: string
  status: 'ativo' | 'inativo' | 'pendente'
  dataAdmissao: string
}

const dadosExemplo: Usuario[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    cargo: 'Desenvolvedor Senior',
    departamento: 'Tecnologia',
    status: 'ativo',
    dataAdmissao: '2023-01-15'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    cargo: 'Designer UI/UX',
    departamento: 'Design',
    status: 'ativo',
    dataAdmissao: '2023-02-20'
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    cargo: 'Analista de Sistemas',
    departamento: 'Tecnologia',
    status: 'pendente',
    dataAdmissao: '2023-12-01'
  },
  {
    id: 4,
    nome: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com',
    cargo: 'Gerente de Projetos',
    departamento: 'Gestão',
    status: 'ativo',
    dataAdmissao: '2022-11-10'
  },
  {
    id: 5,
    nome: 'Carlos Pereira',
    email: 'carlos.pereira@empresa.com',
    cargo: 'Desenvolvedor Junior',
    departamento: 'Tecnologia',
    status: 'inativo',
    dataAdmissao: '2023-06-05'
  },
  {
    id: 6,
    nome: 'Fernanda Lima',
    email: 'fernanda.lima@empresa.com',
    cargo: 'Product Manager',
    departamento: 'Produto',
    status: 'ativo',
    dataAdmissao: '2023-03-15'
  },
  {
    id: 7,
    nome: 'Ricardo Almeida',
    email: 'ricardo.almeida@empresa.com',
    cargo: 'DevOps Engineer',
    departamento: 'Tecnologia',
    status: 'ativo',
    dataAdmissao: '2023-04-01'
  },
  {
    id: 8,
    nome: 'Juliana Rodrigues',
    email: 'juliana.rodrigues@empresa.com',
    cargo: 'QA Analyst',
    departamento: 'Qualidade',
    status: 'ativo',
    dataAdmissao: '2023-05-10'
  },
  {
    id: 9,
    nome: 'Lucas Mendes',
    email: 'lucas.mendes@empresa.com',
    cargo: 'Frontend Developer',
    departamento: 'Tecnologia',
    status: 'pendente',
    dataAdmissao: '2023-07-20'
  },
  {
    id: 10,
    nome: 'Camila Ferreira',
    email: 'camila.ferreira@empresa.com',
    cargo: 'UX Researcher',
    departamento: 'Design',
    status: 'ativo',
    dataAdmissao: '2023-08-05'
  },
  {
    id: 11,
    nome: 'Gabriel Castro',
    email: 'gabriel.castro@empresa.com',
    cargo: 'Backend Developer',
    departamento: 'Tecnologia',
    status: 'ativo',
    dataAdmissao: '2023-09-01'
  },
  {
    id: 12,
    nome: 'Patrícia Souza',
    email: 'patricia.souza@empresa.com',
    cargo: 'Data Analyst',
    departamento: 'Analytics',
    status: 'ativo',
    dataAdmissao: '2023-10-15'
  },
  {
    id: 13,
    nome: 'Diego Martins',
    email: 'diego.martins@empresa.com',
    cargo: 'Mobile Developer',
    departamento: 'Tecnologia',
    status: 'inativo',
    dataAdmissao: '2022-12-01'
  },
  {
    id: 14,
    nome: 'Beatriz Nascimento',
    email: 'beatriz.nascimento@empresa.com',
    cargo: 'Scrum Master',
    departamento: 'Gestão',
    status: 'ativo',
    dataAdmissao: '2023-11-01'
  },
  {
    id: 15,
    nome: 'Thiago Barbosa',
    email: 'thiago.barbosa@empresa.com',
    cargo: 'Security Engineer',
    departamento: 'Segurança',
    status: 'ativo',
    dataAdmissao: '2023-11-20'
  },
  {
    id: 16,
    nome: 'Larissa Santos',
    email: 'larissa.santos@empresa.com',
    cargo: 'Marketing Analyst',
    departamento: 'Marketing',
    status: 'pendente',
    dataAdmissao: '2023-12-10'
  },
  {
    id: 17,
    nome: 'Felipe Oliveira',
    email: 'felipe.oliveira@empresa.com',
    cargo: 'Infrastructure Engineer',
    departamento: 'Tecnologia',
    status: 'ativo',
    dataAdmissao: '2023-12-15'
  },
  {
    id: 18,
    nome: 'Aline Costa',
    email: 'aline.costa@empresa.com',
    cargo: 'Business Analyst',
    departamento: 'Negócios',
    status: 'ativo',
    dataAdmissao: '2024-01-05'
  }
]

export default function ExemploTabelaPage() {
  const [dados, setDados] = useState<Usuario[]>(dadosExemplo)
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const colunas = [
    {
      id: 'nome',
      key: 'nome',
      label: 'Nome',
      accessor: 'nome' as const,
      visible: true,
      fixed: true,
      width: 200,
    },
    {
      id: 'email',
      key: 'email',
      label: 'Email',
      accessor: 'email' as const,
      visible: true,
      fixed: false,
    },
    {
      id: 'cargo',
      key: 'cargo',
      label: 'Cargo',
      accessor: 'cargo' as const,
      visible: true,
      fixed: false,
    },
    {
      id: 'departamento',
      key: 'departamento',
      label: 'Departamento',
      accessor: 'departamento' as const,
      visible: true,
      fixed: false,
    },
    {
      id: 'status',
      key: 'status',
      label: 'Status',
      accessor: 'status' as const,
      visible: true,
      fixed: false,
      render: (value: string) => {
        const colors = {
          ativo: 'bg-green-100 text-green-800',
          inativo: 'bg-red-100 text-red-800',
          pendente: 'bg-yellow-100 text-yellow-800'
        }
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'dataAdmissao',
      key: 'dataAdmissao',
      label: 'Data de Admissão',
      accessor: 'dataAdmissao' as const,
      visible: true,
      fixed: false,
      render: (value: string) => {
        return new Date(value).toLocaleDateString('pt-BR')
      }
    },
  ]

  const acoesBulk: BulkAction[] = [
    {
      label: 'Exportar Selecionados',
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedIds) => {
        console.log('Exportando usuários:', selectedIds)
        alert(`Exportando ${selectedIds.length} usuário(s)`)
      }
    },
    {
      label: 'Editar em Lote',
      icon: <Edit className="h-4 w-4" />,
      onClick: (selectedIds) => {
        console.log('Editando usuários:', selectedIds)
        alert(`Editando ${selectedIds.length} usuário(s)`)
      }
    },
    {
      label: 'Excluir Selecionados',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (selectedIds) => {
        if (confirm(`Deseja realmente excluir ${selectedIds.length} usuário(s)?`)) {
          setDados(prev => prev.filter(user => !selectedIds.includes(user.id)))
          setSelectedRows(new Set())
          alert(`${selectedIds.length} usuário(s) excluído(s)`)
        }
      }
    }
  ]

  const acoesLinha = (usuario: Usuario) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => alert(`Editando ${usuario.nome}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            if (confirm(`Deseja excluir ${usuario.nome}?`)) {
              setDados(prev => prev.filter(u => u.id !== usuario.id))
              alert(`${usuario.nome} foi excluído`)
            }
          }}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exemplo de Tabela Genérica</h1>
        <p className="text-muted-foreground">
          Demonstração completa das funcionalidades da tabela genérica com seleção de linhas e ações em lote.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Disponíveis</CardTitle>
          <CardDescription>
            Esta tabela demonstra todas as funcionalidades implementadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <li>✅ Seleção de colunas com drag-and-drop</li>
            <li>✅ Pesquisa em tempo real</li>
            <li>✅ Paginação avançada</li>
            <li>✅ Seletor de itens por página</li>
            <li>✅ Navegação rápida para páginas</li>
            <li>✅ Colunas fixas e flexíveis</li>
            <li>✅ Renderização customizada</li>
            <li>✅ Ações por linha</li>
            <li>✅ Seleção múltipla de linhas</li>
            <li>✅ Ações em lote</li>
            <li>✅ Estados de loading e empty</li>
            <li>✅ Responsivo</li>
          </ul>
        </CardContent>
      </Card>

      <GenericTable
        title="Gestão de Usuários"
        description="Lista de usuários do sistema com funcionalidades completas"
        columns={colunas}
        data={dados}
        searchable
        searchPlaceholder="Buscar por nome, email, cargo..."
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        getRowId={(row) => row.id}
        bulkActions={acoesBulk}
        rowActions={acoesLinha}
        onRowClick={(usuario) => {
          console.log('Usuário clicado:', usuario)
          // Aqui poderia navegar para página de detalhes
        }}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        showPagination
        showAdvancedPagination
        showItemsPerPageSelector
        showQuickJump
      />

      <Card>
        <CardHeader>
          <CardTitle>Estado da Paginação</CardTitle>
          <CardDescription>Debug das configurações de paginação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Itens por página:</strong> {itemsPerPage}
            </p>
            <p>
              <strong>Total de registros:</strong> {dados.length}
            </p>
            <p>
              <strong>Total de páginas:</strong> {Math.ceil(dados.length / itemsPerPage)}
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setItemsPerPage(5)}
                disabled={itemsPerPage === 5}
              >
                5 por página
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setItemsPerPage(10)}
                disabled={itemsPerPage === 10}
              >
                10 por página
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setItemsPerPage(20)}
                disabled={itemsPerPage === 20}
              >
                20 por página
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado Atual da Seleção</CardTitle>
          <CardDescription>Debug das linhas selecionadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Linhas selecionadas:</strong> {selectedRows.size}
            </p>
            <p>
              <strong>IDs selecionados:</strong> [{Array.from(selectedRows).join(', ')}]
            </p>
            {selectedRows.size > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedRows(new Set())}
              >
                Limpar Seleção
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}