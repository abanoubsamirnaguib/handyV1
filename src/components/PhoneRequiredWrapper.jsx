import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PhoneRequiredModal from './PhoneRequiredModal';

/**
 * Wrapper component that checks if user needs to add phone number
 * Shows modal for users without phone (from Google login or old users)
 */
const PhoneRequiredWrapper = ({ children }) => {
  const { user, updatePhone } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in and doesn't have a phone number
    if (user && !user.phone) {
      setShowPhoneModal(true);
    } else {
      setShowPhoneModal(false);
    }
  }, [user]);

  const handlePhoneSubmit = async (phone) => {
    const success = await updatePhone(phone);
    if (success) {
      setShowPhoneModal(false);
    }
    return success;
  };

  const handleModalClose = () => {
    // User can skip for now, but modal will appear again on next login
    setShowPhoneModal(false);
  };

  return (
    <>
      {children}
      <PhoneRequiredModal
        isOpen={showPhoneModal}
        onClose={handleModalClose}
        onSubmit={handlePhoneSubmit}
        canSkip={true}
      />
    </>
  );
};

export default PhoneRequiredWrapper;
