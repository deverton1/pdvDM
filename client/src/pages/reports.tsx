import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RelatorioVendas } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    de: "2024-01-01",
    ate: "2024-01-31",
  });

  const { data: relatorio, isLoading, refetch } = useQuery<RelatorioVendas>({
    queryKey: [api.getRelatorioVendas(dateRange.de, dateRange.ate)],
    enabled: false, // Only fetch when button is clicked
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDateChange = (field: 'de' | 'ate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Relatórios de Vendas</h2>
        <p className="text-gray-600">Visualize o desempenho de vendas por período</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dataInicial">Data Inicial</Label>
              <Input
                id="dataInicial"
                type="date"
                value={dateRange.de}
                onChange={(e) => handleDateChange('de', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFinal">Data Final</Label>
              <Input
                id="dataFinal"
                type="date"
                value={dateRange.ate}
                onChange={(e) => handleDateChange('ate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {relatorio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(relatorio.totalFaturamento)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                    <p className="text-2xl font-bold text-gray-900">{relatorio.totalVendas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(relatorio.ticketMedio)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Package className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Produtos Vendidos</p>
                    <p className="text-2xl font-bold text-gray-900">{relatorio.produtosVendidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Gráfico de vendas por dia</p>
                    <p className="text-sm text-gray-400">Implementar com recharts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatorio.produtosMaisVendidos.slice(0, 5).map((item, index) => (
                    <div key={item.produto.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-200 rounded mr-3 flex items-center justify-center">
                          <span className="text-sm">🧁</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.produto.nome}</p>
                          <p className="text-xs text-gray-500">{item.quantidade} vendidos</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.faturamento)}</p>
                    </div>
                  ))}
                  
                  {relatorio.produtosMaisVendidos.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum produto vendido no período</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* No data state */}
      {!relatorio && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhum relatório gerado</p>
              <p>Selecione um período e clique em "Gerar Relatório" para visualizar os dados</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
