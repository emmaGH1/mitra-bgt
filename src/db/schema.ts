import { pgTable, text, timestamp, doublePrecision, jsonb } from 'drizzle-orm/pg-core';

// Define the 'trade_logs' table to persist rebalancing orders
export const tradeLogs = pgTable('trade_logs', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  asset: text('asset').notNull(),
  action: text('action').notNull(), // 'BUY' | 'SELL' | 'HOLD'
  price: doublePrecision('price').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  value: doublePrecision('value').notNull(),
  rationale: text('rationale').notNull(),
  txHash: text('tx_hash').notNull(),
});

// Define the 'signals_log' table to persist historical Fed/Macro alerts
export const signalsLog = pgTable('signals_log', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  source: text('source').notNull(),
  headline: text('headline').notNull(),
  sentiment: text('sentiment').notNull(), // 'dovish' | 'hawkish' | 'neutral'
  score: doublePrecision('score').notNull(), // -1.0 to +1.0
  interpretation: text('interpretation').notNull(),
  recommendedAllocation: jsonb('recommended_allocation').notNull(), // Map of asset -> allocation
});
