import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import DataTable from '../../components/Table/DataTable';
import EmptyState from '../../components/EmptyState/EmptyState';
import LoadingSpinner from '../../components/Spinner/LoadingSpinner';
import TextInput from '../../components/Forms/TextInput';
import SelectInput from '../../components/Forms/SelectInput';
import MultiSelect from '../../components/Forms/MultiSelect';
import * as agentApi from '../../services/agentApi';
import * as areaApi from '../../services/areaApi';

interface Area {
  _id: string;
  name: string;
  city?: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  status: string;
  assignedAreas: Area[];
  isActive: boolean;
  createdAt: string;
}

const VEHICLE_OPTIONS = [
  { value: 'Bike', label: 'Bike' },
  { value: 'Scooter', label: 'Scooter' },
  { value: 'Car', label: 'Car' },
  { value: 'Van', label: 'Van' },
];

const STATUS_OPTIONS = [
  { value: 'Available', label: 'Available' },
  { value: 'Busy', label: 'Busy' },
  { value: 'Offline', label: 'Offline' },
];

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('Available');
  const [assignedAreas, setAssignedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [agentRes, areaRes] = await Promise.all([agentApi.getAgents(), areaApi.getAreas()]);
      setAgents(agentRes.data.data);
      setAreas(areaRes.data.data);
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
    setSelected(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setVehicleType('');
    setStatus('Available');
    setAssignedAreas([]);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!phone.trim()) { setError('Phone is required.'); return; }
    if (!selected && !password.trim()) { setError('Password is required.'); return; }
    if (!vehicleType) { setError('Vehicle type is required.'); return; }

    setSubmitting(true);
    try {
      const payload: any = { name: name.trim(), email: email.trim(), phone: phone.trim(), vehicleType, assignedAreas };
      if (!selected) payload.password = password;
      else if (password.trim()) payload.password = password;

      if (selected) {
        await agentApi.updateAgent(selected._id, payload);
        setSuccess('Agent updated successfully.');
      } else {
        await agentApi.createAgent(payload);
        setSuccess('Agent created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to save agent.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setSelected(agent);
    setName(agent.name);
    setEmail(agent.email);
    setPhone(agent.phone);
    setPassword('');
    setVehicleType(agent.vehicleType);
    setStatus(agent.status);
    setAssignedAreas(agent.assignedAreas?.map((a) => a._id) || []);
    setSuccess('');
    setError('');
  };

  const handleDelete = (agent: Agent) => {
    setDeleteTarget(agent);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await agentApi.deleteAgent(deleteTarget._id);
      setSuccess('Agent deactivated successfully.');
      setModalOpen(false);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to deactivate agent.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (agent: Agent, newStatus: string) => {
    try {
      await agentApi.updateStatus(agent._id, newStatus);
      await loadData();
      setSuccess(`Agent status changed to ${newStatus}.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update status.');
    }
  };

  const areaOptions = useMemo(() => areas.map((a) => ({ value: a._id, label: `${a.name}${a.city ? ` (${a.city})` : ''}` })), [areas]);

  const columns = useMemo(
    () => [
      { header: 'Name', accessor: 'name' as const },
      { header: 'Email', accessor: 'email' as const },
      { header: 'Phone', accessor: 'phone' as const },
      { header: 'Vehicle', accessor: 'vehicleType' as const },
      {
        header: 'Status',
        accessor: (row: Agent) => {
          const colors: Record<string, string> = {
            Available: 'text-emerald-400',
            Busy: 'text-amber-400',
            Offline: 'text-slate-500',
          };
          return <span className={`font-semibold ${colors[row.status] || ''}`}>{row.status}</span>;
        },
      },
      { header: 'Areas', accessor: (row: Agent) => row.assignedAreas?.length || 0 },
      { header: 'Created', accessor: (row: Agent) => new Date(row.createdAt).toLocaleDateString() },
    ],
    []
  );

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total Agents</p>
          <p className="mt-4 text-4xl font-semibold text-slate-100">{agents.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Available</p>
          <p className="mt-4 text-4xl font-semibold text-emerald-400">{agents.filter((a) => a.status === 'Available').length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Busy</p>
          <p className="mt-4 text-4xl font-semibold text-amber-400">{agents.filter((a) => a.status === 'Busy').length}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Offline</p>
          <p className="mt-4 text-4xl font-semibold text-slate-500">{agents.filter((a) => a.status === 'Offline').length}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Agent management</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">{selected ? 'Edit agent' : 'Create an agent'}</h2>
            </div>
            <PrimaryButton onClick={resetForm}>New Agent</PrimaryButton>
          </div>

          <div className="space-y-4">
            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>}

            <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
            <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@example.com" />
            <TextInput label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
            <TextInput
              label={selected ? 'Password (leave blank to keep current)' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={selected ? 'Leave blank to keep' : 'Min 8 characters'}
            />
            <SelectInput
              label="Vehicle Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              options={VEHICLE_OPTIONS}
              placeholder="Select vehicle type"
            />
            <SelectInput
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />
            <MultiSelect
              label="Assigned Areas"
              options={areaOptions}
              values={assignedAreas}
              onChange={setAssignedAreas}
              placeholder="Select areas"
            />
            <PrimaryButton onClick={handleSave} disabled={submitting}>
              {selected ? 'Save Changes' : 'Create Agent'}
            </PrimaryButton>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Existing agents</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">Agent list</h2>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : agents.length === 0 ? (
            <EmptyState title="No agents found" description="Create an agent to start managing delivery personnel." />
          ) : (
            <DataTable
              columns={columns}
              data={agents}
              renderActions={(agent) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(agent)}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) handleStatusChange(agent, e.target.value); }}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    <option value="" disabled>Status</option>
                    {STATUS_OPTIONS.filter((s) => s.value !== agent.status).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(agent)}
                    className="rounded-2xl border border-rose-500 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Deactivate
                  </button>
                </div>
              )}
            />
          )}
        </section>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Deactivate Agent"
        description="Are you sure you want to deactivate this Agent?"
        confirmLabel="Deactivate"
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
        loading={submitting}
      />
    </div>
  );
}
