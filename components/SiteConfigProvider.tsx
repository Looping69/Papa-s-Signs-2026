import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchConfig, type SiteConfig } from '../services/configService';
const ConfigContext = createContext<{
  config: SiteConfig | null;
  loading: boolean;
  refresh: () => Promise<void>;
}>({
  config: null,
  loading: true,
  refresh: async () => {}
});
export function SiteConfigProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      setConfig(await fetchConfig());
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const onRefresh = () => void refresh();
    window.addEventListener('site-config-saved', onRefresh);
    window.addEventListener('focus', onRefresh);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 15000);
    return () => {
      window.removeEventListener('site-config-saved', onRefresh);
      window.removeEventListener('focus', onRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);
  return <ConfigContext.Provider value={{
    config,
    loading,
    refresh
  }}>{children}</ConfigContext.Provider>;
}
export const useSiteConfig = () => useContext(ConfigContext);
