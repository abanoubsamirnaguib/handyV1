import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// This component handles the delivery root route redirect
const DeliveryRedirect = () => {
  // Always redirect to login for unauthenticated users
  return <Navigate to="/delivery/login" replace />;
};

export default DeliveryRedirect;
