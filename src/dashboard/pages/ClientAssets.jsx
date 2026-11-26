import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, UploadCloud, Search, Filter, HardDrive, 
  Image as ImageIcon, MoreVertical, Download, Trash2, 
  FolderOpen, LayoutGrid, List, File, Edit, X, Eye, 
  Clock, Upload, CheckSquare, Square, Tag, Archive, 
  RefreshCw, AlertCircle, Plus, Settings, Activity, ArrowUpRight
} from 'lucide-react';

const ASSET_CATEGORIES = [
  "Client Assets", "Requirements", "Brand Assets", "Project Files", 
  "Designs", "Proposals", "Quotations", "Invoices", 
  "Payment Proofs", "Contracts / Agreements", "Deliverables", "Other"
];

const FILE_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'webp', 'svg', 'zip'];

export default function ClientAssets() {
  const [assets, setAssets] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [activities, setActivities] = useState([]);

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filters
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'Active',
    fileType: 'All',
    client: 'All',
    project: 'All',
    tags: [],
    tagMode: 'ANY',
    uploadDate: 'All',
    fileSize: 'All'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');

  // Bulk Actions
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Upload State
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(null); // { file, existingAsset }
  
  const [uploadForm, setUploadForm] = useState({
    name: '', category: 'Client Assets', client: '', project: '', tags: [], notes: ''
  });

  useEffect(() => {
    setAssets(JSON.parse(localStorage.getItem('rkr_assets') || '[]'));
    setClients(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
    setProjects(JSON.parse(localStorage.getItem('rkr_projects') || '[]'));
    setTags(JSON.parse(localStorage.getItem('rkr_tags') || '["website", "logo", "branding", "final", "draft"]'));
    setActivities(JSON.parse(localStorage.getItem('rkr_asset_activities') || '[]'));
  }, []);

  const saveAssets = (newAssets) => {
    setAssets(newAssets);
    localStorage.setItem('rkr_assets', JSON.stringify(newAssets));
  };

  const saveTags = (newTags) => {
    setTags(newTags);
    localStorage.setItem('rkr_tags', JSON.stringify(newTags));
  };

  const logActivity = (action, assetName, details) => {
    const newAct = { id: Date.now().toString(), date: new Date().toISOString(), action, assetName, details };
    const updated = [newAct, ...activities].slice(0, 100);
    setActivities(updated);
    localStorage.setItem('rkr_asset_activities', JSON.stringify(updated));
  };

  // KPI Calculations
  const activeAssets = assets.filter(a => (a.status || 'Active') === 'Active');
  const totalAssets = activeAssets.length;
  const totalSize = activeAssets.reduce((sum, a) => sum + (a.size_mb || 0), 0);
  
  const imgSize = activeAssets.filter(a => ['jpg','jpeg','png','webp','svg'].includes(a.file_type)).reduce((s, a) => s + (a.size_mb || 0), 0);
  const docSize = activeAssets.filter(a => ['doc','docx','xls','xlsx','csv','ppt','pptx'].includes(a.file_type)).reduce((s, a) => s + (a.size_mb || 0), 0);
  const pdfSize = activeAssets.filter(a => a.file_type === 'pdf').reduce((s, a) => s + (a.size_mb || 0), 0);

  // Filter & Sort Logic
  let filteredAssets = assets.filter(a => {
    if (filters.status !== 'All' && (a.status || 'Active') !== filters.status) return false;
    
    const searchMatch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (a.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.client || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.project || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!searchMatch) return false;

    if (filters.category !== 'All' && a.category !== filters.category) return false;
    if (filters.fileType !== 'All' && a.file_type !== filters.fileType) return false;
    if (filters.client !== 'All' && a.client !== filters.client) return false;
    if (filters.project !== 'All' && a.project !== filters.project) return false;

    if (filters.tags.length > 0) {
      const assetTags = a.tags || [];
      if (filters.tagMode === 'ANY') {
        if (!filters.tags.some(t => assetTags.includes(t))) return false;
      } else {
        if (!filters.tags.every(t => assetTags.includes(t))) return false;
      }
    }

    if (filters.fileSize !== 'All') {
      const size = a.size_mb || 0;
      if (filters.fileSize === 'Small' && size > 2) return false;
      if (filters.fileSize === 'Medium' && (size <= 2 || size > 10)) return false;
      if (filters.fileSize === 'Large' && size <= 10) return false;
    }

    if (filters.uploadDate !== 'All') {
      const daysDiff = (new Date() - new Date(a.uploaded_at)) / (1000 * 3600 * 24);
      if (filters.uploadDate === 'Today' && daysDiff > 1) return false;
      if (filters.uploadDate === 'Last 7 Days' && daysDiff > 7) return false;
      if (filters.uploadDate === 'Last 30 Days' && daysDiff > 30) return false;
    }

    return true;
  });

  filteredAssets.sort((a, b) => {
    if (sortBy === 'Newest First') return new Date(b.uploaded_at) - new Date(a.uploaded_at);
    if (sortBy === 'Oldest First') return new Date(a.uploaded_at) - new Date(b.uploaded_at);
    if (sortBy === 'Name A-Z') return a.name.localeCompare(b.name);
    if (sortBy === 'Name Z-A') return b.name.localeCompare(a.name);
    if (sortBy === 'Largest File') return b.size_mb - a.size_mb;
    if (sortBy === 'Smallest File') return a.size_mb - b.size_mb;
    if (sortBy === 'Recently Updated') return new Date(b.updated_at || b.uploaded_at) - new Date(a.updated_at || a.uploaded_at);
    return 0;
  });

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'png': case 'jpg': case 'jpeg': case 'webp': case 'svg': return <ImageIcon className="text-blue-500" size={24} />;
      case 'pdf': return <FileText className="text-red-500" size={24} />;
      default: return <File className="text-gray-500" size={24} />;
    }
  };

  // Upload Logic
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const ext = file.name.split('.').pop().toLowerCase();
      if (!FILE_TYPES.includes(ext)) {
        alert("File type not supported.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert("File size exceeds the allowed limit (50MB).");
        return;
      }

      const existing = assets.find(a => a.original_filename === file.name || a.name === file.name);
      if (existing) {
        setDuplicateWarning({ file, existingAsset: existing });
      } else {
        setUploadFiles([file]);
        setUploadForm({ ...uploadForm, name: file.name.split('.')[0] });
      }
    }
  };

  const confirmUpload = (mode) => {
    const file = duplicateWarning.file;
    if (mode === 'replace') {
      handleReplaceFile(duplicateWarning.existingAsset, file);
      setDuplicateWarning(null);
      setIsUploadOpen(false);
    } else if (mode === 'new') {
      setUploadFiles([file]);
      setUploadForm({ ...uploadForm, name: file.name.split('.')[0] + ' (Copy)' });
      setDuplicateWarning(null);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (uploadFiles.length === 0) return;

    const file = uploadFiles[0];
    const newAsset = {
      asset_id: `AST-${Date.now()}`,
      name: uploadForm.name,
      original_filename: file.name,
      category: uploadForm.category,
      client: uploadForm.client,
      project: uploadForm.project,
      file_type: file.name.split('.').pop().toLowerCase(),
      size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      tags: uploadForm.tags,
      notes: uploadForm.notes,
      status: 'Active',
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      uploaded_by: 'Admin User',
      url: '#',
      version: "1",
      versions: [
        { version_number: "1", date: new Date().toISOString(), size_mb: Number((file.size / (1024 * 1024)).toFixed(2)), uploaded_by: 'Admin User', original_filename: file.name }
      ]
    };

    saveAssets([newAsset, ...assets]);
    logActivity('Asset uploaded', newAsset.name, `Initial version uploaded.`);
    setIsUploadOpen(false);
    setUploadFiles([]);
    setUploadForm({ name: '', category: 'Client Assets', client: '', project: '', tags: [], notes: '' });
  };

  const handleReplaceFile = (asset, file) => {
    const currentV = parseInt(asset.version || "1");
    const newV = (currentV + 1).toString();
    
    const newVersionObj = { 
      version_number: newV, 
      date: new Date().toISOString(), 
      size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      uploaded_by: 'Admin User',
      original_filename: file.name
    };

    const updatedAsset = {
      ...asset,
      original_filename: file.name,
      file_type: file.name.split('.').pop().toLowerCase(),
      size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      version: newV,
      updated_at: new Date().toISOString(),
      versions: [newVersionObj, ...(asset.versions || [])]
    };
    
    saveAssets(assets.map(a => a.asset_id === updatedAsset.asset_id ? updatedAsset : a));
    if (previewAsset?.asset_id === updatedAsset.asset_id) setPreviewAsset(updatedAsset);
    logActivity('Asset replaced', asset.name, `Created Version ${newV}.`);
  };

  const handleReplaceClick = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleReplaceFile(previewAsset, e.target.files[0]);
    }
  };

  const handleRestoreVersion = (asset, versionObj) => {
    const currentV = parseInt(asset.version || "1");
    const newV = (currentV + 1).toString();

    const newVersionObj = { 
      ...versionObj,
      version_number: newV, 
      date: new Date().toISOString(),
      uploaded_by: 'Admin User (Restored)'
    };

    const updatedAsset = {
      ...asset,
      original_filename: versionObj.original_filename,
      size_mb: versionObj.size_mb,
      version: newV,
      updated_at: new Date().toISOString(),
      versions: [newVersionObj, ...(asset.versions || [])]
    };

    saveAssets(assets.map(a => a.asset_id === updatedAsset.asset_id ? updatedAsset : a));
    setPreviewAsset(updatedAsset);
    logActivity('Version restored', asset.name, `Restored from v${versionObj.version_number}, created v${newV}.`);
  };

  const toggleArchive = (asset) => {
    const isArchiving = (asset.status || 'Active') === 'Active';
    const updated = { ...asset, status: isArchiving ? 'Archived' : 'Active', updated_at: new Date().toISOString() };
    saveAssets(assets.map(a => a.asset_id === asset.asset_id ? updated : a));
    if (previewAsset?.asset_id === asset.asset_id) setPreviewAsset(updated);
    logActivity(isArchiving ? 'Asset archived' : 'Asset restored', asset.name, '');
  };

  const handleBulkArchive = () => {
    if (confirm(`Archive ${selectedAssetIds.length} assets?`)) {
      const updated = assets.map(a => selectedAssetIds.includes(a.asset_id) ? { ...a, status: 'Archived', updated_at: new Date().toISOString() } : a);
      saveAssets(updated);
      setSelectedAssetIds([]);
      logActivity('Bulk archived', `${selectedAssetIds.length} assets`, '');
    }
  };

  const handleBulkAddTag = (tag) => {
    const updated = assets.map(a => {
      if (selectedAssetIds.includes(a.asset_id)) {
        const tgs = a.tags || [];
        if (!tgs.includes(tag)) return { ...a, tags: [...tgs, tag], updated_at: new Date().toISOString() };
      }
      return a;
    });
    saveAssets(updated);
    logActivity('Bulk tagged', `${selectedAssetIds.length} assets`, `Added tag: ${tag}`);
  };

  const toggleSelection = (id) => {
    setSelectedAssetIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) setSelectedAssetIds([]);
    else setSelectedAssetIds(filteredAssets.map(a => a.asset_id));
  };

  const deleteTag = (tag) => {
    saveTags(tags.filter(t => t !== tag));
    // Remove from assets
    saveAssets(assets.map(a => ({ ...a, tags: (a.tags || []).filter(t => t !== tag) })));
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-20 text-gray-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A] flex items-center gap-3">
            <FolderOpen size={32} /> Client Assets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Centralized vault for business assets, deliverables, and records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsTagManagerOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Tag size={16} /> Manage Tags
          </button>
          <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 bg-[#1E3A8A] text-white font-medium text-sm px-5 py-2 rounded-lg hover:bg-[#152c6e] transition-colors shadow-sm">
            <UploadCloud size={18} /> Upload Asset
          </button>
        </div>
      </div>

      {/* Storage & Intelligence Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Storage Used</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalSize.toFixed(1)} <span className="text-sm text-gray-400">MB</span></h3>
          <div className="flex gap-2 mt-3 h-1.5 rounded-full overflow-hidden bg-gray-100">
            <div className="bg-blue-500" style={{width: `${(imgSize/totalSize)*100 || 0}%`}}></div>
            <div className="bg-red-500" style={{width: `${(pdfSize/totalSize)*100 || 0}%`}}></div>
            <div className="bg-green-500" style={{width: `${(docSize/totalSize)*100 || 0}%`}}></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-medium">
            <span>Img: {imgSize.toFixed(1)}M</span>
            <span>PDF: {pdfSize.toFixed(1)}M</span>
            <span>Doc: {docSize.toFixed(1)}M</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Active Assets</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalAssets}</h3>
          </div>
          <p className="text-xs text-gray-400 mt-auto">{assets.length - totalAssets} archived</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Activity</p>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[80px] pr-2">
            {activities.length > 0 ? activities.slice(0, 3).map(act => (
              <div key={act.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 truncate max-w-[60%]"><span className="font-medium text-gray-900">{act.assetName}</span> - {act.action}</span>
                <span className="text-gray-400 whitespace-nowrap">{new Date(act.date).toLocaleDateString()}</span>
              </div>
            )) : <p className="text-xs text-gray-400">No recent activity.</p>}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative z-10">
        <div className="flex w-full md:w-auto gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assets, clients, tags, notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen || Object.values(filters).some(v => v !== 'All' && v.length !== 0 && v !== 'ANY') ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none appearance-none bg-white"
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Recently Updated</option>
            <option>Name A-Z</option>
            <option>Name Z-A</option>
            <option>Largest File</option>
            <option>Smallest File</option>
          </select>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1E3A8A]' : 'text-gray-500'}`}><List size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1E3A8A]' : 'text-gray-500'}`}><LayoutGrid size={16} /></button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {isFilterOpen && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
              <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full border-gray-200 rounded-md text-sm py-1.5">
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Archived">Archived Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
              <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="w-full border-gray-200 rounded-md text-sm py-1.5">
                <option value="All">All Categories</option>
                {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">File Type</label>
              <select value={filters.fileType} onChange={e => setFilters({...filters, fileType: e.target.value})} className="w-full border-gray-200 rounded-md text-sm py-1.5">
                <option value="All">All Types</option>
                {FILE_TYPES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Upload Date</label>
              <select value={filters.uploadDate} onChange={e => setFilters({...filters, uploadDate: e.target.value})} className="w-full border-gray-200 rounded-md text-sm py-1.5">
                <option>All</option>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tags (Filter Mode: {filters.tagMode})</label>
              <div className="flex flex-wrap gap-2 items-center">
                {tags.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setFilters({
                      ...filters, 
                      tags: filters.tags.includes(tag) ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag]
                    })}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${filters.tags.includes(tag) ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {tag}
                  </button>
                ))}
                <button onClick={() => setFilters({...filters, tagMode: filters.tagMode === 'ANY' ? 'ALL' : 'ANY'})} className="text-xs text-blue-600 ml-2 hover:underline">Toggle Mode</button>
              </div>
            </div>
            <div className="md:col-span-2 flex items-end justify-end">
               <button onClick={() => setFilters({category: 'All', status: 'Active', fileType: 'All', client: 'All', project: 'All', tags: [], tagMode: 'ANY', uploadDate: 'All', fileSize: 'All'})} className="text-sm text-red-600 font-medium hover:underline">Clear All Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedAssetIds.length > 0 && (
        <div className="bg-[#1E3A8A] text-white p-3 rounded-xl flex items-center justify-between shadow-lg sticky top-4 z-20 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">{selectedAssetIds.length} Selected</span>
            <button onClick={() => setSelectedAssetIds([])} className="text-sm text-white/70 hover:text-white">Clear</button>
          </div>
          <div className="flex items-center gap-3">
            <select onChange={(e) => { if(e.target.value) handleBulkAddTag(e.target.value); e.target.value = ''; }} className="bg-white/10 border border-white/20 rounded text-sm py-1.5 px-2 focus:outline-none text-white appearance-none">
              <option value="" className="text-gray-900">Add Tag...</option>
              {tags.map(t => <option key={t} value={t} className="text-gray-900">{t}</option>)}
            </select>
            <button onClick={handleBulkArchive} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors">
              <Archive size={14}/> Archive
            </button>
          </div>
        </div>
      )}

      {/* Asset List / Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <FolderOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900">No matching assets found</h3>
          <p className="text-gray-500 mt-1">Try changing your search or clearing some filters.</p>
          <button onClick={() => setFilters({category: 'All', status: 'Active', fileType: 'All', client: 'All', project: 'All', tags: [], tagMode: 'ANY', uploadDate: 'All', fileSize: 'All'})} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Clear Filters</button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#1E3A8A]">
                      {selectedAssetIds.length === filteredAssets.length ? <CheckSquare size={18} className="text-[#1E3A8A]"/> : <Square size={18}/>}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Asset Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tags / Category</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Size & Type</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Updated</th>
                  <th className="py-3 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => (
                  <tr key={asset.asset_id} className={`hover:bg-gray-50 transition-colors ${asset.status === 'Archived' ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleSelection(asset.asset_id)} className="text-gray-300 hover:text-[#1E3A8A]">
                        {selectedAssetIds.includes(asset.asset_id) ? <CheckSquare size={18} className="text-[#1E3A8A]"/> : <Square size={18}/>}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPreviewAsset(asset)}>
                        <div className="p-2 bg-white border border-gray-100 shadow-sm rounded-lg shrink-0">
                          {getFileIcon(asset.file_type)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 hover:text-[#1E3A8A]">{asset.name} {asset.status === 'Archived' && <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Archived</span>}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{asset.original_filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">{asset.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {(asset.tags || []).slice(0,3).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">{tag}</span>
                        ))}
                        {(asset.tags || []).length > 3 && <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{asset.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{asset.size_mb} MB</p>
                      <p className="text-xs text-gray-500 uppercase">{asset.file_type}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{new Date(asset.updated_at || asset.uploaded_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">v{asset.version}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                       <button onClick={() => setPreviewAsset(asset)} className="p-1.5 text-gray-400 hover:text-[#1E3A8A] bg-white rounded shadow-sm border border-gray-200"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.asset_id} className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col ${asset.status === 'Archived' ? 'opacity-70' : ''}`}>
              <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative cursor-pointer" onClick={() => setPreviewAsset(asset)}>
                {getFileIcon(asset.file_type)}
                {selectedAssetIds.includes(asset.asset_id) && (
                  <div className="absolute top-2 left-2 bg-white rounded shadow-sm p-0.5 text-[#1E3A8A]"><CheckSquare size={16}/></div>
                )}
                {asset.status === 'Archived' && (
                  <div className="absolute bottom-2 right-2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-70">Archived</div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                   <h4 className="text-sm font-bold text-gray-900 truncate pr-2 cursor-pointer hover:text-[#1E3A8A]" onClick={() => setPreviewAsset(asset)} title={asset.name}>{asset.name}</h4>
                   <button onClick={() => toggleSelection(asset.asset_id)} className="text-gray-300 hover:text-[#1E3A8A]">
                     {selectedAssetIds.includes(asset.asset_id) ? <CheckSquare size={16} className="text-[#1E3A8A]"/> : <Square size={16}/>}
                   </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">{asset.size_mb} MB • .{asset.file_type}</p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {(asset.tags || []).slice(0,2).map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && !duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UploadCloud size={20} className="text-[#1E3A8A]" /> Upload Asset
              </h2>
              <button onClick={() => setIsUploadOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="uploadForm" onSubmit={handleUploadSubmit} className="space-y-6">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1E3A8A] hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <UploadCloud className="mx-auto text-[#1E3A8A] mb-3" size={36} />
                  {uploadFiles.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-gray-900">{uploadFiles[0].name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(uploadFiles[0].size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">Supports PDF, DOCX, XLSX, JPG, PNG, ZIP up to 50MB</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Asset Name</label>
                    <input required type="text" value={uploadForm.name} onChange={e => setUploadForm({...uploadForm, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                    <select value={uploadForm.category} onChange={e => setUploadForm({...uploadForm, category: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
                    <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg p-2 min-h-[42px] bg-gray-50">
                      {uploadForm.tags.map(t => (
                        <span key={t} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs flex items-center gap-1 shadow-sm">
                          {t} <X size={12} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setUploadForm({...uploadForm, tags: uploadForm.tags.filter(x => x !== t)})} />
                        </span>
                      ))}
                      <select onChange={(e) => { if(e.target.value && !uploadForm.tags.includes(e.target.value)) setUploadForm({...uploadForm, tags: [...uploadForm.tags, e.target.value]}); e.target.value = ''; }} className="bg-transparent text-sm focus:outline-none flex-1 min-w-[100px]">
                        <option value="">+ Add tag...</option>
                        {tags.filter(t => !uploadForm.tags.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Related Client</label>
                    <select value={uploadForm.client} onChange={e => setUploadForm({...uploadForm, client: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="">None</option>
                      {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Related Project</label>
                    <select value={uploadForm.project} onChange={e => setUploadForm({...uploadForm, project: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option value="">None</option>
                      {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                    <textarea value={uploadForm.notes} onChange={e => setUploadForm({...uploadForm, notes: e.target.value})} rows="2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsUploadOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button type="submit" form="uploadForm" disabled={uploadFiles.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#152c6e] rounded-lg disabled:opacity-50">Upload Asset</button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">File Already Exists</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">An asset named <strong>{duplicateWarning.existingAsset.name}</strong> with the same filename already exists in the system.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => confirmUpload('replace')} className="w-full py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-[#152c6e]">Replace Existing Asset (Create new version)</button>
              <button onClick={() => confirmUpload('new')} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Upload as New Asset</button>
              <button onClick={() => confirmUpload('cancel')} className="w-full py-2 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-50 border border-transparent hover:border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Manager Modal */}
      {isTagManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Manage Tags</h2>
              <button onClick={() => setIsTagManagerOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const t = e.target.tag.value.trim(); if(t && !tags.includes(t)) { saveTags([...tags, t]); e.target.reset(); } }} className="flex gap-2 mb-6">
              <input name="tag" type="text" placeholder="New tag name..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3A8A]" />
              <button type="submit" className="px-3 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium flex items-center gap-1"><Plus size={16}/> Add</button>
            </form>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {tags.map(t => (
                  <li key={t} className="flex justify-between items-center p-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{t}</span>
                    <button onClick={() => deleteTag(t)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Asset Details & Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Side: Preview Area */}
            <div className="w-full md:w-3/5 bg-gray-50 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 relative">
              <div className="absolute top-4 left-4 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 z-10 flex items-center gap-2">
                <Eye size={14}/> Preview Mode
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center p-8">
                {['jpg','jpeg','png','webp','svg'].includes(previewAsset.file_type) ? (
                   <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      <ImageIcon className="text-gray-300 w-32 h-32" />
                   </div>
                ) : previewAsset.file_type === 'pdf' ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                      <FileText className="text-red-500 w-24 h-24 mb-4" />
                      <p className="text-gray-900 font-bold">PDF Document</p>
                      <p className="text-sm text-gray-500">{previewAsset.original_filename}</p>
                   </div>
                ) : (
                   <div className="text-center">
                     <File className="text-gray-400 w-24 h-24 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-gray-900">{previewAsset.file_type.toUpperCase()} Document</h3>
                     <p className="text-sm text-gray-500 mb-6">{previewAsset.original_filename} • {previewAsset.size_mb} MB</p>
                     <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors mx-auto block">Download File</button>
                   </div>
                )}
              </div>
              
              <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 shrink-0">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A]">
                  <Download size={16}/> Download Original
                </button>
                <div className="flex items-center gap-3">
                  <input type="file" ref={replaceInputRef} onChange={handleReplaceClick} className="hidden" />
                  <button onClick={() => replaceInputRef.current?.click()} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A]">
                    <RefreshCw size={16}/> Replace File
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Metadata & Versions */}
            <div className="w-full md:w-2/5 flex flex-col bg-white">
              <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
                <h3 className="font-bold text-gray-900">Asset Details</h3>
                <button onClick={() => setPreviewAsset(null)} className="p-1.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Header Info */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{previewAsset.name}</h2>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${previewAsset.status === 'Archived' ? 'bg-gray-800 text-white' : 'bg-green-100 text-green-800'}`}>{previewAsset.status || 'Active'}</span>
                  </div>
                  <p className="text-sm text-gray-500">{previewAsset.original_filename}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-900">{previewAsset.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Size</p>
                    <p className="text-sm font-medium text-gray-900">{previewAsset.size_mb} MB</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Uploaded</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(previewAsset.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Version</p>
                    <p className="text-sm font-medium text-gray-900">v{previewAsset.version}</p>
                  </div>
                </div>

                {/* Relationships */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Relationships</h4>
                  {previewAsset.client && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-16">Client:</span>
                      <span className="font-medium text-[#1E3A8A] flex items-center gap-1 cursor-pointer hover:underline">{previewAsset.client} <ArrowUpRight size={14}/></span>
                    </div>
                  )}
                  {previewAsset.project && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-16">Project:</span>
                      <span className="font-medium text-[#1E3A8A] flex items-center gap-1 cursor-pointer hover:underline">{previewAsset.project} <ArrowUpRight size={14}/></span>
                    </div>
                  )}
                  {!previewAsset.client && !previewAsset.project && <p className="text-sm text-gray-400 italic">No linked records</p>}
                </div>

                {/* Tags */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(previewAsset.tags || []).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 text-xs rounded-md shadow-sm">{tag}</span>
                    ))}
                    {(previewAsset.tags || []).length === 0 && <span className="text-sm text-gray-400 italic">No tags</span>}
                  </div>
                </div>

                {/* Version History */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Clock size={14}/> Version History</h4>
                  <div className="space-y-3">
                    {(previewAsset.versions || []).map((ver, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${idx === 0 ? 'border-[#1E3A8A]/30 bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`font-bold text-sm ${idx === 0 ? 'text-[#1E3A8A]' : 'text-gray-700'}`}>Version {ver.version_number} {idx === 0 && <span className="text-[10px] bg-[#1E3A8A] text-white px-1.5 py-0.5 rounded ml-2">CURRENT</span>}</p>
                          <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-[#1E3A8A]" title="Download this version"><Download size={14}/></button>
                            {idx !== 0 && (
                               <button onClick={() => handleRestoreVersion(previewAsset, ver)} className="text-gray-400 hover:text-green-600" title="Restore this version"><RefreshCw size={14}/></button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(ver.date).toLocaleString()} • {ver.uploaded_by}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{ver.original_filename}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between">
                <button onClick={() => toggleArchive(previewAsset)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  <Archive size={16}/> {previewAsset.status === 'Archived' ? 'Restore Asset' : 'Archive Asset'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16}/> Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
