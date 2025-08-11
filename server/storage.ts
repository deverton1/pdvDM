import {
  type Categoria, type Produto, type Mesa, type Comanda, type ItemComanda, type Venda,
  type InsertCategoria, type InsertProduto, type InsertMesa, type InsertComanda, type InsertItemComanda, type InsertVenda,
  type ProdutoComCategoria, type ComandaCompleta, type RelatorioVendas
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Categorias
  getCategorias(): Promise<Categoria[]>;
  createCategoria(categoria: InsertCategoria): Promise<Categoria>;

  // Produtos
  getProdutos(): Promise<ProdutoComCategoria[]>;
  getProdutoById(id: number): Promise<Produto | undefined>;
  createProduto(produto: InsertProduto): Promise<Produto>;
  updateProduto(id: number, produto: Partial<InsertProduto>): Promise<Produto>;
  deleteProduto(id: number): Promise<void>;

  // Mesas
  getMesas(): Promise<Mesa[]>;
  getMesaById(id: number): Promise<Mesa | undefined>;
  updateStatusMesa(id: number, status: "livre" | "ocupada" | "reservada"): Promise<Mesa>;

  // Comandas
  createComanda(comanda: InsertComanda): Promise<Comanda>;
  getComandaById(id: number): Promise<ComandaCompleta | undefined>;
  getComandaByMesa(mesaId: number): Promise<Comanda | undefined>;
  fecharComanda(id: number): Promise<Comanda>;
  addItemComanda(comandaId: number, item: InsertItemComanda): Promise<ItemComanda>;
  removeItemComanda(itemId: number): Promise<void>;
  updateQuantidadeItem(itemId: number, quantidade: number): Promise<ItemComanda>;

  // Vendas
  createVenda(venda: InsertVenda): Promise<Venda>;
  getRelatorioVendas(dataInicio: string, dataFim: string): Promise<RelatorioVendas>;
}

export class MemStorage implements IStorage {
  private categorias: Map<number, Categoria> = new Map();
  private produtos: Map<number, Produto> = new Map();
  private mesas: Map<number, Mesa> = new Map();
  private comandas: Map<number, Comanda> = new Map();
  private itensComanda: Map<number, ItemComanda> = new Map();
  private vendas: Map<number, Venda> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const doces: Categoria = { id: 1, nome: "Doces" };
    const bolos: Categoria = { id: 2, nome: "Bolos" };
    const tortas: Categoria = { id: 3, nome: "Tortas" };
    const salgados: Categoria = { id: 4, nome: "Salgados" };
    const bebidas: Categoria = { id: 5, nome: "Bebidas" };
    
    this.categorias.set(1, doces);
    this.categorias.set(2, bolos);
    this.categorias.set(3, tortas);
    this.categorias.set(4, salgados);
    this.categorias.set(5, bebidas);

    // Initialize products
    const produtos: Produto[] = [
      { id: 1, nome: "Brigadeiro Gourmet", preco: "6.00", unidadeMedida: "unitario", categoriaId: 1, controlaEstoque: true, estoqueAtual: "120" },
      { id: 2, nome: "Bolo de Chocolate", preco: "8.50", unidadeMedida: "fatia", categoriaId: 2, controlaEstoque: true, estoqueAtual: "8" },
      { id: 3, nome: "Torta de Morango", preco: "130.00", unidadeMedida: "kg", categoriaId: 3, controlaEstoque: true, estoqueAtual: "2.5" },
      { id: 4, nome: "Pão de Açúcar", preco: "3.50", unidadeMedida: "unitario", categoriaId: 4, controlaEstoque: true, estoqueAtual: "50" },
      { id: 5, nome: "Refrigerante", preco: "4.00", unidadeMedida: "unitario", categoriaId: 5, controlaEstoque: true, estoqueAtual: "30" },
      { id: 6, nome: "Torta de Limão", preco: "9.00", unidadeMedida: "fatia", categoriaId: 3, controlaEstoque: true, estoqueAtual: "6" },
      { id: 7, nome: "Cupcake", preco: "7.50", unidadeMedida: "unitario", categoriaId: 1, controlaEstoque: true, estoqueAtual: "24" },
      { id: 8, nome: "Cookie", preco: "4.50", unidadeMedida: "unitario", categoriaId: 1, controlaEstoque: true, estoqueAtual: "40" },
    ];

    produtos.forEach(produto => this.produtos.set(produto.id, produto));

