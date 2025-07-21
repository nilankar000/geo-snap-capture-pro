import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '@/services/databaseService';
import { ManualGPSData, GPSOverlayTemplate } from '@/types/gps';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [manualGPSData, setManualGPSData] = useState<ManualGPSData[]>([]);
  const [overlayTemplates, setOverlayTemplates] = useState<GPSOverlayTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      await databaseService.initialize();
      setIsInitialized(true);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database initialization failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [gpsData, templates] = await Promise.all([
        databaseService.getManualGPSData(),
        databaseService.getOverlayTemplates()
      ]);
      setManualGPSData(gpsData);
      setOverlayTemplates(templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }, []);

  // Manual GPS Data Methods
  const saveManualGPSData = useCallback(async (data: Omit<ManualGPSData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newData: ManualGPSData = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await databaseService.saveManualGPSData(newData);
      setManualGPSData(prev => [newData, ...prev]);
      return newData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save GPS data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateManualGPSData = useCallback(async (id: string, updates: Partial<ManualGPSData>) => {
    try {
      setLoading(true);
      const existing = manualGPSData.find(data => data.id === id);
      if (!existing) throw new Error('GPS data not found');

      const updated: ManualGPSData = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      await databaseService.saveManualGPSData(updated);
      setManualGPSData(prev => prev.map(data => data.id === id ? updated : data));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update GPS data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [manualGPSData]);

  const deleteManualGPSData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await databaseService.deleteManualGPSData(id);
      setManualGPSData(prev => prev.filter(data => data.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete GPS data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Overlay Template Methods
  const saveOverlayTemplate = useCallback(async (template: Omit<GPSOverlayTemplate, 'id'>) => {
    try {
      setLoading(true);
      const newTemplate: GPSOverlayTemplate = {
        ...template,
        id: Date.now().toString()
      };
      
      await databaseService.saveOverlayTemplate(newTemplate);
      setOverlayTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOverlayTemplate = useCallback(async (id: string, updates: Partial<GPSOverlayTemplate>) => {
    try {
      setLoading(true);
      const existing = overlayTemplates.find(template => template.id === id);
      if (!existing) throw new Error('Template not found');

      const updated: GPSOverlayTemplate = {
        ...existing,
        ...updates
      };

      await databaseService.saveOverlayTemplate(updated);
      setOverlayTemplates(prev => prev.map(template => template.id === id ? updated : template));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [overlayTemplates]);

  const deleteOverlayTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await databaseService.deleteOverlayTemplate(id);
      setOverlayTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isInitialized,
    loading,
    error,
    manualGPSData,
    overlayTemplates,
    saveManualGPSData,
    updateManualGPSData,
    deleteManualGPSData,
    saveOverlayTemplate,
    updateOverlayTemplate,
    deleteOverlayTemplate,
    loadAllData,
    clearError
  };
};