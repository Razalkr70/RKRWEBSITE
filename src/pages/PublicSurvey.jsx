import React from 'react';
import { useParams } from 'react-router-dom';

const PublicSurvey = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">Survey</h1>
        <p className="text-gray-600 mb-6">Loading survey details for ID: {id}</p>
        {/* Further implementation for the public survey will go here */}
      </div>
    </div>
  );
};

export default PublicSurvey;