    // Initialize tables
    for (let i = 1; i <= 12; i++) {
      const status = i === 2 || i === 5 || i === 9 || i === 11 ? "ocupada" : i === 3 ? "reservada" : "livre";
      this.mesas.set(i, { id: i, numero: i, status });
    }

    this.nextId = 100;
  }

  async getCategorias(): Promise<Categoria[]> {
    return Array.from(this.categorias.values());
  }

  async createCategoria(categoria: InsertCategoria): Promise<Categoria> {
    const id = this.nextId++;
    const newCategoria: Categoria = {
      id,
      nome: categoria.nome,
    };
    this.categorias.set(id, newCategoria);
    return newCategoria;
  }

  async getProdutos(): Promise<ProdutoComCategoria[]> {
    const produtos = Array.from(this.produtos.values());
    return produtos.map(produto => ({
      ...produto,
      categoria: this.categorias.get(produto.categoriaId)!
    }));
  }

  async getProdutoById(id: number): Promise<Produto | undefined> {
    return this.produtos.get(id);
  }

  async createProduto(produto: InsertProduto): Promise<Produto> {
    const id = this.nextId++;
    const newProduto: Produto = {
      id,
      nome: produto.nome,
      preco: produto.preco,
      unidadeMedida: produto.unidadeMedida,
      categoriaId: produto.categoriaId,
      controlaEstoque: produto.controlaEstoque ?? false,
      estoqueAtual: produto.estoqueAtual ?? null,
    };
    this.produtos.set(id, newProduto);
    return newProduto;
  }

  async updateProduto(id: number, produto: Partial<InsertProduto>): Promise<Produto> {
    const existing = this.produtos.get(id);
    if (!existing) throw new Error("Produto não encontrado");
    
    const updated: Produto = { ...existing, ...produto };
    this.produtos.set(id, updated);
    return updated;
  }

  async deleteProduto(id: number): Promise<void> {
    this.produtos.delete(id);
  }

  async getMesas(): Promise<Mesa[]> {
    return Array.from(this.mesas.values());
  }

  async getMesaById(id: number): Promise<Mesa | undefined> {
    return this.mesas.get(id);
  }

  async updateStatusMesa(id: number, status: "livre" | "ocupada" | "reservada"): Promise<Mesa> {
    const mesa = this.mesas.get(id);
    if (!mesa) throw new Error("Mesa não encontrada");
    
    const updated: Mesa = { ...mesa, status };
    this.mesas.set(id, updated);
    return updated;
  }

  async createComanda(comanda: InsertComanda): Promise<Comanda> {
    const id = this.nextId++;
    const newComanda: Comanda = {
      id,
      mesaId: comanda.mesaId ?? null,
      clienteNome: comanda.clienteNome ?? null,
      status: "aberta",
      total: null,
      criadaEm: new Date(),
      fechadaEm: null,
    };
    this.comandas.set(id, newComanda);

    // Update mesa status if applicable
    if (newComanda.mesaId) {
      await this.updateStatusMesa(newComanda.mesaId, "ocupada");
    }

    return newComanda;
  }

  async getComandaById(id: number): Promise<ComandaCompleta | undefined> {
    const comanda = this.comandas.get(id);
    if (!comanda) return undefined;

    const itens = Array.from(this.itensComanda.values())
      .filter(item => item.comandaId === id)
      .map(item => ({
        ...item,
        produto: this.produtos.get(item.produtoId)!
      }));

    const mesa = comanda.mesaId ? this.mesas.get(comanda.mesaId) : undefined;

    return { ...comanda, mesa, itens };
  }

  async getComandaByMesa(mesaId: number): Promise<Comanda | undefined> {
    return Array.from(this.comandas.values())
      .find(comanda => comanda.mesaId === mesaId && comanda.status === "aberta");
  }

  async fecharComanda(id: number): Promise<Comanda> {
    const comanda = this.comandas.get(id);
    if (!comanda) throw new Error("Comanda não encontrada");

    // Calculate total
    const itens = Array.from(this.itensComanda.values())
      .filter(item => item.comandaId === id);
    
    const total = itens.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    const updated: Comanda = {
      ...comanda,
      status: "fechada",
      total: total.toFixed(2),
      fechadaEm: new Date(),
    };

    this.comandas.set(id, updated);
    return updated;
  }

  async addItemComanda(comandaId: number, item: InsertItemComanda): Promise<ItemComanda> {
    const produto = await this.getProdutoById(item.produtoId);
    if (!produto) throw new Error("Produto não encontrado");

    const id = this.nextId++;
    const precoUnitario = parseFloat(produto.preco);
    const quantidade = parseFloat(item.quantidade.toString());
    const subtotal = precoUnitario * quantidade;

    const newItem: ItemComanda = {
      id,
      comandaId,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: precoUnitario.toFixed(2),
      subtotal: subtotal.toFixed(2),
    };

    this.itensComanda.set(id, newItem);
    return newItem;
  }

  async removeItemComanda(itemId: number): Promise<void> {
    this.itensComanda.delete(itemId);
  }

  async updateQuantidadeItem(itemId: number, quantidade: number): Promise<ItemComanda> {
    const item = this.itensComanda.get(itemId);
    if (!item) throw new Error("Item não encontrado");

    const precoUnitario = parseFloat(item.precoUnitario);
    const subtotal = precoUnitario * quantidade;

    const updated: ItemComanda = {
      ...item,
      quantidade: quantidade.toString(),
      subtotal: subtotal.toFixed(2),
    };

    this.itensComanda.set(itemId, updated);
    return updated;
  }

  async createVenda(venda: InsertVenda): Promise<Venda> {
    const id = this.nextId++;
    const newVenda: Venda = {
      id,
      comandaId: venda.comandaId,
      metodoPagamento: venda.metodoPagamento,
      valorTotal: venda.valorTotal,
      valorRecebido: venda.valorRecebido ?? null,
      troco: venda.troco ?? null,
      criadaEm: new Date(),
    };

    this.vendas.set(id, newVenda);

    // Close the comanda and update mesa status if applicable
    const comanda = this.comandas.get(venda.comandaId);
    if (comanda) {
      const updatedComanda: Comanda = {
        ...comanda,
        status: "fechada",
        total: venda.valorTotal,
        fechadaEm: new Date(),
      };
      this.comandas.set(comanda.id, updatedComanda);

      if (updatedComanda.mesaId) {
        await this.updateStatusMesa(updatedComanda.mesaId, "livre");
      }
    }

    return newVenda;
  }

  async getRelatorioVendas(dataInicio: string, dataFim: string): Promise<RelatorioVendas> {
    const vendas = Array.from(this.vendas.values())
      .filter(venda => {
        const dataVenda = venda.criadaEm?.toISOString().split('T')[0];
        return dataVenda && dataVenda >= dataInicio && dataVenda <= dataFim;
      });

    const totalFaturamento = vendas.reduce((sum, venda) => sum + parseFloat(venda.valorTotal), 0);
    const totalVendas = vendas.length;
    const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;

    // Calculate products sold
    const produtosVendidos = vendas.reduce((sum, venda) => {
      const comanda = this.comandas.get(venda.comandaId);
      if (!comanda) return sum;
      
      const itens = Array.from(this.itensComanda.values())
        .filter(item => item.comandaId === comanda.id);
      
      return sum + itens.reduce((itemSum, item) => itemSum + parseFloat(item.quantidade), 0);
    }, 0);

    // Group sales by day
    const vendasPorDia: { data: string; total: number }[] = [];
    const vendasPorDiaMap = new Map<string, number>();

    vendas.forEach(venda => {
      const data = venda.criadaEm?.toISOString().split('T')[0];
      if (data) {
        const total = vendasPorDiaMap.get(data) || 0;
        vendasPorDiaMap.set(data, total + parseFloat(venda.valorTotal));
      }
    });

    vendasPorDiaMap.forEach((total, data) => {
      vendasPorDia.push({ data, total });
    });

    // Calculate top products
    const produtoStats = new Map<number, { quantidade: number; faturamento: number }>();

    vendas.forEach(venda => {
      const comanda = this.comandas.get(venda.comandaId);
      if (!comanda) return;
      
      const itens = Array.from(this.itensComanda.values())
        .filter(item => item.comandaId === comanda.id);
      
      itens.forEach(item => {
        const stats = produtoStats.get(item.produtoId) || { quantidade: 0, faturamento: 0 };
        stats.quantidade += parseFloat(item.quantidade);
        stats.faturamento += parseFloat(item.subtotal);
        produtoStats.set(item.produtoId, stats);
      });
    });

    const produtosMaisVendidos = Array.from(produtoStats.entries())
      .map(([produtoId, stats]) => ({
        produto: this.produtos.get(produtoId)!,
        quantidade: stats.quantidade,
        faturamento: stats.faturamento,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    return {
      totalFaturamento,
      totalVendas,
      ticketMedio,
      produtosVendidos,
      vendasPorDia: vendasPorDia.sort((a, b) => a.data.localeCompare(b.data)),
      produtosMaisVendidos,
    };
  }
}

export const storage = new MemStorage();
