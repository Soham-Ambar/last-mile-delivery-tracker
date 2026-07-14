import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import TextInput from '../components/Forms/TextInput';
import TextArea from '../components/Forms/TextArea';
import SelectInput from '../components/Forms/SelectInput';
import LoadingSpinner from '../components/Spinner/LoadingSpinner';
import * as orderApi from '../services/orderApi';
import * as areaApi from '../services/areaApi';
import * as pricingApi from '../services/pricingApi';
import * as userApi from '../services/userApi';

interface Area {
  _id: string;
  name: string;
  city?: string;
  zone: { _id: string; name: string };
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface PricePreview {
  baseRate: number;
  weightCharge: number;
  codCharge: number;
  minimumChargeApplied: boolean;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  estimatedDeliveryDays: number;
  totalPrice: number;
}

const PARCEL_OPTIONS = [
  { value: 'Document', label: 'Document' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Food', label: 'Food' },
  { value: 'Other', label: 'Other' },
];

const PAYMENT_OPTIONS = [
  { value: 'Prepaid', label: 'Prepaid' },
  { value: 'COD', label: 'Cash on Delivery' },
];

const ORDER_TYPE_OPTIONS = [
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B', label: 'B2B' },
];

export default function OrderForm({ adminMode }: { adminMode?: boolean }) {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [pickupName, setPickupName] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupArea, setPickupArea] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [parcelType, setParcelType] = useState('');
  const [parcelWeight, setParcelWeight] = useState('');
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [height, setHeight] = useState('');
  const [orderType, setOrderType] = useState('B2C');
  const [paymentMode, setPaymentMode] = useState('');
  const [notes, setNotes] = useState('');

  const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    areaApi.getActiveAreas().then((res) => {
      setAreas(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (adminMode) {
      userApi.getCustomers().then((res) => {
        setCustomers(res.data.data);
      }).catch(() => {});
    }
  }, [adminMode]);

  const areaOptions = useMemo(
    () => areas.map((a) => ({ value: a._id, label: `${a.name}${a.city ? ` (${a.city})` : ''}` })),
    [areas]
  );

  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: c._id, label: `${c.name} (${c.email})` })),
    [customers]
  );

  const selectedPickupZone = useMemo(
    () => areas.find((a) => a._id === pickupArea)?.zone?._id,
    [areas, pickupArea]
  );

  const selectedDeliveryZone = useMemo(
    () => areas.find((a) => a._id === deliveryArea)?.zone?._id,
    [areas, deliveryArea]
  );

  const canPreview = pickupArea && deliveryArea && parcelWeight && paymentMode && pickupArea !== deliveryArea && selectedPickupZone && selectedDeliveryZone;

  useEffect(() => {
    if (!canPreview) {
      setPricePreview(null);
      return;
    }

    const weight = parseFloat(parcelWeight);
    if (isNaN(weight) || weight <= 0) {
      setPricePreview(null);
      return;
    }

    const len = length ? parseFloat(length) : undefined;
    const wid = breadth ? parseFloat(breadth) : undefined;
    const hei = height ? parseFloat(height) : undefined;

    setPreviewLoading(true);
    pricingApi.getPricingEstimate({
      sourceZone: selectedPickupZone!,
      destinationZone: selectedDeliveryZone!,
      weight,
      length: len,
      breadth: wid,
      height: hei,
      paymentMode,
      orderType,
    }).then((res) => {
      const d = res.data.data;
      setPricePreview({
        baseRate: d.baseRate,
        weightCharge: d.weightCharge,
        codCharge: d.codCharge,
        minimumChargeApplied: d.minimumChargeApplied,
        actualWeight: d.actualWeight,
        volumetricWeight: d.volumetricWeight,
        chargeableWeight: d.chargeableWeight,
        estimatedDeliveryDays: d.estimatedDeliveryDays,
        totalPrice: d.totalPrice,
      });
    }).catch(() => {
      setPricePreview(null);
    }).finally(() => {
      setPreviewLoading(false);
    });
  }, [pickupArea, deliveryArea, parcelWeight, length, breadth, height, paymentMode, orderType, canPreview, selectedPickupZone, selectedDeliveryZone]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (adminMode && !customerId) { setError('Please select a customer.'); return; }
    if (!pickupName.trim()) { setError('Pickup name is required.'); return; }
    if (!pickupPhone.trim()) { setError('Pickup phone is required.'); return; }
    if (!pickupAddress.trim()) { setError('Pickup address is required.'); return; }
    if (!pickupArea) { setError('Pickup area is required.'); return; }
    if (!receiverName.trim()) { setError('Receiver name is required.'); return; }
    if (!receiverPhone.trim()) { setError('Receiver phone is required.'); return; }
    if (!receiverAddress.trim()) { setError('Receiver address is required.'); return; }
    if (!deliveryArea) { setError('Delivery area is required.'); return; }
    if (pickupArea === deliveryArea) { setError('Pickup and delivery areas must be different.'); return; }
    if (!parcelType) { setError('Parcel type is required.'); return; }
    if (!parcelWeight || parseFloat(parcelWeight) <= 0) { setError('Valid parcel weight is required.'); return; }
    if (!paymentMode) { setError('Payment mode is required.'); return; }

    const payload: any = {
      pickupName: pickupName.trim(),
      pickupPhone: pickupPhone.trim(),
      pickupAddress: pickupAddress.trim(),
      pickupArea,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      receiverAddress: receiverAddress.trim(),
      deliveryArea,
      parcelType,
      parcelWeight: parseFloat(parcelWeight),
      length: length ? parseFloat(length) : undefined,
      breadth: breadth ? parseFloat(breadth) : undefined,
      height: height ? parseFloat(height) : undefined,
      orderType,
      paymentMode,
      notes: notes.trim() || undefined,
    };

    if (adminMode) {
      payload.customerId = customerId;
    }

    setSubmitting(true);
    try {
      if (adminMode) {
        await orderApi.adminCreateOrder(payload);
      } else {
        await orderApi.createOrder(payload);
      }
      setSuccess('Order created successfully!');
      setTimeout(() => navigate(adminMode ? '/admin/orders' : '/customer/orders'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">
          {adminMode ? 'Admin operations' : 'Customer portal'}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {adminMode ? 'Create Order on Behalf' : 'Create a Delivery Order'}
        </h1>
        <p className="mt-2 text-slate-400">Fill in the details below to place a new delivery order.</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{success}</div>}

      {pricePreview && (
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Price Estimate</p>
          {previewLoading && <p className="mt-2 text-xs text-slate-500">Updating...</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Actual Weight</p>
              <p className="text-lg font-semibold text-slate-100">{pricePreview.actualWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Volumetric Weight</p>
              <p className="text-lg font-semibold text-slate-100">{pricePreview.volumetricWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Chargeable Weight</p>
              <p className="text-lg font-semibold text-amber-300">{pricePreview.chargeableWeight.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Delivery Days</p>
              <p className="text-lg font-semibold text-slate-100">{pricePreview.estimatedDeliveryDays}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Base Rate</p>
              <p className="text-lg font-semibold text-slate-100">₹{pricePreview.baseRate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Weight Charge</p>
              <p className="text-lg font-semibold text-slate-100">₹{pricePreview.weightCharge}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">COD Charge</p>
              <p className="text-lg font-semibold text-slate-100">₹{pricePreview.codCharge}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-bold text-emerald-400">₹{pricePreview.totalPrice}</p>
            </div>
          </div>
          {pricePreview.minimumChargeApplied && (
            <p className="mt-2 text-xs text-slate-500">* Minimum charge applied</p>
          )}
        </div>
      )}

      {adminMode && (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-6 text-xl font-semibold text-slate-100">Customer</h2>
          <SelectInput
            label="Select Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={customerOptions}
            placeholder="Choose customer"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-6 text-xl font-semibold text-slate-100">Pickup Details</h2>
          <div className="space-y-4">
            <TextInput label="Name" value={pickupName} onChange={(e) => setPickupName(e.target.value)} placeholder="Sender name" />
            <TextInput label="Phone" type="tel" value={pickupPhone} onChange={(e) => setPickupPhone(e.target.value)} placeholder="Sender phone" />
            <TextArea label="Address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Pickup address" />
            <SelectInput label="Area" value={pickupArea} onChange={(e) => setPickupArea(e.target.value)} options={areaOptions} placeholder="Select pickup area" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="mb-6 text-xl font-semibold text-slate-100">Receiver Details</h2>
          <div className="space-y-4">
            <TextInput label="Name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Receiver name" />
            <TextInput label="Phone" type="tel" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="Receiver phone" />
            <TextArea label="Address" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Delivery address" />
            <SelectInput label="Area" value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value)} options={areaOptions} placeholder="Select delivery area" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-100">Parcel & Payment</h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <SelectInput label="Parcel Type" value={parcelType} onChange={(e) => setParcelType(e.target.value)} options={PARCEL_OPTIONS} placeholder="Select type" />
          <TextInput label="Actual Weight (kg)" type="number" min="0.1" step="0.1" value={parcelWeight} onChange={(e) => setParcelWeight(e.target.value)} placeholder="e.g. 1.5" />
          <TextInput label="Length (cm)" type="number" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 30" />
          <TextInput label="Breadth (cm)" type="number" min="0" step="0.1" value={breadth} onChange={(e) => setBreadth(e.target.value)} placeholder="e.g. 20" />
          <TextInput label="Height (cm)" type="number" min="0" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 15" />
          <SelectInput label="Order Type" value={orderType} onChange={(e) => setOrderType(e.target.value)} options={ORDER_TYPE_OPTIONS} />
          <SelectInput label="Payment Mode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} options={PAYMENT_OPTIONS} placeholder="Select payment" />
          <TextArea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions" />
        </div>
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Creating Order...' : 'Place Order'}
        </PrimaryButton>
      </div>
    </section>
  );
}
