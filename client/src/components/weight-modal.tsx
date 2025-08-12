import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProdutoComCategoria } from "@/lib/types";

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: ProdutoComCategoria | null;
  onConfirm: (weight: number) => void;
}

export default function WeightModal({ isOpen, onClose, produto, onConfirm }: WeightModalProps) {
  const [weight, setWeight] = useState<string>("");

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const calculateTotal = () => {
    if (!weight || !produto) return "R$ 0,00";
    const weightNum = parseFloat(weight.replace(",", "."));
    const price = parseFloat(produto.preco);
    return formatPrice((weightNum * price).toString());
  };

  const handleConfirm = () => {
    const weightNum = parseFloat(weight.replace(",", "."));
    if (weightNum > 0) {
      onConfirm(weightNum);
      setWeight("");
      onClose();
    }
  };

  const handleClose = () => {
    setWeight("");
    onClose();
  };

  if (!produto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informar Peso</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{produto.nome}</h3>
            <p className="text-sm text-gray-600">{formatPrice(produto.preco)} / kg</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="text"
              placeholder="0,500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="text-center text-lg"
              autoFocus
            />
            <p className="text-xs text-gray-500 text-center">
              Use vírgula para decimais (ex: 0,5 para 500g)
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-green-600">{calculateTotal()}</p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!weight || parseFloat(weight.replace(",", ".")) <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}