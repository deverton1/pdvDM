import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ShoppingCart, Package, BarChart3, Plus } from "lucide-react";
import TableMap from "@/components/table-map";
import { useToast } from "@/hooks/use-toast";
import type { Mesa } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mesas = [], isLoading } = useQuery<Mesa[]>({
    queryKey: [api.getMesas()],
  });

  const createComandaMutation = useMutation({
    mutationFn: (data: { mesaId?: number }) => api.createComanda(data),
    onSuccess: (comanda: any, variables) => {
      if (variables.mesaId) {
        // Atualizar status da mesa para ocupada
        api.updateMesaStatus(variables.mesaId, "ocupada");
        queryClient.invalidateQueries({ queryKey: [api.getMesas()] });
        // Navegar para comanda da mesa
        setLocation(`/comanda/mesa?mesa=${variables.mesaId}&comanda=${comanda.id}`);
      } else {
        // Navegar para venda avulsa
        setLocation(`/comanda/avulsa?comanda=${comanda.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a comanda",
        variant: "destructive",
      });
    },
  });

  const handleMesaClick = (mesa: Mesa) => {
    if (mesa.status === 'livre') {
      // Criar nova comanda para a mesa
      createComandaMutation.mutate({ mesaId: mesa.id });
    } else if (mesa.status === 'ocupada') {
      // Buscar comanda existente da mesa e navegar
      setLocation(`/comanda/mesa?mesa=${mesa.id}`);
    }
    // Mesas reservadas não fazem nada por enquanto
  };

  const handleNovaVendaAvulsa = () => {
    createComandaMutation.mutate({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PDV - DOCES MARA</h1>
          <p className="text-gray-600">Sistema de Ponto de Venda</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleNovaVendaAvulsa}
            disabled={createComandaMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda Avulsa
          </Button>
          <Button variant="outline" onClick={() => setLocation("/products")}>
            <Package className="w-4 h-4 mr-2" />
            Produtos
          </Button>
          <Button variant="outline" onClick={() => setLocation("/reports")}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapa de Mesas</h2>
            <TableMap 
              mesas={mesas} 
              onMesaClick={handleMesaClick}
              isLoading={createComandaMutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Acesso Rápido</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleNovaVendaAvulsa}
                disabled={createComandaMutation.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setLocation("/products")}
              >
                <Package className="w-4 h-4 mr-2" />
                Gerenciar Produtos
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setLocation("/reports")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mesas Livres:</span>
                <span className="font-medium text-green-600">
                  {mesas.filter((m: Mesa) => m.status === 'livre').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mesas Ocupadas:</span>
                <span className="font-medium text-orange-600">
                  {mesas.filter((m: Mesa) => m.status === 'ocupada').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mesas Reservadas:</span>
                <span className="font-medium text-blue-600">
                  {mesas.filter((m: Mesa) => m.status === 'reservada').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}