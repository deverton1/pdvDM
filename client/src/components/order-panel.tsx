import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ComandaCompleta } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ScanBarcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const updateQuantidadeMutation = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: number; quantidade: number }) =>
      api.updateItemQuantidade(itemId, quantidade),
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

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => api.removeItem(itemId),
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

  const fecharComandaMutation = useMutation({
    mutationFn: () => api.fecharComanda(comandaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getComanda(comandaId)] });
      onCloseOrder();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível fechar a comanda",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (itemId: number, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : Math.max(0.1, currentQuantity - 1);
    updateQuantidadeMutation.mutate({ itemId, quantidade: newQuantity });
  };

  const calculateTotal = () => {
    if (!comanda?.itens) return 0;
    return comanda.itens.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTitle = () => {
    if (!comanda) return "Carregando...";
    if (comanda.mesa) return `Mesa ${comanda.mesa.numero.toString().padStart(2, '0')} - Comanda #${comanda.id}`;
    return `Venda Avulsa - Comanda #${comanda.id}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Itens da Comanda</h3>
        <span className="text-sm text-gray-500">#{comanda?.id}</span>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700">{getTitle()}</h4>
      </div>

      <div className="space-y-3 mb-6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {comanda?.itens && comanda.itens.length > 0 ? (
          comanda.itens.map((item) => {
            const quantidade = parseFloat(item.quantidade);
            const unitLabel = item.produto.unidadeMedida === 'kg' ? 'kg' : 
                             item.produto.unidadeMedida === 'fatia' ? 'fatia' : 'unid';
            
            return (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.produto.nome}</p>
                  <div className="flex items-center mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0"
                      onClick={() => handleQuantityChange(item.id, quantidade, false)}
                      disabled={updateQuantidadeMutation.isPending}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="mx-2 text-sm font-medium min-w-[2rem] text-center">
                      {quantidade}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0"
                      onClick={() => handleQuantityChange(item.id, quantidade, true)}
                      disabled={updateQuantidadeMutation.isPending}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="ml-2 text-xs text-gray-500">{unitLabel}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(parseFloat(item.subtotal))}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-red-600 hover:text-red-800 p-0 h-auto"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum item adicionado</p>
            <p className="text-sm">Clique nos produtos para adicionar</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-900">Total:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(calculateTotal())}
          </span>
        </div>
        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600"
          onClick={() => fecharComandaMutation.mutate()}
          disabled={!comanda?.itens?.length || fecharComandaMutation.isPending}
        >
          <ScanBarcode className="w-4 h-4 mr-2" />
          Fechar Conta
        </Button>
      </div>
    </div>
  );
}
