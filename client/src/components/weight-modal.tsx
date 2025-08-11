import { useState } from "react";
import { ProdutoComCategoria } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto: ProdutoComCategoria | null;
  onConfirm: (weight: number) => void;
}

export default function WeightModal({ isOpen, onClose, produto, onConfirm }: WeightModalProps) {
  const [weight, setWeight] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateSubtotal = () => {
    if (!produto || !weight) return 0;
    const weightNum = parseFloat(weight);
    const price = parseFloat(produto.preco);
    return weightNum * price;
  };

  const handleConfirm = () => {
    const weightNum = parseFloat(weight);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informar Peso</DialogTitle>
        </DialogHeader>
        
        {produto && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                {produto.nome} - {formatCurrency(parseFloat(produto.preco))}/kg
              </p>
            </div>
            
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-center text-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Subtotal: <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                disabled={!weight || parseFloat(weight) <= 0}
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
