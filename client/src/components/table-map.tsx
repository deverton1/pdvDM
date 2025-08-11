import { useQuery } from "@tanstack/react-query";
import { Mesa } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Armchair, Utensils, Bookmark } from "lucide-react";

interface TableMapProps {
  onTableClick: (mesa: Mesa) => void;
  onNewSale: () => void;
}

export default function TableMap({ onTableClick, onNewSale }: TableMapProps) {
  
  const { data: mesas = [], isLoading } = useQuery<Mesa[]>({
    queryKey: [api.getMesas()],
  });

  const getTableStyle = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "bg-emerald-50 border-emerald-200 hover:border-emerald-300 text-emerald-700";
      case "ocupada":
        return "bg-amber-50 border-amber-200 hover:border-amber-300 text-amber-700";
      case "reservada":
        return "bg-violet-50 border-violet-200 hover:border-violet-300 text-violet-700";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTableIcon = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return <Armchair className="text-white" />;
      case "ocupada":
        return <Utensils className="text-white" />;
      case "reservada":
        return <Bookmark className="text-white" />;
      default:
        return <Armchair className="text-white" />;
    }
  };

  const getIconBgColor = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "bg-emerald-500";
      case "ocupada":
        return "bg-amber-500";
      case "reservada":
        return "bg-violet-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleTableClick = (mesa: Mesa) => {
    onTableClick(mesa);
  };

  if (isLoading) {
    return <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-4 h-24" />
      ))}
    </div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Mapa de Mesas</h3>
        <Button onClick={onNewSale} className="bg-blue-500 hover:bg-blue-600">
          Nova Venda Avulsa
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-4 text-center ${getTableStyle(mesa.status)}`}
            onClick={() => handleTableClick(mesa)}
          >
            <div className={`w-12 h-12 ${getIconBgColor(mesa.status)} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
              {getTableIcon(mesa.status)}
            </div>
            <p className="font-semibold">Mesa {mesa.numero.toString().padStart(2, '0')}</p>
            <p className="text-xs capitalize">{mesa.status}</p>
            {mesa.status === "ocupada" && (
              <p className="text-xs mt-1">Comanda ativa</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
