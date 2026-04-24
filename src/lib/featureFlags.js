// Central place to temporarily enable/disable incomplete features.
// Keep this minimal and import it where needed.

export const FEATURE_FLAGS = {
  // Deposit (down payment) flows (chat buttons/modals, deposit UI)
  enableDeposit: false,

  // Gig/Service flows ("حرفة")
  enableGigs: false,
};

export const getEffectiveProductType = (type) => {
  if (!FEATURE_FLAGS.enableGigs) {
    return 'product';
  }
  return type || 'product';
};
