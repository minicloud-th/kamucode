'use client';
import { useState, useEffect } from 'react';
import { api } from './provider';
export function useLoad<T>(endpoint: string) { const [data, setData] = useState<T | null>(null), [error, setError] = useState(''), [version, setVersion] = useState(0); useEffect(() => { let live = true; setData(null); setError(''); api<T>(endpoint).then(d => { if (live)
    setData(d); }).catch(e => { if (live)
    setError(e.message); }); return () => { live = false; }; }, [endpoint, version]); return { data, error, reload: () => setVersion(v => v + 1) }; }
