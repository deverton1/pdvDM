import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProdutoComCategoria } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import ProductFormModal from "@/components/product-form-modal";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoComCategoria | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading } = useQuery<ProdutoComCategoria[]>({
    queryKey: [api.getProdutos()],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getProdutos()] });
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case "unitario":
        return "Unitário";
      case "kg":
        return "Kg";
      case "fatia":
        return "Fatia";
      default:
        return unit;
    }
  };

  const getStockBadgeColor = (estoque: string | null) => {
    if (!estoque) return "secondary";
    const stock = parseFloat(estoque);
    if (stock <= 5) return "destructive";
    if (stock <= 20) return "default";
    return "secondary";
  };

  const handleEdit = (produto: ProdutoComCategoria) => {
    setEditingProduct(produto);
    setShowModal(true);
  };

  const handleDelete = (produto: ProdutoComCategoria) => {
    if (confirm(`Tem certeza que deseja remover "${produto.nome}"?`)) {
      deleteMutation.mutate(produto.id);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h2>
          <p className="text-gray-600">Adicione, edite ou remova produtos</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Categoria</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Preço</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Unidade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estoque</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((produto) => (
                  <tr key={produto.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg mr-3 flex items-center justify-center">
                          <span className="text-lg">🧁</span>
                        </div>
                        <span className="font-medium text-gray-900">{produto.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{produto.categoria.nome}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(produto.preco)}</td>
                    <td className="py-3 px-4 text-gray-600">{getUnitLabel(produto.unidadeMedida)}</td>
                    <td className="py-3 px-4">
                      {produto.controlaEstoque && produto.estoqueAtual ? (
                        <Badge variant={getStockBadgeColor(produto.estoqueAtual)}>
                          {produto.estoqueAtual} {getUnitLabel(produto.unidadeMedida).toLowerCase()}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Não controlado</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(produto)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(produto)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        produto={editingProduct}
      />
    </div>
  );
}
