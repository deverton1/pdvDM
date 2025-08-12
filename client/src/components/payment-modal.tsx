import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ComandaCompleta } from "@/lib/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: ComandaCompleta | null;
  onPaymentSuccess: (vendaId: number) => void;
}

type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';

export default function PaymentModal({ isOpen, onClose, comanda, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashAmount, setCashAmount] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: (data: { comandaId: number; metodoPagamento: PaymentMethod }) => 
      api.createVenda(data),
    onSuccess: (response: any) => {
      toast({
        title: "Pagamento Processado",
        description: "Venda finalizada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/mesas"] });
      onPaymentSuccess(response.id);
    },
    onError: () => {
      toast({
        title: "Erro no Pagamento",
        description: "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
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

  const calculateChange = () => {
    if (!cashAmount || selectedMethod !== 'dinheiro') return 0;
    const cash = parseFloat(cashAmount.replace(",", "."));
    const total = calculateTotal();
    return Math.max(0, cash - total);
  };

  const handlePayment = () => {
    if (!selectedMethod || !comanda) return;

    if (selectedMethod === 'dinheiro') {
      const cash = parseFloat(cashAmount.replace(",", "."));
      const total = calculateTotal();
      if (cash < total) {
        toast({
          title: "Valor Insuficiente",
          description: "O valor em dinheiro deve ser maior ou igual ao total",
          variant: "destructive",
        });
        return;
      }
    }

    paymentMutation.mutate({
      comandaId: comanda.id,
      metodoPagamento: selectedMethod,
    });
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setCashAmount("");
    onClose();
  };

  const paymentMethods = [
    {
      id: 'dinheiro' as PaymentMethod,
      name: 'Dinheiro',
      icon: Banknote,
      color: 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200',
    },
    {
      id: 'cartao_credito' as PaymentMethod,
      name: 'Cartão de Crédito',
      icon: CreditCard,
      color: 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200',
    },
    {
      id: 'cartao_debito' as PaymentMethod,
      name: 'Cartão de Débito',
      icon: DollarSign,
      color: 'bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200',
    },
    {
      id: 'pix' as PaymentMethod,
      name: 'PIX',
      icon: Smartphone,
      color: 'bg-orange-100 border-orange-200 text-orange-800 hover:bg-orange-200',
    },
  ];

  if (!comanda) return null;

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Total */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total a Pagar</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(total)}</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label>Método de Pagamento</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    variant="outline"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                      selectedMethod === method.id 
                        ? method.color 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{method.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Cash Input */}
          {selectedMethod === 'dinheiro' && (
            <div className="space-y-3">
              <Label htmlFor="cash">Valor Recebido</Label>
              <Input
                id="cash"
                type="text"
                placeholder="0,00"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="text-center text-lg"
              />
              {cashAmount && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Troco</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatPrice(calculateChange())}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={
                !selectedMethod || 
                paymentMutation.isPending ||
                (selectedMethod === 'dinheiro' && (!cashAmount || parseFloat(cashAmount.replace(",", ".")) < total))
              }
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {paymentMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}