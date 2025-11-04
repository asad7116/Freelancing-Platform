// frontend/src/hooks/useClientDashboardStats.js
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../lib/api';
import { on } from '../lib/eventBus';

export default function useClientDashboardStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet('/client/dashboard');
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    load();

    // refresh after any job/order change
    const offJob = on('job:mutated', load);
    const offOrder = on('order:mutated', load);

    // optional auto refresh every 30s
    const id = setInterval(load, 30000);

    return () => {
      offJob();
      offOrder();
      clearInterval(id);
    };
  }, [load]);

  return { data, loading, refresh: load };
}
