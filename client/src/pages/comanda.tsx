import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProdutoComCategoria, ComandaCompleta } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import OrderPanel from "@/components/order-panel";
import ProductGrid from "@/components/product-grid";
import WeightModal from "@/components/weight-modal";
import PaymentModal from "@/components/payment-modal";
import ReceiptModal from "@/components/receipt-modal";
import { useToast } from "@/hooks/use-toast";

export default function Comanda() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const [comandaId, setComandaId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProdutoComCategoria | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar dados da comanda quando comandaId estiver disponível
  const { data: comanda, isLoading: comandaLoading } = useQuery<ComandaCompleta>({
    queryKey: [api.getComanda(comandaId!)],
    enabled: !!comandaId,
  });

  // Parse parameters - nova abordagem usando route params e query params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const mesaId = searchParams.get('mesa');
  const isNew = searchParams.get('new') === 'true';
  const isAvulsa = params.type === 'avulsa';
  const existingComandaId = searchParams.get('comanda');

  // Se há um comandaId existente na URL, usar ele diretamente
  useEffect(() => {
    if (existingComandaId && !comandaId) {
      setComandaId(parseInt(existingComandaId));
    }
  }, [existingComandaId, comandaId]);
  


  const createComandaMutation = useMutation({
    mutationFn: (data: any) => api.createComanda(data),
    onSuccess: (response: any) => {
      setComandaId(response.id);
      queryClient.invalidateQueries({ queryKey: [api.getComanda(response.id)] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/mesas"] });
      toast({
        title: "Sucesso",
        description: isAvulsa ? "Nova venda avulsa iniciada" : `Comanda aberta para Mesa ${mesaId?.padStart(2, '0')}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Não foi possível abrir a comanda",
        variant: "destructive",
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ produtoId, quantidade, comandaId: mutationComandaId }: { produtoId: number; quantidade: number; comandaId: number }) =>
      api.addItemComanda(mutationComandaId, { produtoId, quantidade }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.getComanda(variables.comandaId)] });
      toast({
        title: "Sucesso",
        description: "Item adicionado à comanda",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item",
        variant: "destructive",
      });
    },
  });

  // Flag para controlar se a comanda já foi criada
  const [comandaCriada, setComandaCriada] = useState(false);

  useEffect(() => {
    // Só criar nova comanda se não há uma existente e é realmente nova
    if ((isNew || isAvulsa) && !comandaId && !existingComandaId && !createComandaMutation.isPending && !comandaCriada) {
      setComandaCriada(true);
      const comandaData = isAvulsa ? {} : { mesaId: parseInt(mesaId!) };
      createComandaMutation.mutate(comandaData);
    }
  }, [isNew, isAvulsa, mesaId, existingComandaId]);

  // Sincronizar comandaId com dados da mutation
  useEffect(() => {
    if (createComandaMutation.data?.id && !comandaId) {
      setComandaId(createComandaMutation.data.id);
    }
  }, [createComandaMutation.data, comandaId]);

  // Invalidar queries quando comandaId estiver disponível
  useEffect(() => {
    if (comandaId) {
      queryClient.invalidateQueries({ queryKey: [api.getComanda(comandaId)] });
    }
  }, [comandaId, queryClient]);

  const handleProductClick = (produto: ProdutoComCategoria) => {
    // Verificar se a comanda existe (usando dados da mutation se disponível)
    const currentComandaId = comandaId || createComandaMutation.data?.id;
    
    // Se a comanda ainda está sendo criada, aguardar
    if (createComandaMutation.isPending) {
      toast({
        title: "Aguarde",
        description: "Criando comanda, tente novamente em instantes",
      });
      return;
    }

    // Se não há comandaId e a mutation falhou
    if (!currentComandaId && createComandaMutation.isError) {
      toast({
        title: "Erro", 
        description: "Comanda não foi criada corretamente",
        variant: "destructive",
      });
      return;
    }

    // Se não há comandaId e não está pendente nem com erro, aguardar um pouco mais
    if (!currentComandaId) {
      toast({
        title: "Aguarde",
        description: "Finalizando criação da comanda...",
      });
      // Tentar novamente após um breve delay
      setTimeout(() => {
        if (comandaId || createComandaMutation.data?.id) {
          handleProductClick(produto);
        }
      }, 500);
      return;
    }

    // Se já está adicionando outro item, aguardar
    if (addItemMutation.isPending) {
      toast({
        title: "Aguarde",
        description: "Adicionando item anterior, tente novamente",
      });
      return;
    }

    // Usar o comandaId atualizado para a operação
    const idToUse = currentComandaId;
    
    setSelectedProduct(produto);
    
    if (produto.unidadeMedida === "kg") {
      setShowWeightModal(true);
    } else {
      addItemMutation.mutate({ produtoId: produto.id, quantidade: 1, comandaId: idToUse });
    }
  };

  const handleWeightConfirm = (weight: number) => {
    const currentComandaId = comandaId || createComandaMutation.data?.id;
    if (selectedProduct && currentComandaId) {
      addItemMutation.mutate({ produtoId: selectedProduct.id, quantidade: weight, comandaId: currentComandaId });
    }
    setShowWeightModal(false);
    setSelectedProduct(null);
  };

  const handleCloseOrder = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (vendaId: number) => {
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  const handleReceiptClose = () => {
    setShowReceiptModal(false);
    setLocation("/"); // Return to dashboard
  };

  const getTitle = () => {
    if (isAvulsa) return "Venda Avulsa";
    if (mesaId) return `Mesa ${mesaId.padStart(2, '0')}`;
    return "Comanda";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          <p className="text-gray-600">Gerencie itens da comanda</p>
        </div>
        <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Panel */}
        <div className="lg:col-span-1">
          {comandaId ? (
            <OrderPanel comandaId={comandaId} onCloseOrder={handleCloseOrder} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                {createComandaMutation.isPending ? (
                  <p className="text-gray-500">Criando comanda...</p>
                ) : (
                  <p className="text-gray-500">Erro ao criar comanda</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-2">
          <ProductGrid onProductClick={handleProductClick} />
        </div>
      </div>

      {/* Modals */}
      <WeightModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        produto={selectedProduct}
        onConfirm={handleWeightConfirm}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        comanda={comanda || null}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={handleReceiptClose}
        comanda={comanda || null}
        metodoPagamento={paymentMethod}
      />
    </div>
  );
}
