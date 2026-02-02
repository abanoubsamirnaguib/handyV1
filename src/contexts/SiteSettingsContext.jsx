import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
};

export const SiteSettingsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Use React Query to fetch and cache site settings
  const { data, isLoading } = useQuery({
    queryKey: ['siteSettings', 'general'],
    queryFn: async () => {
      const data = await api.getGeneralSiteSettings();
      return {
        siteDescription: data.siteDescription || 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
        maintenanceMode: data.maintenanceMode || false,
        registrationsEnabled: data.registrationsEnabled !== false,
        contactPhone: data.contactPhone || '+20 01068644570',
        contactEmail: data.contactEmail || 'officialbazar64@gmail.com',
        contactAddress: data.contactAddress || 'شارع الحرفيين، الفيوم ، مصر',
        workingHours: data.workingHours || 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
        transactionNumber: data.transactionNumber || '',
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  const settings = data || {
    siteDescription: 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
    maintenanceMode: false,
    registrationsEnabled: true,
    contactPhone: '+20 01068644570',
    contactEmail: 'officialbazar64@gmail.com',
    contactAddress: 'شارع الحرفيين، الفيوم ، مصر',
    workingHours: 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
    transactionNumber: '',
  };

  const refreshSettings = () => {
    // Invalidate cache to force refetch
    queryClient.invalidateQueries(['siteSettings', 'general']);
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading: isLoading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

