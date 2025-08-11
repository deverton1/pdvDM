import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categorias de produtos
export const categorias = pgTable("categorias", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nome: text("nome").notNull(),
});

// Produtos
export const produtos = pgTable("produtos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nome: text("nome").notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  unidadeMedida: text("unidade_medida").notNull().$type<"unitario" | "kg" | "fatia">(),
  categoriaId: integer("categoria_id").references(() => categorias.id).notNull(),
  controlaEstoque: boolean("controla_estoque").default(false),
  estoqueAtual: decimal("estoque_atual", { precision: 10, scale: 3 }),
});

// Mesas
export const mesas = pgTable("mesas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  numero: integer("numero").notNull(),
  status: text("status").notNull().$type<"livre" | "ocupada" | "reservada">().default("livre"),
});

// Comandas
export const comandas = pgTable("comandas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mesaId: integer("mesa_id").references(() => mesas.id),
  clienteNome: text("cliente_nome"),
  status: text("status").notNull().$type<"aberta" | "fechada">().default("aberta"),
  total: decimal("total", { precision: 10, scale: 2 }),
  criadaEm: timestamp("criada_em").defaultNow(),
  fechadaEm: timestamp("fechada_em"),
});

// Itens da comanda
export const itensComanda = pgTable("itens_comanda", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  comandaId: integer("comanda_id").references(() => comandas.id).notNull(),
  produtoId: integer("produto_id").references(() => produtos.id).notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 3 }).notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// Vendas
export const vendas = pgTable("vendas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  comandaId: integer("comanda_id").references(() => comandas.id).notNull(),
  metodoPagamento: text("metodo_pagamento").notNull().$type<"dinheiro" | "cartao_credito" | "cartao_debito" | "pix">(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  valorRecebido: decimal("valor_recebido", { precision: 10, scale: 2 }),
  troco: decimal("troco", { precision: 10, scale: 2 }),
  criadaEm: timestamp("criada_em").defaultNow(),
});

// Insert schemas
export const insertCategoriaSchema = createInsertSchema(categorias).omit({ id: true });
export const insertProdutoSchema = createInsertSchema(produtos).omit({ id: true });
export const insertMesaSchema = createInsertSchema(mesas).omit({ id: true });
export const insertComandaSchema = createInsertSchema(comandas).omit({ id: true, total: true, criadaEm: true, fechadaEm: true });
export const insertItemComandaSchema = createInsertSchema(itensComanda).omit({ id: true, precoUnitario: true, subtotal: true });
export const insertVendaSchema = createInsertSchema(vendas).omit({ id: true, criadaEm: true });

// Types
export type Categoria = typeof categorias.$inferSelect;
export type Produto = typeof produtos.$inferSelect;
export type Mesa = typeof mesas.$inferSelect;
export type Comanda = typeof comandas.$inferSelect;
export type ItemComanda = typeof itensComanda.$inferSelect;
export type Venda = typeof vendas.$inferSelect;

export type InsertCategoria = z.infer<typeof insertCategoriaSchema>;
export type InsertProduto = z.infer<typeof insertProdutoSchema>;
export type InsertMesa = z.infer<typeof insertMesaSchema>;
export type InsertComanda = z.infer<typeof insertComandaSchema>;
export type InsertItemComanda = z.infer<typeof insertItemComandaSchema>;
export type InsertVenda = z.infer<typeof insertVendaSchema>;

// Extended types for API responses
export type ProdutoComCategoria = Produto & { categoria: Categoria };
export type ComandaCompleta = Comanda & {
  mesa?: Mesa;
  itens: (ItemComanda & { produto: Produto })[];
};
export type RelatorioVendas = {
  totalFaturamento: number;
  totalVendas: number;
  ticketMedio: number;
  produtosVendidos: number;
  vendasPorDia: { data: string; total: number }[];
  produtosMaisVendidos: { produto: Produto; quantidade: number; faturamento: number }[];
};
