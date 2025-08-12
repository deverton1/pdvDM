import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package } from "lucide-react";
import type { ProdutoComCategoria } from "@/lib/types";

interface ProductGridProps {
  onProductClick: (produto: ProdutoComCategoria) => void;
}

export default function ProductGrid({ onProductClick }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: produtos = [], isLoading: produtosLoading } = useQuery<ProdutoComCategoria[]>({
    queryKey: [api.getProdutos()],
  });

  const { data: categorias = [] } = useQuery({
    queryKey: [api.getCategorias()],
  });

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const getUnitLabel = (unidade: string) => {
    switch (unidade) {
      case 'kg': return '/ kg';
      case 'fatia': return '/ fatia';
      default: return '/ un';
    }
  };

  const filteredProducts = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || produto.categoria?.id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (produtosLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((categoria: any) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((produto) => (
                <Button
                  key={produto.id}
                  variant="outline"
                  onClick={() => onProductClick(produto)}
                  className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Package className="w-8 h-8 text-gray-400" />
                  <div className="text-center space-y-1">
                    <h4 className="font-medium text-sm leading-tight">{produto.nome}</h4>
                    <p className="text-xs text-gray-600">{produto.categoria?.nome}</p>
                    <p className="text-sm font-semibold text-green-600">
                      {formatPrice(produto.preco)}
                      <span className="text-xs text-gray-500 ml-1">
                        {getUnitLabel(produto.unidadeMedida)}
                      </span>
                    </p>
                  </div>
                </Button>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum produto encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}