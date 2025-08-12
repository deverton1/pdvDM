import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertProdutoSchema } from "@shared/schema";
import { z } from "zod";
import type { ProdutoComCategoria } from "@/lib/types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: ProdutoComCategoria | null;
}

const formSchema = insertProdutoSchema.extend({
  preco: z.string().min(1, "Preço é obrigatório"),
  estoqueAtual: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ProductFormModal({ isOpen, onClose, produto }: ProductFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!produto;

  const { data: categorias = [] } = useQuery({
    queryKey: [api.getCategorias()],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      preco: "",
      unidadeMedida: "unitario",
      categoriaId: undefined,
      controlaEstoque: false,
      estoqueAtual: "",
    },
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
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateProduto(id, data),
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

  useEffect(() => {
    if (produto && isOpen) {
      form.reset({
        nome: produto.nome,
        preco: produto.preco,
        unidadeMedida: produto.unidadeMedida,
        categoriaId: produto.categoriaId,
        controlaEstoque: produto.controlaEstoque || false,
        estoqueAtual: produto.estoqueAtual || "",
      });
    } else if (!produto && isOpen) {
      form.reset({
        nome: "",
        preco: "",
        unidadeMedida: "unitario",
        categoriaId: undefined,
        controlaEstoque: false,
        estoqueAtual: "",
      });
    }
  }, [produto, isOpen, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      preco: data.preco.replace(',', '.'),
      estoqueAtual: data.controlaEstoque ? data.estoqueAtual?.replace(',', '.') : undefined,
    };

    if (isEditing && produto) {
      updateMutation.mutate({ id: produto.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const controlaEstoque = form.watch("controlaEstoque");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Produto" : "Adicionar Produto"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Brigadeiro Gourmet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria: any) => (
                        <SelectItem key={categoria.id} value={categoria.id.toString()}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidadeMedida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de Medida</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unitario">Unitário</SelectItem>
                      <SelectItem value="kg">Por Quilograma</SelectItem>
                      <SelectItem value="fatia">Por Fatia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="controlaEstoque"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Controlar estoque</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {controlaEstoque && (
              <FormField
                control={form.control}
                name="estoqueAtual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input placeholder="Quantidade em estoque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Salvando..." 
                  : isEditing ? "Atualizar" : "Criar"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}