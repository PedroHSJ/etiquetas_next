export interface Label {
  id: number;
  productId: number;
  quantity: number;
  printDate: string;
  userId: string;
  organizationId: string;
  status: string;
  notes: string;
  createdAt: string;
  product?: { name: string };
}
