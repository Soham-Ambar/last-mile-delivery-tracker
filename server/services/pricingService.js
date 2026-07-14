const RateCard = require('../models/RateCard');

function computeVolumetricWeight(length, breadth, height) {
  if (!length || !breadth || !height) return 0;
  return (length * breadth * height) / 5000;
}

function getPricingForOrderType(rateCard, orderType) {
  const key = orderType === 'B2B' ? 'b2b' : 'b2c';
  const p = rateCard.pricing?.[key];
  if (p) return p;
  if (rateCard.baseRate !== undefined) {
    return {
      baseRate: rateCard.baseRate,
      ratePerKg: rateCard.ratePerKg,
      minimumCharge: rateCard.minimumCharge,
      codCharge: rateCard.codCharge,
    };
  }
  return null;
}

async function calculateDeliveryPrice({
  sourceZone,
  destinationZone,
  weight = 0,
  length,
  breadth,
  height,
  paymentMode,
  orderType = 'B2C',
}) {
  const rateCard = await RateCard.findOne({
    sourceZone,
    destinationZone,
    isActive: true,
  })
    .populate('sourceZone', 'name')
    .populate('destinationZone', 'name');

  if (!rateCard) {
    const error = new Error(
      `No rate card found for source zone [${sourceZone}] and destination zone [${destinationZone}]. Ensure a rate card exists for this zone pair and is active.`
    );
    error.statusCode = 404;
    throw error;
  }

  const actualWeight = weight;
  const volumetricWeight = computeVolumetricWeight(length, breadth, height);
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);

  const pricing = getPricingForOrderType(rateCard, orderType);

  if (!pricing) {
    const error = new Error(`Pricing configuration missing for order type ${orderType} on rate card "${rateCard.name}"`);
    error.statusCode = 500;
    throw error;
  }

  const baseRate = pricing.baseRate;
  const ratePerKg = pricing.ratePerKg;
  const minimumCharge = pricing.minimumCharge;
  const codCharge = pricing.codCharge;

  const weightCharge = chargeableWeight * ratePerKg;
  const calculated = baseRate + weightCharge;
  const totalBeforeCOD = Math.max(calculated, minimumCharge);
  const minimumChargeApplied = totalBeforeCOD > calculated;

  const isCOD = paymentMode === 'COD';
  const codChargeApplied = isCOD ? codCharge : 0;
  const totalPrice = totalBeforeCOD + codChargeApplied;

  return {
    baseRate,
    ratePerKg,
    weightCharge,
    minimumChargeApplied,
    actualWeight,
    volumetricWeight,
    chargeableWeight,
    codCharge: codChargeApplied,
    estimatedDeliveryDays: rateCard.estimatedDeliveryDays,
    totalPrice,
    rateCard: {
      id: rateCard._id,
      name: rateCard.name,
      sourceZone: rateCard.sourceZone?.name,
      destinationZone: rateCard.destinationZone?.name,
    },
  };
}

module.exports = {
  calculateDeliveryPrice,
};
