import { ComandaCompleta } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Candy } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: ComandaCompleta | null;
  metodoPagamento: string | null;
}

export default function ReceiptModal({ isOpen, onClose, comanda, metodoPagamento }: ReceiptModalProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateTotal = () => {
    if (!comanda?.itens) return 0;
    return comanda.itens.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "dinheiro":
        return "Dinheiro";
      case "cartao_credito":
        return "Cartão de Crédito";
      case "cartao_debito":
        return "Cartão de Débito";
      case "pix":
        return "PIX";
      default:
        return method;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="no-print">
          <DialogTitle>Comprovante de Venda</DialogTitle>
          <p className="text-sm text-gray-600">Venda processada com sucesso</p>
        </DialogHeader>
        
        {/* Receipt Content */}
        <div className="receipt-container bg-white p-6 border border-gray-200 rounded-lg mb-4" id="comprovante">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <Candy className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">DOCES MARA</h2>
            <p className="text-sm text-gray-600">Rua das Delícias, 123 - Centro</p>
            <p className="text-sm text-gray-600">Tel: (11) 99999-9999</p>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Data:</span>
              <span className="text-sm text-gray-900">
                {formatDate(new Date())}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Comanda:</span>
              <span className="text-sm text-gray-900">#{comanda?.id}</span>
            </div>
            {comanda?.mesa && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Mesa:</span>
                <span className="text-sm text-gray-900">Mesa {comanda.mesa.numero.toString().padStart(2, '0')}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Atendente:</span>
              <span className="text-sm text-gray-900">Sistema PDV</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Itens:</h3>
            <div className="space-y-2">
              {comanda?.itens?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-sm text-gray-900">{item.produto.nome}</span>
                    <div className="text-xs text-gray-600">
                      <span>{parseFloat(item.quantidade)}</span> x{' '}
                      <span>{formatCurrency(parseFloat(item.precoUnitario))}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(parseFloat(item.subtotal))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-semibold text-gray-900">TOTAL:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
            {metodoPagamento && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Forma de Pagamento:</span>
                <span className="text-sm text-gray-900">{getPaymentMethodLabel(metodoPagamento)}</span>
              </div>
            )}
          </div>

          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Obrigado pela preferência!</p>
            <p className="text-xs text-gray-500">Volte sempre!</p>
          </div>
        </div>

        <div className="flex gap-3 no-print">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          <Button onClick={handlePrint} className="flex-1 bg-blue-500 hover:bg-blue-600">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
