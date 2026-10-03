// demo/Gallery.tsx — a live preview of every component (Phases 2–6).
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  FormField,
  Input,
  Radio,
  Select,
  Switch,
  Textarea,
} from '@/components/primitives';
import { Breadcrumbs, Card, PageHeader, Tabs } from '@/components/layout';
import {
  DataTable,
  EmptyState,
  Pagination,
  Skeleton,
  StatCard,
  type DataTableColumn,
  type DataTableQuery,
} from '@/components/data';
import {
  Combobox,
  CommandPalette,
  DatePicker,
  Drawer,
  DropdownMenu,
  Modal,
  ToastProvider,
  useToast,
} from '@/components/overlay';
import { ChangePassword, ForgotPassword, ResetPassword } from '@/components/auth';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
      <h2 style={{ margin: 0, font: 'var(--type-h2)' }}>{title}</h2>
      {children}
    </section>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
      {children}
    </div>
  );
}

interface PageRow {
  id: string;
  name: string;
  tier: string;
  views: number;
}
const ALL_ROWS: PageRow[] = [
  { id: '1', name: '/services', tier: 'ai', views: 128 },
  { id: '2', name: '/', tier: 'organic', views: 94 },
  { id: '3', name: '/about', tier: 'direct', views: 61 },
  { id: '4', name: '/contact', tier: 'referral', views: 38 },
  { id: '5', name: '/pricing', tier: 'ai', views: 22 },
];
const COLUMNS: DataTableColumn<PageRow>[] = [
  { key: 'name', header: 'Page', sortable: true },
  { key: 'tier', header: 'Source', sortable: true },
  { key: 'views', header: 'Views', sortable: true, align: 'right' },
];

function OverlayShowcase() {
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [cmdk, setCmdk] = useState(false);
  const [fruit, setFruit] = useState('');
  const [date, setDate] = useState('2026-06-15');

  return (
    <>
      <Row>
        <Button onClick={() => setModal(true)}>Open Modal</Button>
        <Button variant="secondary" onClick={() => setDrawer(true)}>
          Open Drawer
        </Button>
        <Button variant="secondary" onClick={() => setCmdk(true)}>
          Command palette
        </Button>
        <Button variant="ghost" onClick={() => toast({ title: 'Saved', tone: 'success' })}>
          Fire toast
        </Button>
        <DropdownMenu
          trigger="Actions ▾"
          items={[
            { id: 'edit', label: 'Edit', onSelect: () => toast({ title: 'Edit' }) },
            { id: 'dup', label: 'Duplicate', onSelect: () => toast({ title: 'Duplicated' }) },
            { id: 'del', label: 'Delete', danger: true, onSelect: () => toast({ title: 'Deleted', tone: 'error' }) },
          ]}
        />
      </Row>
      <Row>
        <Combobox
          aria-label="Fruit"
          value={fruit}
          onChange={setFruit}
          options={[
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
            { value: 'cherry', label: 'Cherry' },
          ]}
        />
        <DatePicker value={date} onChange={setDate} aria-label="Pick a date" />
      </Row>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Confirm publish"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModal(false)}>Publish</Button>
          </>
        }
      >
        This will publish the page to the live site.
      </Modal>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Filters">
        <p>Drawer body content.</p>
      </Drawer>

      <CommandPalette
        open={cmdk}
        onClose={() => setCmdk(false)}
        commands={[
          { id: 'new', label: 'New page', hint: '⌘N', onRun: () => toast({ title: 'New page' }) },
          { id: 'pub', label: 'Publish', hint: '⌘↵', onRun: () => toast({ title: 'Published', tone: 'success' }) },
          { id: 'theme', label: 'Toggle theme', keywords: ['dark', 'light'], onRun: () => {} },
        ]}
      />
    </>
  );
}

export function Gallery() {
  const [tab, setTab] = useState('overview');
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState('a');
  const [on, setOn] = useState(true);
  const [query, setQuery] = useState<DataTableQuery>({ page: 1, pageSize: 3 });
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => {
    const sorted = [...ALL_ROWS];
    if (query.sort) {
      const { column, direction } = query.sort;
      sorted.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[column] as string | number;
        const bv = (b as unknown as Record<string, unknown>)[column] as string | number;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return direction === 'asc' ? cmp : -cmp;
      });
    }
    const start = (query.page - 1) * query.pageSize;
    return sorted.slice(start, start + query.pageSize);
  }, [query]);

  return (
    <ToastProvider>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <Section title="Primitives">
          <Row>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
          </Row>
          <Row>
            <Badge>neutral</Badge>
            <Badge tone="success">success</Badge>
            <Badge tone="warning">warning</Badge>
            <Badge tone="error">error</Badge>
            <Badge tone="accent">accent</Badge>
          </Row>
          <div style={{ display: 'grid', gap: 'var(--space-3)', maxWidth: '22rem' }}>
            <FormField htmlFor="g-input" label="Text input">
              <Input placeholder="Type here" />
            </FormField>
            <FormField htmlFor="g-select" label="Select">
              <Select>
                <option>One</option>
                <option>Two</option>
              </Select>
            </FormField>
            <FormField htmlFor="g-textarea" label="Textarea">
              <Textarea placeholder="Longer text…" rows={3} />
            </FormField>
            <Checkbox label="Checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <Radio name="g-radio" label="Option A" value="a" checked={radio === 'a'} onChange={() => setRadio('a')} />
            <Radio name="g-radio" label="Option B" value="b" checked={radio === 'b'} onChange={() => setRadio('b')} />
            <Switch label="Enabled" checked={on} onChange={(e) => setOn(e.target.checked)} />
          </div>
        </Section>

        <Section title="Layout & shell">
          <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Reports', href: '#' }, { label: 'Analytics' }]} />
          <PageHeader
            title="Analytics"
            description="Website traffic over the last 30 days."
            actions={<Button size="sm">Export</Button>}
          />
          <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'pages', label: 'Pages' }, { id: 'sources', label: 'Sources', disabled: true }]} value={tab} onChange={setTab} aria-label="Report sections" />
          <Card title="A card" actions={<Button size="sm" variant="ghost">Edit</Button>} footer={<Button size="sm">Save</Button>}>
            Cards group related content with an optional header and footer.
          </Card>
        </Section>

        <Section title="Data">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 'var(--space-3)' }}>
            <StatCard label="Total views" value={343} tone="accent" />
            <StatCard label="AI assistants" value={150} hint="44% of total" tone="accent" trend={{ direction: 'up', label: '+12%' }} />
            <StatCard label="Bounce" value="38%" tone="warning" trend={{ direction: 'down', label: '-4%' }} />
          </div>
          <Row>
            <Button size="sm" variant="secondary" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1200); }}>
              Simulate loading
            </Button>
            <Skeleton width={160} height={12} />
          </Row>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            total={ALL_ROWS.length}
            query={query}
            onQueryChange={setQuery}
            rowKey={(r) => r.id}
            loading={loading}
            searchable
            aria-label="Top pages"
          />
          <EmptyState icon="📭" title="Nothing here yet" description="Rows will appear once there is data." action={<Button size="sm">Refresh</Button>} />
          <Pagination page={2} pageSize={10} total={95} onPageChange={() => {}} />
        </Section>

        <Section title="Overlay">
          <OverlayShowcase />
        </Section>

        <Section title="Auth forms">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: 'var(--space-6)' }}>
            <ChangePassword onSubmit={() => {}} />
            <ForgotPassword onSubmit={() => {}} />
            <ResetPassword onSubmit={() => {}} />
          </div>
        </Section>
      </div>
    </ToastProvider>
  );
}
