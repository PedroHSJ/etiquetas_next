// =============================================================================
// TIPOS DE COMPONENTES E CONTEXTOS
// =============================================================================

// Contextos da aplicação
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Tipo de usuário do Supabase
export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface NavigationContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
}

export interface Organization {
  id: string;
  nome: string;
  tipo: string;
}

export interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  setActiveOrganization: (org: Organization | null) => void;
  loading: boolean;
  error: string | null;
  refreshOrganizations: () => Promise<void>;
}

export interface ProfileContextType {
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  setActiveProfile: (profile: UserProfile | null) => void;
  refreshProfiles: () => Promise<void>;
  isLoading: boolean;
}

// Importar de types principais
interface UserProfile {
  id: string;
  usuario_id: string;
  organizacao_id: string;
  perfil_id: string;
  ativo: boolean;
  created_at: string;
  organizacao?: { nome: string };
  perfil?: { nome: string; descricao: string };
}

export interface ProfileProviderProps {
  children: React.ReactNode;
}

// Tipos de notificações
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  timestamp: number;
  autoClose?: boolean;
  duration?: number;
}

// Tipos de componentes de formulário
export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
}

// Import types from etiquetas
import { LabelField, LabelTemplate } from "./etiquetas";
import { Product } from "./stock/product";

// Tipos para componentes drag and drop
export interface DraggableFieldProps {
  field: LabelField;
  isSelected?: boolean;
  onSelect?: (field: LabelField) => void;
  onUpdate?: (field: LabelField) => void;
  isEditing?: boolean;
  products?: Product[];
  labelType?: string;
}

// Tipos para componentes de canvas
export interface LabelCanvasProps {
  template: LabelTemplate;
  onFieldAdd?: (field: LabelField) => void;
  onFieldUpdate?: (field: LabelField) => void;
  onFieldSelect?: (field: LabelField) => void;
  selectedField?: LabelField;
  isPreviewMode?: boolean;
}

// Tipos para componentes de editor
export interface LabelEditorProps {
  templateId?: string;
  onSave?: (template: LabelTemplate) => void;
  onCancel?: () => void;
}

// Tipos para seletores de produtos
export interface ProductSelectorProps {
  products: Product[];
  selectedProduct?: Product;
  onProductSelect: (product: Product) => void;
  placeholder?: string;
}

// Import organization types
import { OrganizationType } from "./organization";

// Tipos para componentes de organização
export interface OrganizationDetailsProps {
  organization: OrganizationType;
  onEdit?: () => void;
}

export interface OrganizationSettingsProps {
  organizationId: string;
}

// Tipos para gerenciamento de convites
export interface ConviteManagerProps {
  organizationId: string;
}
