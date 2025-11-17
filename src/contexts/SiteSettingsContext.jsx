import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [settings, setSettings] = useState({
    siteDescription: 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
    maintenanceMode: false,
    registrationsEnabled: true,
    contactPhone: '+20 123 456 7890',
    contactEmail: 'officialbazar64@gmail.com',
    contactAddress: 'شارع الحرفيين، الفيوم ، مصر',
    workingHours: 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
    transactionNumber: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getGeneralSiteSettings();
      setSettings({
        siteDescription: data.siteDescription || 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.',
        maintenanceMode: data.maintenanceMode || false,
        registrationsEnabled: data.registrationsEnabled !== false,
        contactPhone: data.contactPhone || '+20 01068644570',
        contactEmail: data.contactEmail || 'officialbazar64@gmail.com',
        contactAddress: data.contactAddress || 'شارع الحرفيين، الفيوم ، مصر',
        workingHours: data.workingHours || 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً',
        transactionNumber: data.transactionNumber || '',
      });
    } catch (error) {
      console.error('Error loading site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    loadSettings();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

