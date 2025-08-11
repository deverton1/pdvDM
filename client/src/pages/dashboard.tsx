import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mesa, DashboardStats } from "@/lib/types";
import { api } from "@/lib/api";
import TableMap from "@/components/table-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Armchair, Utensils, DollarSign, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: mesas = [] } = useQuery<Mesa[]>({
    queryKey: [api.getMesas()],
  });

  const calculateStats = (): DashboardStats => {
    const mesasLivres = mesas.filter(m => m.status === "livre").length;
    const mesasOcupadas = mesas.filter(m => m.status === "ocupada").length;
    
    return {
      mesasLivres,
      mesasOcupadas,
      vendasHoje: "R$ 1.250,00", // TODO: Calculate from real data
      comandasAbertas: mesasOcupadas,
    };
  };

  const stats = calculateStats();

  const handleTableClick = (mesa: Mesa) => {
    if (mesa.status === "livre") {
      // Create new comanda and redirect
      setLocation(`/comanda?mesa=${mesa.id}&new=true`);
    } else if (mesa.status === "ocupada") {
      // Find existing comanda and redirect
      setLocation(`/comanda?mesa=${mesa.id}`);
    }
  };

  const handleNewSale = () => {
    setLocation("/comanda/avulsa");
  };

  const formatCurrency = (value: string) => value;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Principal</h2>
        <p className="text-gray-600">Gerencie mesas e vendas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Armchair className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mesas Livres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mesasLivres}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Utensils className="w-5 h-5 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mesasOcupadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.vendasHoje)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comandas Abertas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.comandasAbertas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables Map */}
        <div className="lg:col-span-3">
          <TableMap onTableClick={handleTableClick} onNewSale={handleNewSale} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button onClick={handleNewSale} className="w-full bg-blue-500 hover:bg-blue-600">
                  Nova Venda
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation("/products")}
                >
                  Gerenciar Produtos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation("/reports")}
                >
                  Ver Relatórios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Vendas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mesa 02</p>
                    <p className="text-xs text-gray-500">14:30</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">R$ 85,50</p>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Venda Avulsa</p>
                    <p className="text-xs text-gray-500">14:15</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">R$ 42,00</p>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mesa 05</p>
                    <p className="text-xs text-gray-500">13:45</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">R$ 127,80</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
