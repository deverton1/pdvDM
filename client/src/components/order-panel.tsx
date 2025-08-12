import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ComandaCompleta } from "@/lib/types";

interface OrderPanelProps {
  comandaId: number;
  onCloseOrder: () => void;
}

export default function OrderPanel({ comandaId, onCloseOrder }: OrderPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comanda, isLoading } = useQuery<ComandaCompleta>({
    queryKey: [api.getComanda(comandaId)],
    enabled: !!comandaId,
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => api.removeItemComanda(comandaId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getComanda(comandaId)] });
      toast({
        title: "Sucesso",
        description: "Item removido da comanda",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: number; quantidade: number }) => 
      api.updateItemComanda(comandaId, itemId, { quantidade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getComanda(comandaId)] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade",
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

  const calculateTotal = () => {
    if (!comanda?.itens) return 0;
    return comanda.itens.reduce((total, item) => {
      return total + (parseFloat(item.produto.preco) * item.quantidade);
    }, 0);
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(itemId);
    } else {
      updateQuantityMutation.mutate({ itemId, quantidade: newQuantity });
    }
  };

  const getComandaTitle = () => {
    if (comanda?.mesaId) {
      return `Mesa ${comanda.mesaId.toString().padStart(2, '0')}`;
    }
    return "Venda Avulsa";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comanda) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comanda não encontrada</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{getComandaTitle()}</CardTitle>
        <p className="text-sm text-gray-600">Comanda #{comandaId}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {comanda.itens && comanda.itens.length > 0 ? (
            comanda.itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.produto.nome}</h4>
                  <p className="text-xs text-gray-600">
                    {formatPrice(item.produto.preco)} {item.produto.unidadeMedida === 'kg' ? '/ kg' : '/ un'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.id, item.quantidade - 1)}
                    disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantidade}{item.produto.unidadeMedida === 'kg' ? 'kg' : ''}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(item.id, item.quantidade + 1)}
                    disabled={updateQuantityMutation.isPending}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum item na comanda</p>
              <p className="text-sm">Adicione produtos clicando neles ao lado</p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              {formatPrice(calculateTotal().toString())}
            </span>
          </div>
        </div>

        {/* Close Order Button */}
        {comanda.itens && comanda.itens.length > 0 && (
          <Button 
            onClick={onCloseOrder}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Fechar Conta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}