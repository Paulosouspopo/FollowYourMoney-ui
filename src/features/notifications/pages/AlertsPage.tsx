import { useState } from 'react';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { InboxList } from '../components/InboxList';
import { AlertRulesList } from '../components/AlertRulesList';
import { ReportSettingsCard } from '../components/ReportSettingsCard';
import { useUnreadCount } from '../api/notification.api';
import { TOURS } from '@/features/guide/tours';
import { usePageTour } from '@/shared/tour/usePageTour';
import { TourButton } from '@/shared/tour/TourButton';

type Tab = 'inbox' | 'rules' | 'report';

/** Onglet Alertes : notifications reçues, règles d'alerte, rapport périodique. */
export default function AlertsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const unread = useUnreadCount().data ?? 0;
  usePageTour(TOURS.alerts);

  return (
    <div className="space-y-4 pt-4 lg:max-w-2xl">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Alertes</h1>
        <TourButton tour={TOURS.alerts} />
      </header>
      <div data-tour="alerts-tabs">
        <SegmentedControl<Tab> fullWidth value={tab} onChange={setTab} options={[
          { value: 'inbox', label: unread ? `Reçues (${unread})` : 'Reçues' },
          { value: 'rules', label: 'Mes alertes' },
          { value: 'report', label: 'Rapport' },
        ]} />
      </div>
      {tab === 'inbox' && <InboxList />}
      {tab === 'rules' && <AlertRulesList />}
      {tab === 'report' && <ReportSettingsCard />}
    </div>
  );
}
