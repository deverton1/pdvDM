import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, ArrowLeft, Download } from "lucide-react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Reports() {
  const [, setLocation] = useLocation();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: relatorio, isLoading, refetch } = useQuery({
    queryKey: [api.getRelatorioVendas(startDate, endDate)],
    enabled: !!startDate && !!endDate,
  });

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      refetch();
    }
  };

  const getTodayDate = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  const getWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return format(date, 'yyyy-MM-dd');
  };

  const setQuickPeriod = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setEndDate(format(end, 'yyyy-MM-dd'));
    setStartDate(format(start, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios de Vendas</h2>
          <p className="text-gray-600">Visualize o desempenho das vendas por período</p>
        </div>
        <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Período do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setQuickPeriod(0)}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPeriod(7)}>
              Últimos 7 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPeriod(30)}>
              Últimos 30 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPeriod(90)}>
              Últimos 90 dias
            </Button>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={!startDate || !endDate || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {relatorio && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(relatorio.totalVendas || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Número de Vendas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {relatorio.numeroVendas || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(relatorio.ticketMedio || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vendas Detalhadas</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {relatorio.vendas && relatorio.vendas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Comanda</TableHead>
                      <TableHead>Mesa</TableHead>
                      <TableHead>Método Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorio.vendas.map((venda: any) => (
                      <TableRow key={venda.id}>
                        <TableCell>{formatDate(venda.dataHora)}</TableCell>
                        <TableCell>#{venda.comandaId}</TableCell>
                        <TableCell>
                          {venda.comanda?.mesaId 
                            ? `Mesa ${venda.comanda.mesaId.toString().padStart(2, '0')}` 
                            : 'Venda Avulsa'
                          }
                        </TableCell>
                        <TableCell>{getPaymentMethodName(venda.metodoPagamento)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(venda.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma venda encontrada</p>
                  <p className="text-sm">Não há vendas no período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!relatorio && !isLoading && (startDate || endDate) && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Selecione um período</p>
              <p className="text-sm">Escolha as datas inicial e final para gerar o relatório</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}