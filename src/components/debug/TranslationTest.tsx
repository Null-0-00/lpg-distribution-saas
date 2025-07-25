'use client';

import { useSettings } from '@/contexts/SettingsContext';

export function TranslationTest() {
  const { settings, t } = useSettings();

  console.log('TranslationTest - Settings:', settings);
  console.log('TranslationTest - Language:', settings.language);
  console.log('TranslationTest - Test translation:', t('salesManagement'));

  return (
    <div style={{ border: '2px solid red', padding: '10px', margin: '10px' }}>
      <h3>Translation Debug Info</h3>
      <p>Current Language: {settings.language}</p>
      <p>Sales Management Translation: {t('salesManagement')}</p>
      <p>Package Sale Translation: {t('packageSale')}</p>
      <p>Loading Translation: {t('loadingData')}</p>
    </div>
  );
}
