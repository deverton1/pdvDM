import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProdutoComCategoria } from "@/lib/types";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ProductGridProps {
  onProductClick: (produto: ProdutoComCategoria) => void;
}

export default function ProductGrid({ onProductClick }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: produtos = [], isLoading } = useQuery<ProdutoComCategoria[]>({
    queryKey: [api.getProdutos()],
  });

  const filteredProducts = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || produto.categoria.nome === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(produtos.map(p => p.categoria.nome)));

  const formatPrice = (price: string, unit: string) => {
    const unitLabels = {
      unitario: "unid",
      kg: "kg",
      fatia: "fatia"
    };
    return `R$ ${parseFloat(price).toFixed(2)}/${unitLabels[unit as keyof typeof unitLabels]}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-4 h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
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
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((produto) => (
          <div
            key={produto.id}
            className="cursor-pointer group bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-all duration-200"
            onClick={() => onProductClick(produto)}
          >
            <div className="w-full h-24 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-2xl">🧁</span>
            </div>
            <h4 className="font-medium text-gray-900 text-sm mb-1">{produto.nome}</h4>
            <p className="text-xs text-gray-500 mb-2">{produto.categoria.nome}</p>
            <p className="font-semibold text-blue-600">{formatPrice(produto.preco, produto.unidadeMedida)}</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
