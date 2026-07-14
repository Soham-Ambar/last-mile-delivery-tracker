import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import DataTable from '../../components/Table/DataTable';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import TextInput from '../../components/Forms/TextInput';
import SelectInput from '../../components/Forms/SelectInput';
import * as rateCardApi from '../../services/rateCardApi';
import * as zoneApi from '../../services/zoneApi';

interface Zone {
  _id: string;
  name: string;
}

interface PricingBlock {
  baseRate: number;
  ratePerKg: number;
  minimumCharge: number;
  codCharge: number;
}

interface RateCard {
  _id: string;
  name: string;
  sourceZone: Zone;
  destinationZone: Zone;
  pricing?: {
    b2b?: PricingBlock;
    b2c?: PricingBlock;
  };
  baseRate: number;
  ratePerKg: number;
  minimumCharge: number;
  codCharge: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  sourceZone: string;
  destinationZone: string;
  b2bBaseRate: string;
  b2bRatePerKg: string;
  b2bMinCharge: string;
  b2bCodCharge: string;
  b2cBaseRate: string;
  b2cRatePerKg: string;
  b2cMinCharge: string;
  b2cCodCharge: string;
  estimatedDeliveryDays: string;
}

const emptyForm = (): FormData => ({
  name: '',
  sourceZone: '',
  destinationZone: '',
  b2bBaseRate: '',
  b2bRatePerKg: '',
  b2bMinCharge: '',
  b2bCodCharge: '',
  b2cBaseRate: '',
  b2cRatePerKg: '',
  b2cMinCharge: '',
  b2cCodCharge: '',
  estimatedDeliveryDays: '',
});

