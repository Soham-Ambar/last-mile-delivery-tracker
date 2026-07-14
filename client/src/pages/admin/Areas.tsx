import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import DataTable from '../../components/Table/DataTable';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import TextInput from '../../components/Forms/TextInput';
import SelectInput from '../../components/Forms/SelectInput';
import * as areaApi from '../../services/areaApi';
import * as zoneApi from '../../services/zoneApi';

interface Zone {
  _id: string;
  name: string;
}

interface Area {
  _id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  zone: Zone;
  isActive: boolean;
  createdAt: string;
}

export default function Areas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [areaRes, zoneRes] = await Promise.all([areaApi.getAreas(), zoneApi.getZones()]);
      setAreas(areaRes.data.data);
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

  const resetForm = () => {
    setSelectedArea(null);
    setName('');
    setCity('');
    setState('');
    setPincode('');
    setZoneId('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Area name is required.'); return; }
    if (!city.trim()) { setError('City is required.'); return; }
    if (!state.trim()) { setError('State is required.'); return; }
    if (!pincode.trim()) { setError('Pincode is required.'); return; }
    if (!zoneId) { setError('Zone is required.'); return; }

    setSubmitting(true);
    try {
      if (selectedArea) {
        await areaApi.updateArea(selectedArea._id, { name, city, state, pincode, zone: zoneId });
        setSuccess('Area updated successfully.');
      } else {
        await areaApi.createArea({ name, city, state, pincode, zone: zoneId });
        setSuccess('Area created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to save area.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setName(area.name);
    setCity(area.city);
    setState(area.state);
    setPincode(area.pincode);
    setZoneId(area.zone?._id || '');
    setSuccess('');
    setError('');
  };

  const handleDelete = (area: Area) => {
    setDeleteTarget(area);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await areaApi.deleteArea(deleteTarget._id);
      setSuccess('Area deactivated successfully.');
      setModalOpen(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to delete area.');
    } finally {
      setSubmitting(false);
    }
  };

  const zoneOptions = useMemo(
    () => zones.map((z) => ({ value: z._id, label: z.name })),
    [zones]
  );

  const columns = useMemo(
    () => [
      { header: 'Name', accessor: 'name' as const },
      { header: 'City', accessor: 'city' as const },
      { header: 'State', accessor: 'state' as const },
      { header: 'Pincode', accessor: 'pincode' as const },
      { header: 'Zone', accessor: (row: Area) => row.zone?.name || '—' },
      { header: 'Status', accessor: (row: Area) => (row.isActive ? 'Active' : 'Inactive') },
      { header: 'Created Date', accessor: (row: Area) => new Date(row.createdAt).toLocaleDateString() },
    ],
    []
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Areas</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{areas.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Active Areas</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{areas.filter((a) => a.isActive).length}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Area management</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">Create or update an area</h2>
            </div>
            <PrimaryButton onClick={resetForm}>New Area</PrimaryButton>
          </div>

          <div className="space-y-4">
            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>}

            <SelectInput
              label="Zone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              options={zoneOptions}
              placeholder="Select a zone"
            />
            <TextInput label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city name" />
            <TextInput label="State" value={state} onChange={(e) => setState(e.target.value)} placeholder="Enter state name" />
            <TextInput label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode" />
            <PrimaryButton onClick={handleSave} disabled={submitting}>
              {selectedArea ? 'Save Changes' : 'Create Area'}
            </PrimaryButton>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Existing areas</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">Area list</h2>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : areas.length === 0 ? (
            <EmptyState title="No areas found" description="Create an area to begin managing your delivery regions." />
          ) : (
            <DataTable
              columns={columns}
              data={areas}
              renderActions={(area) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(area)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(area)}
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
        title="Deactivate Area"
        description="Are you sure you want to deactivate this Area?"
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
        loading={submitting}
      />
    </div>
  );
}
