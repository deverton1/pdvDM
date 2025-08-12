import { Button } from "@/components/ui/button";
import { Armchair, Clock, Users } from "lucide-react";
import type { Mesa } from "@shared/schema";

interface TableMapProps {
  mesas: Mesa[];
  onMesaClick: (mesa: Mesa) => void;
  isLoading?: boolean;
}

export default function TableMap({ mesas, onMesaClick, isLoading }: TableMapProps) {
  
  const getTableStyle = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "bg-green-50 border-green-200 hover:border-green-400 text-green-800 hover:bg-green-100";
      case "ocupada":
        return "bg-orange-50 border-orange-200 hover:border-orange-400 text-orange-800 hover:bg-orange-100";
      case "reservada":
        return "bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTableIcon = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return <Armchair className="w-5 h-5" />;
      case "ocupada":
        return <Users className="w-5 h-5" />;
      case "reservada":
        return <Clock className="w-5 h-5" />;
      default:
        return <Armchair className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "Livre";
      case "ocupada":
        return "Ocupada";
      case "reservada":
        return "Reservada";
      default:
        return "Indefinido";
    }
  };

  const handleTableClick = (mesa: Mesa) => {
    if (isLoading) return;
    onMesaClick(mesa);
  };

  if (!mesas?.length) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-4 h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {mesas.map((mesa) => (
        <Button
          key={mesa.id}
          variant="outline"
          onClick={() => handleTableClick(mesa)}
          disabled={isLoading || mesa.status === "reservada"}
          className={`h-auto p-4 flex flex-col items-center justify-center space-y-2 transition-colors ${getTableStyle(mesa.status)}`}
        >
          <div className="flex items-center space-x-2">
            {getTableIcon(mesa.status)}
            <span className="font-semibold">Mesa {mesa.numero.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-xs font-medium">{getStatusText(mesa.status)}</span>
        </Button>
      ))}
    </div>
  );
}