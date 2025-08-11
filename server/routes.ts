import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategoriaSchema, insertProdutoSchema, insertComandaSchema, insertItemComandaSchema, insertVendaSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categorias routes
  app.get("/api/pos/categorias", async (req, res) => {
    try {
      const categorias = await storage.getCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post("/api/pos/categorias", async (req, res) => {
    try {
      const data = insertCategoriaSchema.parse(req.body);
      const categoria = await storage.createCategoria(data);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  // Produtos routes
  app.get("/api/pos/produtos", async (req, res) => {
    try {
      const produtos = await storage.getProdutos();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.post("/api/pos/produtos", async (req, res) => {
    try {
      const data = insertProdutoSchema.parse(req.body);
      const produto = await storage.createProduto(data);
      res.status(201).json(produto);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.put("/api/pos/produtos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProdutoSchema.partial().parse(req.body);
      const produto = await storage.updateProduto(id, data);
      res.json(produto);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar produto" });
    }
  });

  app.delete("/api/pos/produtos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduto(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Erro ao deletar produto" });
    }
  });

  // Mesas routes
  app.get("/api/pos/mesas", async (req, res) => {
    try {
      const mesas = await storage.getMesas();
      res.json(mesas);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mesas" });
    }
  });

  app.put("/api/pos/mesas/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.enum(["livre", "ocupada", "reservada"]) }).parse(req.body);
      const mesa = await storage.updateStatusMesa(id, status);
      res.json(mesa);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  // Comandas routes
  app.post("/api/pos/comandas", async (req, res) => {
    try {
      console.log("POST /api/pos/comandas - Body:", req.body);
      const data = insertComandaSchema.parse(req.body);
      console.log("Dados validados:", data);
      const comanda = await storage.createComanda(data);
      console.log("Comanda criada:", comanda);
      res.status(201).json(comanda);
    } catch (error) {
      console.error("Erro ao criar comanda:", error);
      res.status(400).json({ message: "Dados inválidos", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/pos/comandas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comanda = await storage.getComandaById(id);
      if (!comanda) {
        return res.status(404).json({ message: "Comanda não encontrada" });
      }
      res.json(comanda);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comanda" });
    }
  });

  app.post("/api/pos/comandas/:id/itens", async (req, res) => {
    try {
      const comandaId = parseInt(req.params.id);
      const data = insertItemComandaSchema.parse({ ...req.body, comandaId });
      const item = await storage.addItemComanda(comandaId, data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.put("/api/pos/comandas/:id/fechar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comanda = await storage.fecharComanda(id);
      res.json(comanda);
    } catch (error) {
      res.status(400).json({ message: "Erro ao fechar comanda" });
    }
  });

  app.delete("/api/pos/itens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeItemComanda(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Erro ao remover item" });
    }
  });

  app.put("/api/pos/itens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantidade } = z.object({ quantidade: z.number() }).parse(req.body);
      const item = await storage.updateQuantidadeItem(id, quantidade);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  // Vendas routes
  app.post("/api/pos/vendas", async (req, res) => {
    try {
      const data = insertVendaSchema.parse(req.body);
      const venda = await storage.createVenda(data);
      res.status(201).json(venda);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  // Relatórios routes
  app.get("/api/pos/relatorios/vendas", async (req, res) => {
    try {
      const { de, ate } = z.object({
        de: z.string(),
        ate: z.string(),
      }).parse(req.query);
      
      const relatorio = await storage.getRelatorioVendas(de, ate);
      res.json(relatorio);
    } catch (error) {
      res.status(400).json({ message: "Parâmetros inválidos" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
