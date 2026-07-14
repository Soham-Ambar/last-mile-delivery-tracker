import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import DataTable from '../../components/Table/DataTable';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import TextArea from '../../components/Forms/TextArea';
import TextInput from '../../components/Forms/TextInput';
import * as zoneApi from '../../services/zoneApi';

interface Zone {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function Zones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Zone | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadZones = async () => {
    setLoading(true);
    try {
      const response = await zoneApi.getZones();
      setZones(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load zones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const resetForm = () => {
    setSelectedZone(null);
    setName('');
    setDescription('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Zone Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedZone) {
        await zoneApi.updateZone(selectedZone._id, { name, description });
        setSuccess('Zone updated successfully.');
      } else {
        await zoneApi.createZone({ name, description });
        setSuccess('Zone created successfully.');
      }
      resetForm();
      await loadZones();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to save zone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setName(zone.name);
    setDescription(zone.description || '');
    setSuccess('');
    setError('');
  };

  const handleDelete = (zone: Zone) => {
    setDeleteTarget(zone);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await zoneApi.deleteZone(deleteTarget._id);
      setSuccess('Zone deactivated successfully.');
      setModalOpen(false);
      setDeleteTarget(null);
      await loadZones();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to delete zone.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      { header: 'Name', accessor: 'name' as const },
      { header: 'Description', accessor: (row: Zone) => row.description || '—' },
      { header: 'Status', accessor: (row: Zone) => (row.isActive ? 'Active' : 'Inactive') },
      { header: 'Created Date', accessor: (row: Zone) => new Date(row.createdAt).toLocaleDateString() },
    ],
    []
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Zones</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{zones.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Active Zones</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{zones.filter((zone) => zone.isActive).length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 opacity-70">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Areas</p>
          <p className="mt-4 text-4xl font-semibold text-slate-500">Coming Soon</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 opacity-70">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Rate Cards</p>
          <p className="mt-4 text-4xl font-semibold text-slate-500">Coming Soon</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Zone management</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">Create or update a zone</h2>
            </div>
            <PrimaryButton onClick={resetForm}>New Zone</PrimaryButton>
          </div>

          <div className="space-y-4">
            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>}

            <TextInput label="Zone Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter zone name" />
            <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            <PrimaryButton onClick={handleSave} disabled={submitting}>
              {selectedZone ? 'Save Changes' : 'Create Zone'}
            </PrimaryButton>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Existing zones</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">Zone list</h2>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : zones.length === 0 ? (
            <EmptyState title="No zones found" description="Create a zone to begin managing your delivery regions." />
          ) : (
            <DataTable
              columns={columns}
              data={zones}
              renderActions={(zone) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(zone)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(zone)}
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
        title="Deactivate Zone"
        description="Are you sure you want to deactivate this Zone?"
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
        loading={submitting}
      />
    </div>
  );
}
