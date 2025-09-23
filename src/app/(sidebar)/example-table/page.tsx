"use client";

import { useState } from "react";
import { GenericTable, GenericTableColumn } from "@/components/ui/generic-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Dados de exemplo
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  department: string;
  lastLogin: Date;
  createdAt: Date;
  salary: number;
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    status: 'active',
    role: 'Desenvolvedor',
    department: 'TI',
    lastLogin: new Date('2024-03-20T10:30:00'),
    createdAt: new Date('2023-01-15T09:00:00'),
    salary: 8500,
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    status: 'active',
    role: 'Designer',
    department: 'Marketing',
    lastLogin: new Date('2024-03-19T14:20:00'),
    createdAt: new Date('2023-02-10T08:30:00'),
    salary: 7200,
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@empresa.com',
    status: 'inactive',
    role: 'Gerente',
    department: 'Vendas',
    lastLogin: new Date('2024-03-10T16:45:00'),
    createdAt: new Date('2022-11-05T10:15:00'),
    salary: 12000,
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@empresa.com',
    status: 'pending',
    role: 'Analista',
    department: 'RH',
    lastLogin: new Date('2024-03-21T09:10:00'),
    createdAt: new Date('2024-03-01T14:00:00'),
    salary: 6500,
  },
  {
    id: '5',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@empresa.com',
    status: 'active',
    role: 'Desenvolvedor Senior',
    department: 'TI',
    lastLogin: new Date('2024-03-21T11:30:00'),
    createdAt: new Date('2022-08-20T09:45:00'),
    salary: 11500,
  },
];

export default function GenericTableExamplePage() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [loading, setLoading] = useState(false);

  // Definir colunas da tabela
  const columns: GenericTableColumn[] = [
    {
      id: 'name',
      key: 'name',
      label: 'Nome',
      accessor: 'name',
      visible: true,
      fixed: true, // Coluna fixa
      width: 200,
    },
    {
      id: 'email',
      key: 'email',
      label: 'Email',
      accessor: 'email',
      visible: true,
      width: 250,
    },
    {
      id: 'status',
      key: 'status',
      label: 'Status',
      accessor: 'status',
      visible: true,
      width: 120,
      render: (value: string) => {
        const variants = {
          active: { label: 'Ativo', variant: 'default' as const },
          inactive: { label: 'Inativo', variant: 'secondary' as const },
          pending: { label: 'Pendente', variant: 'outline' as const },
        };
        const config = variants[value as keyof typeof variants] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'role',
      key: 'role',
      label: 'Cargo',
      accessor: 'role',
      visible: true,
      width: 180,
    },
    {
      id: 'department',
      key: 'department',
      label: 'Departamento',
      accessor: 'department',
      visible: true,
      width: 150,
    },
    {
      id: 'salary',
      key: 'salary',
      label: 'Salário',
      accessor: 'salary',
      visible: false, // Inicialmente oculta
      width: 120,
      render: (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      },
    },
    {
      id: 'lastLogin',
      key: 'lastLogin',
      label: 'Último Acesso',
      accessor: 'lastLogin',
      visible: true,
      width: 160,
      render: (value: Date) => {
        return format(value, 'dd/MM/yyyy HH:mm', { locale: ptBR });
      },
    },
    {
      id: 'createdAt',
      key: 'createdAt',
      label: 'Data de Criação',
      accessor: 'createdAt',
      visible: false, // Inicialmente oculta
      width: 160,
      render: (value: Date) => {
        return format(value, 'dd/MM/yyyy', { locale: ptBR });
      },
    },
  ];

  const handleRowClick = (user: User, index: number) => {
    console.log('Linha clicada:', user, 'Índice:', index);
  };

  const renderRowActions = (user: User, index: number) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              console.log('Deletar usuário:', user.id);
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h16V5H4zm2 2h12v2H6V7zm0 4h12v2H6v-2zm0 4h12v2H6v-2z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Tabela Genérica</h1>
          <p className="text-muted-foreground">Exemplo de uso da tabela genérica com colunas configuráveis</p>
        </div>
      </div>

      {/* Tabela */}
      <GenericTable
        title="Lista de Usuários"
        description="Gerencie usuários do sistema com colunas configuráveis"
        columns={columns}
        data={users}
        loading={loading}
        searchable={true}
        searchPlaceholder="Pesquisar por nome, email, cargo..."
        itemsPerPage={10}
        showPagination={true}
        onRowClick={handleRowClick}
        rowActions={renderRowActions}
        className="w-full"
      />

      {/* Controles de exemplo */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          Simular Carregamento
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const newUser: User = {
              id: String(users.length + 1),
              name: `Usuário ${users.length + 1}`,
              email: `usuario${users.length + 1}@empresa.com`,
              status: 'pending',
              role: 'Novo Funcionário',
              department: 'Geral',
              lastLogin: new Date(),
              createdAt: new Date(),
              salary: 5000,
            };
            setUsers([...users, newUser]);
          }}
        >
          Adicionar Usuário
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            if (users.length > 0) {
              setUsers(users.slice(0, -1));
            }
          }}
        >
          Remover Último
        </Button>
      </div>
    </div>
  );
}