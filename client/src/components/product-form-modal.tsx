import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProdutoComCategoria, Categoria } from "@/lib/types";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: ProdutoComCategoria | null;
}

interface FormData {
  nome: string;
  categoriaId: string;
  preco: string;
  unidadeMedida: "unitario" | "kg" | "fatia";
  controlaEstoque: boolean;
  estoqueAtual: string;
}

export default function ProductFormModal({ isOpen, onClose, produto }: ProductFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    nome: produto?.nome || "",
    categoriaId: produto?.categoriaId?.toString() || "",
    preco: produto?.preco || "",
    unidadeMedida: produto?.unidadeMedida || "unitario",
    controlaEstoque: produto?.controlaEstoque || false,
    estoqueAtual: produto?.estoqueAtual || "",
  });

  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: [api.getCategorias()],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createProduto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getProdutos()] });
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o produto",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateProduto(produto!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.getProdutos()] });
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.categoriaId || !formData.preco) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      nome: formData.nome,
      categoriaId: parseInt(formData.categoriaId),
      preco: formData.preco,
      unidadeMedida: formData.unidadeMedida,
      controlaEstoque: formData.controlaEstoque,
      estoqueAtual: formData.controlaEstoque ? formData.estoqueAtual : undefined,
    };

    if (produto) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      categoriaId: "",
      preco: "",
      unidadeMedida: "unitario",
      controlaEstoque: false,
      estoqueAtual: "",
    });
    onClose();
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              placeholder="Ex: Brigadeiro Gourmet"
              value={formData.nome}
              onChange={(e) => updateFormData("nome", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={formData.categoriaId} onValueChange={(value) => updateFormData("categoriaId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">Preço *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.preco}
                onChange={(e) => updateFormData("preco", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unidade">Unidade</Label>
              <Select value={formData.unidadeMedida} onValueChange={(value) => updateFormData("unidadeMedida", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unitario">Unitário</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="fatia">Fatia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="controla-estoque"
              checked={formData.controlaEstoque}
              onCheckedChange={(checked) => updateFormData("controlaEstoque", !!checked)}
            />
            <Label htmlFor="controla-estoque">Controlar estoque</Label>
          </div>

          {formData.controlaEstoque && (
            <div>
              <Label htmlFor="estoque">Estoque Atual</Label>
              <Input
                id="estoque"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.estoqueAtual}
                onChange={(e) => updateFormData("estoqueAtual", e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {produto ? "Atualizar" : "Salvar"} Produto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
