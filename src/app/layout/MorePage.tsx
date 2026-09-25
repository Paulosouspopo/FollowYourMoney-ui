import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { PrivacyToggle } from '@/shared/privacy/PrivacyToggle';
import { MORE_SECTIONS } from './nav';

/** Onglet « Plus » (mobile) : pages d'analyse et réglages. La liste vient de `MORE_SECTIONS`. */
export default function MorePage() {
  return (
    <div className="space-y-6 pt-4 lg:max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Plus</h1>
      {MORE_SECTIONS.map(section => (
        <section key={section.title}>
          <SectionHeader title={section.title} />
          <Card className="p-0 gap-0">
            <ul className="divide-y divide-border">
              {section.items.map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                      <item.icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ))}
      <PrivacyToggle withLabel className="w-full justify-center rounded-xl border border-border" />
    </div>
  );
}
