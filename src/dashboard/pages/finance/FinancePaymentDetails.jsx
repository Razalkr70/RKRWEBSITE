import React from 'react';
import { useParams } from 'react-router-dom';

export default function FinancePaymentDetails() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Details: {id}</h3>
        <p className="text-gray-500">Detailed payment view, allocations, and receipts.</p>
      </div>
    </div>
  );
}
