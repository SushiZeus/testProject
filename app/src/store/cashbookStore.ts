import { useEffect, useState } from 'react';
import type { DailyCashBalance } from '@/types';

interface CashbookState {
  records: DailyCashBalance[];
  saveOpening: (date: string, openingBalance: number, userId: string) => DailyCashBalance;
  closeDay: (date: string, expenseItems: DailyCashBalance['expenseItems'], userId: string) => DailyCashBalance | undefined;
  getByDate: (date: string) => DailyCashBalance | undefined;
}

const load = (): DailyCashBalance[] => {
  try {
    return JSON.parse(localStorage.getItem('cashbookStore') || '{"records":[]}').records || [];
  } catch {
    return [];
  }
};

let records = load();
const listeners = new Set<() => void>();
const notify = () => {
  localStorage.setItem('cashbookStore', JSON.stringify({ records }));
  listeners.forEach((listener) => listener());
};

export function useCashbookStore(): CashbookState {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const listener = () => setVersion((version) => version + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    get records() { return records; },
    getByDate: (date) => records.find((record) => record.date === date),
    saveOpening: (date, openingBalance, userId) => {
      const existing = records.find((record) => record.date === date);
      if (existing?.closedAt) return existing;
      const next: DailyCashBalance = existing
        ? { ...existing, openingBalance, closingBalance: openingBalance - existing.expenses, openedBy: userId }
        : { date, openingBalance, expenses: 0, closingBalance: openingBalance, expenseItems: [], openedBy: userId, openedAt: new Date() };
      records = [...records.filter((record) => record.date !== date), next].sort((a, b) => b.date.localeCompare(a.date));
      notify();
      return next;
    },
    closeDay: (date, expenseItems, userId) => {
      const existing = records.find((record) => record.date === date);
      if (!existing) return undefined;
      const expenses = expenseItems.filter((item) => item.currency === 'TZS').reduce((sum, item) => sum + item.amount, 0);
      const next: DailyCashBalance = { ...existing, expenses, expenseItems, closingBalance: existing.openingBalance - expenses, closedBy: userId, closedAt: new Date() };
      records = records.map((record) => record.date === date ? next : record);
      notify();
      return next;
    },
  };
}
