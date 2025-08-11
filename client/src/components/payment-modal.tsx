import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ComandaCompleta } from "@/lib/types";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: ComandaCompleta | null;
  onPaymentSuccess: (vendaId: number) => void;
}

type PaymentMethod = "dinheiro" | "cartao_credito" | "cartao_debito" | "pix";

export default function PaymentModal({ isOpen, onClose, comanda, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [valorRecebido, setValorRecebido] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createVendaMutation = useMutation({
    mutationFn: (data: any) => api.createVenda(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/mesas"] });
      toast({
        title: "Sucesso",
        description: "Pagamento processado com sucesso",
      });
      onPaymentSuccess(response.id);
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotal = () => {
    if (!comanda?.itens) return 0;
    return comanda.itens.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  };

  const calculateTroco = () => {
    if (!valorRecebido || selectedMethod !== "dinheiro") return 0;
    const recebido = parseFloat(valorRecebido);
    const total = calculateTotal();
    return Math.max(0, recebido - total);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "dinheiro":
        return <Banknote className="w-5 h-5" />;
      case "cartao_credito":
      case "cartao_debito":
        return <CreditCard className="w-5 h-5" />;
      case "pix":
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const getMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case "dinheiro":
        return "text-emerald-600 bg-emerald-100";
      case "cartao_credito":
        return "text-blue-600 bg-blue-100";
      case "cartao_debito":
        return "text-purple-600 bg-purple-100";
      case "pix":
        return "text-teal-600 bg-teal-100";
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "dinheiro":
        return "Dinheiro";
      case "cartao_credito":
        return "Cartão de Crédito";
      case "cartao_debito":
        return "Cartão de Débito";
      case "pix":
        return "PIX";
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedMethod || !comanda) return;

    const total = calculateTotal();
    let vendaData: any = {
      comandaId: comanda.id,
      metodoPagamento: selectedMethod,
      valorTotal: total.toFixed(2),
    };

    if (selectedMethod === "dinheiro") {
      const recebido = parseFloat(valorRecebido);
      if (!recebido || recebido < total) {
        toast({
          title: "Erro",
          description: "Valor recebido deve ser maior ou igual ao total",
          variant: "destructive",
        });
        return;
      }
      vendaData.valorRecebido = recebido.toFixed(2);
      vendaData.troco = calculateTroco().toFixed(2);
    }

    createVendaMutation.mutate(vendaData);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setValorRecebido("");
    onClose();
  };

  const canConfirm = selectedMethod && (
    selectedMethod !== "dinheiro" || 
    (valorRecebido && parseFloat(valorRecebido) >= calculateTotal())
  );

  const paymentMethods: PaymentMethod[] = ["dinheiro", "cartao_credito", "cartao_debito", "pix"];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processar Pagamento</DialogTitle>
          <p className="text-sm text-gray-500">Selecione o método de pagamento e confirme a transação</p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total a pagar</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</p>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <Button
                key={method}
                variant="outline"
                className={`w-full p-3 h-auto justify-start ${
                  selectedMethod === method ? "border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => setSelectedMethod(method)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getMethodColor(method)}`}>
                  {getMethodIcon(method)}
                </div>
                <span className="font-medium text-gray-900">{getMethodLabel(method)}</span>
              </Button>
            ))}
          </div>

          {selectedMethod === "dinheiro" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="valorRecebido">Valor Recebido</Label>
                <Input
                  id="valorRecebido"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Troco:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(calculateTroco())}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPayment} 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={!canConfirm || createVendaMutation.isPending}
            >
              Confirmar Pagamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
