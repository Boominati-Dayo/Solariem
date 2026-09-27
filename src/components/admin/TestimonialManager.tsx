'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  X, 
  CheckCircle, 
  XCircle,
  Star,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  picture: string;
  isActive: boolean;
  createdAt: string;
}

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: '5.0',
    picture: '',
    isActive: true
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (data.success) setTestimonials(data.data);
    } catch (err) {
      showError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenModal = (item?: Testimonial) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        role: item.role || '',
        content: item.content,
        rating: item.rating.toString(),
        picture: item.picture,
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        role: '',
        content: '',
        rating: '5.0',
        picture: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/admin/testimonials/${editingItem._id}` : '/api/admin/testimonials';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Testimonial ${editingItem ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchTestimonials();
      } else {
        showError(data.error || 'Operation failed');
      }
    } catch (err) {
      showError('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Testimonial deleted');
        fetchTestimonials();
      }
    } catch (err) {
      showError('Failed to delete');
    }
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Testimonial Authority</h2>
          <p className="text-sm text-gray-500">Manage client feedback and social proof</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-navy-50 rounded-xl font-bold text-sm hover:bg-navy-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Protocol Entry
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search testimonials..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Intelligence...</p>
          </div>
        ) : filteredTestimonials.length > 0 ? (
          filteredTestimonials.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="h-40 bg-navy-900 relative overflow-hidden">
                <img src={t.picture} alt={t.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenModal(t)} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-primary-500 hover:text-white transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 text-primary-500 fill-primary-500" />
                  <span className="text-white text-[10px] font-bold">{t.rating}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-navy-900">{t.name}</h3>
                    <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest">{t.role}</p>
                  </div>
                  {t.isActive ? (
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">{t.content}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Added {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-50">
            <MessageSquare className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No feedback intel found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="p-6 mobile:p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-navy-900">{editingItem ? 'Edit Protocol Entry' : 'Initial Recovery Feedback'}</h3>
                <p className="text-xs text-gray-500">Documenting user-authenticated success</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 mobile:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Testimonee Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-navy-900"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role / Title</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-navy-900"
                    placeholder="e.g. Fraud Recovery Client"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rating (1-5)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-navy-900"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile/Case Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    required
                    type="url"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-navy-900 text-sm"
                    placeholder="https://..."
                    value={formData.picture}
                    onChange={(e) => setFormData({...formData, picture: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Intelligence Payload (Content)</label>
                <textarea
                  required
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-navy-900 min-h-[120px] text-sm"
                  placeholder="The user's success story..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-xs font-bold text-navy-900 uppercase tracking-widest">Publicly Visible</label>
              </div>

              <button type="submit" className="w-full py-4 bg-navy-900 text-navy-50 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-navy-900/10 hover:bg-navy-800 transition-all">
                {editingItem ? 'Update Intelligence' : 'Authorize Publication'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManager;
