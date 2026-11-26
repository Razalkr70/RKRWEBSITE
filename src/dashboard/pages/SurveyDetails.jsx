import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, ExternalLink } from 'lucide-react';

export default function SurveyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState(id === 'new' ? '' : 'Customer Satisfaction');
  const [description, setDescription] = useState(id === 'new' ? '' : 'Please rate your experience.');
  
  const [questions, setQuestions] = useState(id === 'new' ? [] : [
    { id: 1, text: 'How satisfied are you with our service?', type: 'rating' },
    { id: 2, text: 'What can we improve?', type: 'text' }
  ]);

  const addQuestion = (type) => {
    setQuestions([...questions, { id: Date.now(), text: '', type }]);
  };

  const removeQuestion = (qId) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const updateQuestionText = (qId, text) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, text } : q));
  };

  const handleSave = () => {
    alert('Survey saved successfully!');
    navigate('/dashboard/surveys');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/surveys')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{id === 'new' ? 'Create Survey' : 'Edit Survey'}</h1>
        <div className="flex-1"></div>
        {id !== 'new' && (
          <a href={/survey/ + id} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
            <ExternalLink size={16} /> Open Public Link
          </a>
        )}
        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          <Save size={16} /> Save Survey
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Customer Feedback 2026"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the purpose of this survey"
            rows="3"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => addQuestion('text')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          <Plus size={16} /> Add Text Question
        </button>
        <button onClick={() => addQuestion('rating')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          <Plus size={16} /> Add Rating Question
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                Question {index + 1} ({q.type})
              </span>
              <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={q.text}
              onChange={(e) => updateQuestionText(q.id, e.target.value)}
              placeholder="Enter your question here..."
            />
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No questions added yet. Use the buttons above to add questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}