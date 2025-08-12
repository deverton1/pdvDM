import { apiRequest } from "@/lib/queryClient";

export const api = {
  // Mesas
  getMesas: () => "/api/pos/mesas",
  updateMesaStatus: (id: number, status: string) => 
    apiRequest("PUT", `/api/pos/mesas/${id}/status`, { status }),

  // Produtos
  getProdutos: () => "/api/pos/produtos",
  createProduto: (data: any) => apiRequest("POST", "/api/pos/produtos", data),
  updateProduto: (id: number, data: any) => apiRequest("PUT", `/api/pos/produtos/${id}`, data),
  deleteProduto: (id: number) => apiRequest("DELETE", `/api/pos/produtos/${id}`),

  // Categorias
  getCategorias: () => "/api/pos/categorias",
  createCategoria: (data: any) => apiRequest("POST", "/api/pos/categorias", data),

  // Comandas
  createComanda: (data: any) => apiRequest("POST", "/api/pos/comandas", data),
  getComanda: (id: number) => `/api/pos/comandas/${id}`,
  getComandaByMesa: (mesaId: number) => `/api/pos/comandas/mesa/${mesaId}`,
  fecharComanda: (id: number) => apiRequest("PUT", `/api/pos/comandas/${id}/fechar`),
  addItemComanda: (comandaId: number, data: any) => 
    apiRequest("POST", `/api/pos/comandas/${comandaId}/itens`, data),
  updateItemQuantidade: (itemId: number, quantidade: number) =>
    apiRequest("PUT", `/api/pos/itens/${itemId}`, { quantidade }),
  removeItem: (itemId: number) => apiRequest("DELETE", `/api/pos/itens/${itemId}`),

  // Vendas
  createVenda: (data: any) => apiRequest("POST", "/api/pos/vendas", data),

  // Relatórios
  getRelatorioVendas: (de: string, ate: string) => 
    `/api/pos/relatorios/vendas?de=${de}&ate=${ate}`,
};
