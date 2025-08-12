import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ProductFormModal from "@/components/product-form-modal";
import type { ProdutoComCategoria } from "@/lib/types";

export default function Products() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoComCategoria | null>(null);

  const { data: produtos = [], isLoading } = useQuery<ProdutoComCategoria[]>({
    queryKey: [api.getProdutos()],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getProdutos()] });
      toast({
        title: "Sucesso",
        description: "Produto deletado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o produto",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const getUnitLabel = (unidade: string) => {
    switch (unidade) {
      case 'kg': return 'Por kg';
      case 'fatia': return 'Por fatia';
      default: return 'Por unidade';
    }
  };

  const handleEdit = (produto: ProdutoComCategoria) => {
    setEditingProduct(produto);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h2>
          <p className="text-gray-600">Adicione, edite ou remova produtos do cardápio</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {produtos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.categoria?.nome || 'Sem categoria'}</TableCell>
                    <TableCell>{formatPrice(produto.preco)}</TableCell>
                    <TableCell>{getUnitLabel(produto.unidadeMedida)}</TableCell>
                    <TableCell>
                      {produto.controlaEstoque 
                        ? produto.estoqueAtual || '0'
                        : 'Não controlado'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(produto)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(produto.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                <Plus className="w-full h-full" />
              </div>
              <p className="text-lg font-medium">Nenhum produto cadastrado</p>
              <p className="text-sm mb-4">Adicione produtos para começar a usar o sistema</p>
              <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        produto={editingProduct}
      />
    </div>
  );
}