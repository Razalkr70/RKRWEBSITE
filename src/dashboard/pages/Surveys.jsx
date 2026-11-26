import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';

export default function Surveys() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [surveys, setSurveys] = useState([
    { id: 1, title: 'Customer Satisfaction', status: 'Active', responses: 45, date: '2026-09-01' },
    { id: 2, title: 'Website Feedback', status: 'Draft', responses: 0, date: '2026-09-15' },
  ]);

  const handleCreate = () => {
    navigate('/dashboard/surveys/new');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} /> Create Survey
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search surveys..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Responses</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date Created</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(survey => (
                <tr key={survey.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{survey.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${survey.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {survey.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{survey.responses}</td>
                  <td className="py-3 px-4 text-gray-500">{survey.date}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => navigate(`/dashboard/surveys/${survey.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}