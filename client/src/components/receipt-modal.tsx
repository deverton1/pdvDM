import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Check } from "lucide-react";
import type { ComandaCompleta } from "@/lib/types";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: ComandaCompleta | null;
  metodoPagamento: string | null;
}

export default function ReceiptModal({ isOpen, onClose, comanda, metodoPagamento }: ReceiptModalProps) {
  
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

  const getPaymentMethodName = (method: string | null) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return 'Não informado';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!comanda) return null;

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Venda Finalizada</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Receipt Content */}
          <div id="receipt" className="space-y-4 print:p-4">
            <div className="text-center space-y-2 print:space-y-1">
              <h2 className="text-xl font-bold print:text-lg">DOCES MARA</h2>
              <p className="text-sm text-gray-600 print:text-black">
                Sistema PDV - Comprovante Não Fiscal
              </p>
              <p className="text-xs text-gray-500 print:text-black">
                {new Date().toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="border-t border-b py-2 print:border-black">
              <p className="text-sm font-medium">
                {comanda.mesaId ? `Mesa ${comanda.mesaId.toString().padStart(2, '0')}` : 'Venda Avulsa'}
              </p>
              <p className="text-xs text-gray-600 print:text-black">
                Comanda #{comanda.id}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {comanda.itens?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.produto.nome}</p>
                    <p className="text-xs text-gray-600 print:text-black">
                      {item.quantidade}{item.produto.unidadeMedida === 'kg' ? 'kg' : ' un'} x {formatPrice(item.produto.preco)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice((parseFloat(item.produto.preco) * item.quantidade).toString())}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 print:border-black">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-sm text-gray-600 print:text-black mt-1">
                Pagamento: {getPaymentMethodName(metodoPagamento)}
              </p>
            </div>

            <div className="text-center text-xs text-gray-500 print:text-black print:mt-4">
              <p>Obrigado pela preferência!</p>
              <p>Volte sempre!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 print:hidden">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Finalizar
            </Button>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt, #receipt * {
              visibility: visible;
            }
            #receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}