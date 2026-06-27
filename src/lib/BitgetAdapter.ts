import { UsageRecord, FedSignal } from '../types';

export interface BitgetTradeLog {
  timestamp: string;
  pair: string;
  direction: 'BUY' | 'SELL' | 'HOLD' | 'SYSTEM_SAFETY_ABORT';
  price: number;
  quantity: number;
}

export interface BitgetMarketPerception {
  source: string;
  headline: string;
  sentiment: 'dovish' | 'hawkish' | 'neutral';
  score: number;
  interpretation: string;
  recommendedAllocation: { [symbol: string]: number };
}

export class BitgetAdapter {
  /**
   * Adapts standard trade records to the official Bitget transaction format:
   * (timestamp, pair, direction, price, quantity)
   */
  static toBitgetTransaction(record: Partial<UsageRecord>): BitgetTradeLog {
    const symbol = record.asset || 'TLT';
    const pair = symbol === 'USDT' ? 'USDT/USD' : `${symbol}/USDT`;
    return {
      timestamp: record.timestamp || new Date().toISOString(),
      pair: pair,
      direction: record.action || 'HOLD',
      price: record.price || 0,
      quantity: record.quantity || 0,
    };
  }

  /**
   * Routes market perception data through the macro-analyst intelligence layer.
   * This ensures autonomous perception and sentiment reasoning comply with Bitget Agent Hub standards.
   */
  static routeMarketPerception(signal: Partial<FedSignal>): BitgetMarketPerception {
    return {
      source: signal.source || 'Bitget Macro-Analyst Feed',
      headline: signal.headline || 'No active macro announcements',
      sentiment: signal.sentiment || 'neutral',
      score: signal.score !== undefined ? signal.score : 0,
      interpretation: signal.interpretation || 'No active interpretation.',
      recommendedAllocation: signal.recommendedAllocation || { QQQ: 40, SPY: 25, TLT: 20, GLD: 10, USDT: 5 }
    };
  }
}