export default function RateCards() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selected, setSelected] = useState<RateCard | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RateCard | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [rcRes, zoneRes] = await Promise.all([rateCardApi.getRateCards(), zoneApi.getZones()]);
      setRateCards(rcRes.data.data);
      setZones(zoneRes.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setFormField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelected(null);
    setForm(emptyForm());
  };

  const parsePricingValue = (v: any) => (v != null && !isNaN(Number(v)) ? String(v) : '');

  const handleSave = async () => {
    setError('');
    setSuccess('');

    const { name, sourceZone, destinationZone, estimatedDeliveryDays } = form;

    if (!name.trim()) { setError('Name is required.'); return; }
    if (!sourceZone) { setError('Source zone is required.'); return; }
    if (!destinationZone) { setError('Destination zone is required.'); return; }
    if (sourceZone === destinationZone) { setError('Source and destination zones must be different.'); return; }

    const toNum = (v: string) => parseFloat(v);
    const deliveryDaysNum = parseInt(estimatedDeliveryDays, 10);
    if (isNaN(deliveryDaysNum) || deliveryDaysNum < 1) { setError('Estimated delivery days must be >= 1.'); return; }

    const b2bBase = toNum(form.b2bBaseRate);
    const b2bRate = toNum(form.b2bRatePerKg);
    const b2bMin = toNum(form.b2bMinCharge);
    const b2bCod = toNum(form.b2bCodCharge);
    const b2cBase = toNum(form.b2cBaseRate);
    const b2cRate = toNum(form.b2cRatePerKg);
    const b2cMin = toNum(form.b2cMinCharge);
    const b2cCod = toNum(form.b2cCodCharge);

    if (isNaN(b2bBase) || b2bBase < 0) { setError('B2B base rate must be >= 0.'); return; }
    if (isNaN(b2bRate) || b2bRate < 0) { setError('B2B rate per kg must be >= 0.'); return; }
    if (isNaN(b2bMin) || b2bMin < 0) { setError('B2B minimum charge must be >= 0.'); return; }
    if (isNaN(b2bCod) || b2bCod < 0) { setError('B2B COD charge must be >= 0.'); return; }
    if (isNaN(b2cBase) || b2cBase < 0) { setError('B2C base rate must be >= 0.'); return; }
    if (isNaN(b2cRate) || b2cRate < 0) { setError('B2C rate per kg must be >= 0.'); return; }
    if (isNaN(b2cMin) || b2cMin < 0) { setError('B2C minimum charge must be >= 0.'); return; }
    if (isNaN(b2cCod) || b2cCod < 0) { setError('B2C COD charge must be >= 0.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        sourceZone,
        destinationZone,
        pricing: {
          b2b: { baseRate: b2bBase, ratePerKg: b2bRate, minimumCharge: b2bMin, codCharge: b2bCod },
          b2c: { baseRate: b2cBase, ratePerKg: b2cRate, minimumCharge: b2cMin, codCharge: b2cCod },
        },
        estimatedDeliveryDays: deliveryDaysNum,
      };

      if (selected) {
        await rateCardApi.updateRateCard(selected._id, payload);
        setSuccess('Rate card updated successfully.');
      } else {
        await rateCardApi.createRateCard(payload);
        setSuccess('Rate card created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to save rate card.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rc: RateCard) => {
    setSelected(rc);
    const pricing = rc.pricing;
    const b2b = pricing?.b2b;
    const b2c = pricing?.b2c;
    setForm({
      name: rc.name,
      sourceZone: rc.sourceZone?._id || '',
      destinationZone: rc.destinationZone?._id || '',
      b2bBaseRate: parsePricingValue(b2b?.baseRate ?? rc.baseRate),
      b2bRatePerKg: parsePricingValue(b2b?.ratePerKg ?? rc.ratePerKg),
      b2bMinCharge: parsePricingValue(b2b?.minimumCharge ?? rc.minimumCharge),
      b2bCodCharge: parsePricingValue(b2b?.codCharge ?? rc.codCharge),
      b2cBaseRate: parsePricingValue(b2c?.baseRate ?? rc.baseRate),
      b2cRatePerKg: parsePricingValue(b2c?.ratePerKg ?? rc.ratePerKg),
      b2cMinCharge: parsePricingValue(b2c?.minimumCharge ?? rc.minimumCharge),
      b2cCodCharge: parsePricingValue(b2c?.codCharge ?? rc.codCharge),
      estimatedDeliveryDays: String(rc.estimatedDeliveryDays),
    });
    setSuccess('');
    setError('');
  };

  const handleDelete = (rc: RateCard) => {
    setDeleteTarget(rc);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await rateCardApi.deleteRateCard(deleteTarget._id);
      setSuccess('Rate card deactivated successfully.');
      setModalOpen(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to delete rate card.');
    } finally {
      setSubmitting(false);
    }
  };

  const zoneOptions = useMemo(() => zones.map((z) => ({ value: z._id, label: z.name })), [zones]);

  const fmtPricing = (row: RateCard, field: keyof PricingBlock, prefix?: string) => {
    const p = row.pricing;
    if (prefix === 'B2B' && p?.b2b) return `₹${p.b2b[field]}`;
    if (prefix === 'B2C' && p?.b2c) return `₹${p.b2c[field]}`;
    return `₹${row[field as keyof Pick<RateCard, 'baseRate' | 'ratePerKg' | 'minimumCharge' | 'codCharge'>]}`;
  };

  const columns = useMemo(
    () => [
      { header: 'Name', accessor: 'name' as const },
      { header: 'Source Zone', accessor: (row: RateCard) => row.sourceZone?.name || '—' },
      { header: 'Destination Zone', accessor: (row: RateCard) => row.destinationZone?.name || '—' },
      { header: 'B2B Base', accessor: (row: RateCard) => fmtPricing(row, 'baseRate', 'B2B') },
      { header: 'B2B /Kg', accessor: (row: RateCard) => fmtPricing(row, 'ratePerKg', 'B2B') },
      { header: 'B2B Min', accessor: (row: RateCard) => fmtPricing(row, 'minimumCharge', 'B2B') },
      { header: 'B2B COD', accessor: (row: RateCard) => fmtPricing(row, 'codCharge', 'B2B') },
      { header: 'B2C Base', accessor: (row: RateCard) => fmtPricing(row, 'baseRate', 'B2C') },
      { header: 'B2C /Kg', accessor: (row: RateCard) => fmtPricing(row, 'ratePerKg', 'B2C') },
      { header: 'B2C Min', accessor: (row: RateCard) => fmtPricing(row, 'minimumCharge', 'B2C') },
      { header: 'B2C COD', accessor: (row: RateCard) => fmtPricing(row, 'codCharge', 'B2C') },
      { header: 'Days', accessor: (row: RateCard) => row.estimatedDeliveryDays },
      { header: 'Status', accessor: (row: RateCard) => (row.isActive ? 'Active' : 'Inactive') },
      { header: 'Created', accessor: (row: RateCard) => new Date(row.createdAt).toLocaleDateString() },
    ],
    []
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Rate Cards</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{rateCards.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Active Cards</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{rateCards.filter((rc) => rc.isActive).length}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Rate card management</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">{selected ? 'Edit rate card' : 'Create a rate card'}</h2>
            </div>
            <PrimaryButton onClick={resetForm}>New Card</PrimaryButton>
          </div>

          <div className="space-y-4">
            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>}

            <TextInput
              label="Rate Card Name"
              value={form.name}
              onChange={(e) => setFormField('name', e.target.value)}
              placeholder="e.g. Standard Mumbai-Pune"
            />
            <SelectInput
              label="Source Zone"
              value={form.sourceZone}
              onChange={(e) => setFormField('sourceZone', e.target.value)}
              options={zoneOptions}
              placeholder="Select source zone"
            />
            <SelectInput
              label="Destination Zone"
              value={form.destinationZone}
              onChange={(e) => setFormField('destinationZone', e.target.value)}
              options={zoneOptions}
              placeholder="Select destination zone"
            />
            <div className="rounded-2xl border border-sky-800/40 bg-sky-950/30 p-4">
              <p className="mb-3 text-sm font-semibold text-sky-400">B2B Pricing</p>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Base Rate (₹)" type="number" min="0" step="0.01" value={form.b2bBaseRate} onChange={(e) => setFormField('b2bBaseRate', e.target.value)} placeholder="0.00" />
                <TextInput label="Rate Per Kg (₹)" type="number" min="0" step="0.01" value={form.b2bRatePerKg} onChange={(e) => setFormField('b2bRatePerKg', e.target.value)} placeholder="0.00" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <TextInput label="Minimum Charge (₹)" type="number" min="0" step="0.01" value={form.b2bMinCharge} onChange={(e) => setFormField('b2bMinCharge', e.target.value)} placeholder="0.00" />
                <TextInput label="COD Charge (₹)" type="number" min="0" step="0.01" value={form.b2bCodCharge} onChange={(e) => setFormField('b2bCodCharge', e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="rounded-2xl border border-amber-800/40 bg-amber-950/30 p-4">
              <p className="mb-3 text-sm font-semibold text-amber-400">B2C Pricing</p>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Base Rate (₹)" type="number" min="0" step="0.01" value={form.b2cBaseRate} onChange={(e) => setFormField('b2cBaseRate', e.target.value)} placeholder="0.00" />
                <TextInput label="Rate Per Kg (₹)" type="number" min="0" step="0.01" value={form.b2cRatePerKg} onChange={(e) => setFormField('b2cRatePerKg', e.target.value)} placeholder="0.00" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <TextInput label="Minimum Charge (₹)" type="number" min="0" step="0.01" value={form.b2cMinCharge} onChange={(e) => setFormField('b2cMinCharge', e.target.value)} placeholder="0.00" />
                <TextInput label="COD Charge (₹)" type="number" min="0" step="0.01" value={form.b2cCodCharge} onChange={(e) => setFormField('b2cCodCharge', e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <TextInput
              label="Estimated Delivery Days"
              type="number"
              min="1"
              step="1"
              value={form.estimatedDeliveryDays}
              onChange={(e) => setFormField('estimatedDeliveryDays', e.target.value)}
              placeholder="e.g. 3"
            />
            <PrimaryButton onClick={handleSave} disabled={submitting}>
              {selected ? 'Save Changes' : 'Create Rate Card'}
            </PrimaryButton>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Existing rate cards</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">Rate card list</h2>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : rateCards.length === 0 ? (
            <EmptyState title="No rate cards found" description="Create a rate card to define delivery pricing between zones." />
          ) : (
            <DataTable
              columns={columns}
              data={rateCards}
              renderActions={(rc) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(rc)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rc)}
                    className="rounded-2xl border border-rose-500 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              )}
            />
          )}
        </section>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Deactivate Rate Card"
        description="Are you sure you want to deactivate this Rate Card?"
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
        loading={submitting}
      />
    </div>
  );
}
