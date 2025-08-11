import { Button } from "@/components/ui/button";
import { Candy, Home, Package, BarChart3 } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function Header() {
  const [location] = useLocation();

  const getNavClass = (path: string) => {
    const isActive = location === path;
    return isActive 
      ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Candy className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DOCES MARA</h1>
              <p className="text-sm text-gray-500">Sistema PDV</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className={getNavClass("/")}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" size="sm" className={getNavClass("/products")}>
                <Package className="w-4 h-4 mr-2" />
                Produtos
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className={getNavClass("/reports")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
