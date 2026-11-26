import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckSquare, Calendar, CheckCircle2, AlertCircle, 
  ChevronRight, Edit2, FileText, MessageSquare, Activity, 
  ListTodo, User, Building, Trash2, X, Plus
} from 'lucide-react';

const ALL_STATUSES = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked', 'Cancelled'];

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Review': 'bg-purple-100 text-purple-800 border-purple-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Blocked': 'bg-red-100 text-red-800 border-red-200',
  'Cancelled': 'bg-gray-200 text-gray-500 border-gray-300',
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-700 border-gray-200',
  'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Urgent': 'bg-red-50 text-red-700 border-red-200',
};

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Forms
  const [statusVal, setStatusVal] = useState('');
  const [progressVal, setProgressVal] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const tasks = JSON.parse(localStorage.getItem('rkr_tasks') || '[]');
    const found = tasks.find(t => t.id.toString() === id);
    if (found) {
      if (!found.checklist) found.checklist = [];
      if (!found.comments) found.comments = [];
      if (!found.activities) found.activities = [];
      setTask(found);
      setStatusVal(found.status);
      setProgressVal(found.progress || 0);
    }
  };

  const saveUpdates = (updatedTask) => {
    const tasks = JSON.parse(localStorage.getItem('rkr_tasks') || '[]');
    const newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    localStorage.setItem('rkr_tasks', JSON.stringify(newTasks));
    setTask(updatedTask);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (statusVal === task.status) {
      setShowStatusModal(false);
      return;
    }
    const newAct = { id: Date.now(), type: 'Status Changed', desc: `Task status updated to ${statusVal}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...task, 
      status: statusVal, 
      progress: statusVal === 'Completed' ? 100 : task.progress,
      updated_at: new Date().toISOString(),
      activities: [newAct, ...task.activities]
    });
    setShowStatusModal(false);
  };

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    const newAct = { id: Date.now(), type: 'Progress Updated', desc: `Task progress updated to ${progressVal}%`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...task, 
      progress: parseInt(progressVal), 
      updated_at: new Date().toISOString(),
      activities: [newAct, ...task.activities]
    });
    setShowProgressModal(false);
  };

  const handleMarkComplete = () => {
    if (task.status === 'Completed') return;
    const newAct = { id: Date.now(), type: 'Task Completed', desc: `Task marked as completed.`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...task, 
      status: 'Completed', 
      progress: 100,
      updated_at: new Date().toISOString(),
      activities: [newAct, ...task.activities]
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    const commentObj = {
      id: Date.now(),
      text: newComment,
      user: 'Admin',
      date: new Date().toISOString()
    };
    const newAct = { id: Date.now()+1, type: 'Comment Added', desc: `Admin added a comment.`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...task,
      comments: [...task.comments, commentObj],
      updated_at: new Date().toISOString(),
      activities: [newAct, ...task.activities]
    });
    setNewComment('');
  };

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if(!newChecklistItem.trim()) return;
    const itemObj = { id: Date.now(), text: newChecklistItem, completed: false };
    const newAct = { id: Date.now()+1, type: 'Checklist Updated', desc: `Added checklist item: ${newChecklistItem}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...task,
      checklist: [...task.checklist, itemObj],
      updated_at: new Date().toISOString(),
      activities: [newAct, ...task.activities]
    });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId) => {
    const updatedChecklist = task.checklist.map(item => {
      if(item.id === itemId) return { ...item, completed: !item.completed };
      return item;
    });
    saveUpdates({ ...task, checklist: updatedChecklist, updated_at: new Date().toISOString() });
  };

  const deleteChecklistItem = (itemId) => {
    const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
    saveUpdates({ ...task, checklist: updatedChecklist, updated_at: new Date().toISOString() });
  };

  if (!task) return <div className="p-12 text-center font-bold text-gray-500">Loading Task...</div>;

  const checklistProgress = task.checklist.length > 0 
    ? Math.round((task.checklist.filter(i => i.completed).length / task.checklist.length) * 100) 
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6 pb-20">
      
      {/* HEADER BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
        <Link to="/dashboard/tasks" className="hover:text-blue-600 transition-colors">Tasks</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate max-w-[200px]">{task.title}</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4 w-full">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm mt-1">
            <CheckSquare size={28} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{task.title}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[task.status] || 'bg-gray-100 text-gray-600'}`}>
                {task.status}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                {task.priority} Priority
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><Building size={16} className="text-gray-400"/> {task.project_name}</span>
              <span className="flex items-center gap-1.5"><User size={16} className="text-gray-400"/> {task.client_name}</span>
              <span className="flex items-center gap-1.5 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">{task.assignee.charAt(0)}</div>
                {task.assignee}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {task.status !== 'Completed' && (
            <button onClick={handleMarkComplete} className="flex-1 xl:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-green-700">
              <CheckCircle2 size={16} /> Mark Complete
            </button>
          )}
          <button onClick={() => setShowStatusModal(true)} className="flex-1 xl:flex-none px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer bg-white">
            <Edit2 size={16} /> Change Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description || 'No description provided for this task.'}</p>
          </div>

          {/* CHECKLIST */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><ListTodo size={18} className="text-indigo-500"/> Sub-task Checklist</h3>
              {task.checklist.length > 0 && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{checklistProgress}% Completed</span>}
            </div>
            
            {task.checklist.length > 0 && (
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className={`h-full transition-all duration-500 ${checklistProgress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{width: `${checklistProgress}%`}}></div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {task.checklist.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors group ${item.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleChecklistItem(item.id)}>
                    {item.completed ? <CheckCircle2 size={18} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                    <span className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.text}</span>
                  </div>
                  <button onClick={() => deleteChecklistItem(item.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-colors" placeholder="Add new checklist item..." value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} />
              <button type="submit" disabled={!newChecklistItem.trim()} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer">Add</button>
            </form>
          </div>

          {/* COMMENTS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2"><MessageSquare size={18} className="text-orange-500"/> Comments</h3>
            
            <div className="space-y-6 mb-6">
              {task.comments.length > 0 ? task.comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 border border-blue-200 text-sm">
                    {comment.user.charAt(0)}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 text-sm">{comment.user}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-400 font-medium">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3 items-start border-t border-gray-100 pt-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                A
              </div>
              <div className="flex-1 space-y-2">
                <textarea className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors resize-none min-h-[80px]" placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)}></textarea>
                <div className="flex justify-end">
                  <button type="submit" disabled={!newComment.trim()} className="px-5 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm">Post Comment</button>
                </div>
              </div>
            </form>
          </div>
          
        </div>
        
        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* TRACKING CARDS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setShowProgressModal(true)}>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Activity size={16} className="text-blue-500"/> Progress Status</h3>
              <span className="text-[10px] text-blue-600 font-bold group-hover:underline">Update</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <h3 className="text-4xl font-black text-gray-900">{task.progress}%</h3>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
              <div className={`h-full transition-all duration-500 ${task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${task.progress}%`}}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><Calendar size={16} className="text-red-500"/> Deadline Tracking</h3>
             <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
               <h4 className={`text-2xl font-black ${task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed' ? 'text-red-600' : 'text-gray-900'}`}>
                 {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'}) : 'No Deadline'}
               </h4>
               {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed' && (
                 <p className="text-xs font-bold text-red-500 mt-2 uppercase tracking-wider">Overdue</p>
               )}
             </div>
          </div>

          {/* ACTIVITY LOG */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6"><Activity size={16} className="text-green-500"/> Timeline History</h3>
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-6 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
              {task.activities.map(act => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{act.type}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{act.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {new Date(act.date).toLocaleDateString()} - {new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Update Task Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6">
              <label className="block text-xs font-bold text-gray-700 mb-2">Select new status</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none cursor-pointer text-sm" value={statusVal} onChange={e => setStatusVal(e.target.value)}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 cursor-pointer shadow-sm">Save Change</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PROGRESS MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Update Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProgress} className="p-6">
              <label className="block text-xs font-bold text-gray-700 mb-2">Progress Percentage (0-100)</label>
              <input type="number" min="0" max="100" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none text-sm" value={progressVal} onChange={e => setProgressVal(e.target.value)} />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowProgressModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 cursor-pointer shadow-sm">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
