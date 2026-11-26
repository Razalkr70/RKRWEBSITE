import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ReportsLayout() {
  return (
    <div className="reports-layout">
      <Outlet />
    </div>
  );
}
