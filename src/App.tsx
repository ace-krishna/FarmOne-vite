/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ExpoGoShell } from './components/simulator/ExpoGoShell';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ExpoGoShell />
      </AuthProvider>
    </LanguageProvider>
  );
}
