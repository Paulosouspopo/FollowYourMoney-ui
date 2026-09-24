import { useState } from 'react';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { InboxList } from '../components/InboxList';
import { AlertRulesList } from '../components/AlertRulesList';
import { ReportSettingsCard } from '../components/ReportSettingsCard';
import { useUnreadCount } from '../api/notification.api';

type Tab = 'inbox' | 'rules' | 'report';

/** Onglet Alertes : notifications reçues, règles d'alerte, rapport périodique. */
export default function AlertsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const unread = useUnreadCount().data ?? 0;

  return (
    <div className="space-y-4 pt-2">
      <h1 className="text-lg font-semibold">Alertes</h1>
      <SegmentedControl<Tab> fullWidth value={tab} onChange={setTab} options={[
        { value: 'inbox', label: unread ? `Reçues (${unread})` : 'Reçues' },
        { value: 'rules', label: 'Mes alertes' },
        { value: 'report', label: 'Rapport' },
      ]} />
      {tab === 'inbox' && <InboxList />}
      {tab === 'rules' && <AlertRulesList />}
      {tab === 'report' && <ReportSettingsCard />}
    </div>
  );
}
