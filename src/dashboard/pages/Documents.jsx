import React, { useState } from 'react';
import { Search, FileText, Download, Trash2, Upload, FileImage, FileCode } from 'lucide-react';
import './Leads.css';

const INITIAL_DOCS = [
  { id: 1, name: 'Q3_Invoice_TechFlow.pdf', type: 'pdf', size: '2.4 MB', date: 'Oct 20, 2026' },
  { id: 2, name: 'Project_Proposal_v2.docx', type: 'doc', size: '1.1 MB', date: 'Oct 19, 2026' },
  { id: 3, name: 'Brand_Assets.zip', type: 'zip', size: '15.8 MB', date: 'Oct 15, 2026' },
  { id: 4, name: 'Website_Wireframes.png', type: 'img', size: '4.2 MB', date: 'Oct 10, 2026' },
];

const getFileIcon = (type) => {
  switch(type) {
    case 'pdf': return <FileText size={24} className="text-red-500" />;
    case 'doc': return <FileText size={24} className="text-blue-500" />;
    case 'img': return <FileImage size={24} className="text-purple-500" />;
    case 'zip': return <FileCode size={24} className="text-yellow-600" />;
    default: return <FileText size={24} className="text-gray-500" />;
  }
};

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState(INITIAL_DOCS);

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id) => {
    if(confirm('Delete document?')) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  return (
    <div className="leads-page">
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title">Document Manager</h1>
          <p className="page-subtitle">Store and manage your contracts, invoices, and assets.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert("Upload dialog opened")}>
          <Upload size={18} /> Upload File
        </button>
      </div>

      <div className="card leads-card">
        <div className="leads-toolbar">
          <div className="search-container leads-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search documents..." className="search-input" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Date Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="lead-row">
                  <td className="font-medium text-dark flex items-center">
                    <div className="mr-3 p-2 bg-gray-50 rounded-lg">{getFileIcon(doc.type)}</div>
                    {doc.name}
                  </td>
                  <td className="text-muted">{doc.size}</td>
                  <td className="text-muted">{doc.date}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="icon-btn hover:text-primary hover:bg-blue-50" title="Download"><Download size={18} /></button>
                      <button className="icon-btn text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete" onClick={() => handleDelete(doc.id)}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">No documents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
