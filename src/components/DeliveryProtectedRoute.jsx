import React from 'react';
import { Navigate } from 'react-router-dom';

const DeliveryProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('delivery_token');
  const deliveryPerson = localStorage.getItem('delivery_person');

  // If not authenticated, redirect to delivery login
  if (!token || !deliveryPerson) {
    return <Navigate to="/delivery/login" replace />;
  }

  return children;
};

export default DeliveryProtectedRoute;
