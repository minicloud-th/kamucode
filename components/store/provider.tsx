'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Me, Product } from '@/lib/commerce/types';
export async function api<T = Record<string, unknown>>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST'): Promise<T> { const r = await fetch('/api/store/' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' }); const d = await r.json() as {
    error?: string;
}; if (!r.ok)
    throw Error(d.error || 'ทำรายการไม่สำเร็จ'); return d as T; }
const Context = createContext<{
    me: Me;
    products: Product[];
    refresh: () => Promise<void>;
    updateProducts: () => Promise<void>;
}>({ me: { authenticated: false, registered: false }, products: [], refresh: async () => { }, updateProducts: async () => { } });
export function StoreProvider({ initialMe, products, children }: {
    initialMe: Me;
    products: Product[];
    children: ReactNode;
}) { const [me, setMe] = useState(initialMe), [items, setItems] = useState(products); return <Context.Provider value={{ me, products: items, refresh: async () => { const r = await fetch('/api/me', { cache: 'no-store' }); setMe(await r.json() as Me); }, updateProducts: async () => { const d = await api<{
        products: Product[];
    }>('catalog'); setItems(d.products); } }}>{children}</Context.Provider>; }
export const useStore = () => useContext(Context);
