'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business, Service } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import {
  Layers,
  Plus,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function BusinessServicesPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('45');
  const [category, setCategory] = useState('');

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setServices(store.getAllServicesByBusinessIdAdmin(activeBiz.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const templates: Record<string, { name: string; price: number; duration: number }[]> = {
    'fitness-sports': [
      { name: 'Standard Court Session (60 Mins)', price: 600, duration: 60 },
      { name: 'Peak Hours Floodlight Court (90 Mins)', price: 950, duration: 90 },
      { name: '1-on-1 Coaching Session (45 Mins)', price: 1200, duration: 45 },
    ],
    'health-wellness': [
      { name: 'Dental Checkup & Consultation', price: 500, duration: 30 },
      { name: 'Ultrasonic Teeth Cleaning', price: 800, duration: 45 },
      { name: 'Root Canal Therapy Consultation', price: 700, duration: 30 },
    ],
    'beauty-grooming': [
      { name: 'Signature Haircut & Styling', price: 450, duration: 35 },
      { name: 'Hot Towel Beard Lineup', price: 350, duration: 25 },
      { name: 'Full Grooming Spa Package', price: 999, duration: 60 },
    ],
  };

  const handleApplyTemplate = (tmpl: { name: string; price: number; duration: number }) => {
    setName(tmpl.name);
    setPrice(tmpl.price.toString());
    setDuration(tmpl.duration.toString());
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !name.trim() || !price) return;

    if (editingService) {
      store.updateService(editingService.id, {
        name: name.trim(),
        description: description.trim(),
        price: parseInt(price, 10),
        durationMinutes: parseInt(duration, 10) || 45,
        category: category.trim() || undefined,
      });
    } else {
      store.addService({
        businessId: business.id,
        name: name.trim(),
        description: description.trim() || 'Professional service by certified specialists.',
        price: parseInt(price, 10),
        durationMinutes: parseInt(duration, 10) || 45,
        category: category.trim() || undefined,
        active: true,
      });
    }

    setIsAddModalOpen(false);
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    refreshData();
  };

  const handleEditClick = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setDescription(srv.description);
    setPrice(srv.price.toString());
    setDuration(srv.durationMinutes.toString());
    setCategory(srv.category || '');
    setIsAddModalOpen(true);
  };

  const handleToggleActive = (srv: Service) => {
    store.updateService(srv.id, { active: !srv.active });
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this service from your public page?')) {
      store.deleteService(id);
      refreshData();
    }
  };

  const categoryTemplates = business ? templates[business.categoryId] || templates['fitness-sports'] : [];

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
              Manage Your Services
            </h1>
            <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
              Add the services, prices, and durations that customers can book on your page
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingService(null);
              setName('');
              setDescription('');
              setPrice('');
              setCategory('');
              setIsAddModalOpen(true);
            }}
            className="font-bold text-xs bg-brand-black text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add a service</span>
          </Button>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                srv.active
                  ? 'bg-white border-brand-border hover:border-brand-black shadow-subtle'
                  : 'bg-neutral-50 border-dashed border-neutral-300 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-brand-black">{srv.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      srv.active ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {srv.active ? 'Bookable' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-brand-secondary max-w-xl">{srv.description}</p>
                <div className="flex items-center gap-3 text-xs text-brand-muted pt-1">
                  <span className="font-bold text-brand-black">{formatPrice(srv.price)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {srv.durationMinutes} minutes
                  </span>
                  {srv.category && <span>• {srv.category}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/60">
                <button
                  onClick={() => handleToggleActive(srv)}
                  className="px-3 py-1.5 rounded-xl border border-brand-border hover:bg-brand-surface-alt text-xs font-bold text-brand-black"
                >
                  {srv.active ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEditClick(srv)}
                  className="p-2 rounded-xl border border-brand-border hover:bg-brand-surface-alt text-brand-black"
                  title="Edit service"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(srv.id)}
                  className="p-2 rounded-xl border border-brand-border hover:bg-red-50 text-red-700"
                  title="Delete service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT SERVICE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add a Service'}
      >
        <form onSubmit={handleSaveService} className="space-y-4 pt-2">
          {/* Quick Suggestions Template Bar */}
          {!editingService && categoryTemplates.length > 0 && (
            <div className="p-3 rounded-xl bg-brand-surface-alt border border-brand-border space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-neutral-500" />
                <span>Suggested for your category:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categoryTemplates.map((t) => (
                  <button
                    type="button"
                    key={t.name}
                    onClick={() => handleApplyTemplate(t)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-brand-border hover:bg-brand-lime hover:text-brand-black text-brand-black transition-colors"
                  >
                    + {t.name} ({formatPrice(t.price)})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Service Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Court Booking (60 Mins)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Price (INR)</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="600"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Duration (Minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black bg-white"
              >
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">60 mins (1 hour)</option>
                <option value="90">90 mins (1.5 hours)</option>
                <option value="120">120 mins (2 hours)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this service include?"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" type="submit" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Save service</span>
            </Button>
          </div>
        </form>
      </Modal>
    </BusinessLayout>
  );
}
