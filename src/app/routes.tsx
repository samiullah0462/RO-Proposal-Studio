import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { ProposalsPage } from '../features/proposals/ProposalsPage.tsx';
import { ClientsPage } from '../features/clients/ClientsPage.tsx';
import { CalculatorsPage } from '../features/calculators/CalculatorsPage.tsx';
import { LibraryPage } from '../features/library/LibraryPage.tsx';
import { TemplatesPage } from '../features/templates/TemplatesPage.tsx';
import { SettingsPage } from '../features/settings/SettingsPage.tsx';
import { SelfTestPage } from '../features/dashboard/SelfTestPage.tsx';
import { initAndSeedDatabase } from '../data/db.ts';

export function AppRoutes() {
  useEffect(() => {
    // Seed default rule tables, media catalog, vessel sizes on first run
    initAndSeedDatabase().catch((err) => {
      console.error('Failed to initialize local IndexedDB database:', err);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="calculators" element={<CalculatorsPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="dev/self-test" element={<SelfTestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
