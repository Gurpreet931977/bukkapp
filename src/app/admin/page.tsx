'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Business, Booking, Category, Review, User, AuditLog, BusinessStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatTime24to12, formatDatePretty } from '@/lib/utils';
import {
  Shield,
  Store,
  CalendarCheck,
  Users,
  Layers,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Plus,
  Search,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'bookings' | 'categories' | 'reviews' | 'users' | 'audit'>('overview');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Filters
  const [businessStatusFilter, setBusinessStatusFilter] = useState<'all' | BusinessStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedBizForAction, setSelectedBizForAction] = useState<Business | null>(null);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [changeRequestNote, setChangeRequestNote] = useState('');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const refreshData = () => {
    setBusinesses(store.getAllBusinessesAdmin());
    setBookings(store.getAllBookings());
    setCategories(store.getAllCategoriesAdmin());
    setReviews(store.getAllReviewsAdmin());
    setUsers(store.getUsers());
    setAuditLogs(store.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleApproveBusiness = (biz: Business) => {
    store.updateBusinessStatus(biz.id, 'active');
    refreshData();
  };

  const handleOpenRequestChanges = (biz: Business) => {
    setSelectedBizForAction(biz);
    setChangeRequestNote(biz.changeRequestReason || '');
    setIsChangesModalOpen(true);
  };

  const handleSubmitRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizForAction || !changeRequestNote.trim()) return;

    store.updateBusinessStatus(selectedBizForAction.id, 'needs_changes', changeRequestNote.trim());
    setIsChangesModalOpen(false);
    setSelectedBizForAction(null);
    setChangeRequestNote('');
    refreshData();
  };

  const handleToggleSuspend = (biz: Business) => {
    const newStatus: BusinessStatus = biz.status === 'suspended' ? 'active' : 'suspended';
    store.updateBusinessStatus(biz.id, newStatus);
    refreshData();
  };

  const handleToggleHideReview = (revId: string) => {
    store.toggleHideReview(revId);
    refreshData();
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Cancel this customer booking?')) {
      store.updateBookingStatus(bookingId, 'cancelled', 'Cancelled by Admin Operations');
      refreshData();
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    store.addCategory({
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || 'Local verified specialists',
      iconName: 'Store',
      popularServices: [],
      active: true,
      sortOrder: categories.length + 1,
    });

    setIsAddCategoryModalOpen(false);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatDesc('');
    refreshData();
  };

  const pendingBusinesses = businesses.filter((b) => b.status === 'pending_review');
  const activeBusinesses = businesses.filter((b) => b.status === 'active');
  const todayBookings = bookings.filter((b) => b.date === new Date().toISOString().split('T')[0]);

  const filteredBusinesses = businesses.filter((b) => {
    if (businessStatusFilter !== 'all' && b.status !== businessStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.neighborhood.toLowerCase().includes(q) || b.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* Top Admin Header */}
      <div className="bg-brand-black text-white border-b border-neutral-800 py-4 sticky top-16 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-lime text-brand-black flex items-center justify-center font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>BUKKAPP Operations Control Room</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-brand-lime">
                  Admin Access
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400">
                Marketplace verification, listing moderation, and booking oversight
              </p>
            </div>
          </div>

          {/* Persona quick badge */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Operator: <strong className="text-white">BUKKAPP Admin</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-brand-border pb-3">
          {[
            { key: 'overview', label: 'Operations Overview', icon: Shield },
            { key: 'businesses', label: `Businesses (${businesses.length})`, icon: Store },
            { key: 'bookings', label: `Bookings (${bookings.length})`, icon: CalendarCheck },
            { key: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { key: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
            { key: 'users', label: `Users (${users.length})`, icon: Users },
            { key: 'audit', label: `Audit Log (${auditLogs.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-black text-white shadow-2xs'
                    : 'bg-white border border-brand-border text-brand-secondary hover:text-brand-black hover:border-neutral-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-lime' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                  Total Businesses
                </span>
                <p className="text-3xl font-black text-brand-black">{businesses.length}</p>
                <p className="text-xs text-brand-secondary">{activeBusinesses.length} active live in Dehradun</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Pending Verification
                </span>
                <p className="text-3xl font-black text-amber-900">{pendingBusinesses.length}</p>
                <p className="text-xs text-amber-800">Requires admin review</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                  Bookings Today
                </span>
                <p className="text-3xl font-black text-brand-black">{todayBookings.length}</p>
                <p className="text-xs text-brand-secondary">{bookings.length} total platform volume</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                  Customer Reviews
                </span>
                <p className="text-3xl font-black text-brand-black">{reviews.length}</p>
                <p className="text-xs text-brand-secondary">Avg platform rating: 4.8 / 5.0</p>
              </div>
            </div>

            {/* Pending Verification Priority Queue */}
            {pendingBusinesses.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                    <h2 className="text-lg font-black text-amber-950">
                      Pending Storefront Reviews ({pendingBusinesses.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('businesses');
                      setBusinessStatusFilter('pending_review');
                    }}
                    className="text-xs font-bold text-amber-900 underline"
                  >
                    View in table
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="bg-white rounded-2xl p-5 border border-amber-200 shadow-subtle space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-sm text-brand-black">{biz.name}</h3>
                          <p className="text-xs text-brand-secondary">{biz.subcategory} • {biz.neighborhood}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted line-clamp-2">{biz.description}</p>
                      <div className="pt-2 border-t border-brand-border flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRequestChanges(biz)}
                          className="text-xs font-bold text-amber-900 border-amber-300 hover:bg-amber-50"
                        >
                          Request Changes
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveBusiness(biz)}
                          className="text-xs font-bold bg-brand-black text-white"
                        >
                          Approve & Publish
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Marketplace Activity Feed */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-brand-muted">
                Recent Platform Audit Logs
              </h2>
              <div className="space-y-3 divide-y divide-brand-border/60">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-brand-black">
                        <span className="capitalize">{log.action.replace(/_/g, ' ')}</span>
                        {log.metadata?.name && ` · ${log.metadata.name}`}
                      </p>
                      <p className="text-[11px] text-brand-secondary">
                        Operator: {log.actorName} • Entity: {log.entityType} ({log.entityId})
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                      {formatDatePretty(log.createdAt.split('T')[0])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. BUSINESSES TAB */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-brand-black tracking-tight">
                  Business Directory & Moderation
                </h2>
                <p className="text-xs text-brand-secondary">All registered merchant storefronts in Dehradun</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(['all', 'pending_review', 'needs_changes', 'active', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBusinessStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                      businessStatusFilter === st
                        ? 'bg-brand-black text-white shadow-2xs'
                        : 'bg-white border border-brand-border text-brand-secondary hover:text-brand-black'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Businesses Table */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-surface-alt text-[10px] uppercase font-bold text-brand-muted">
                      <th className="py-3.5 px-4">Business</th>
                      <th className="py-3.5 pr-4">Category</th>
                      <th className="py-3.5 pr-4">Neighborhood</th>
                      <th className="py-3.5 pr-4">Rating</th>
                      <th className="py-3.5 pr-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {filteredBusinesses.map((b) => (
                      <tr key={b.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={b.coverImage}
                              alt={b.name}
                              className="w-9 h-9 rounded-xl object-cover border border-brand-border shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-extrabold text-brand-black">{b.name}</p>
                                {b.verified && (
                                  <span
                                    className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-brand-black text-brand-lime shadow-2xs"
                                    title={b.verificationPlan?.status === 'free_trial' ? '30-Day Free Trial Active' : 'Paid Subscription Active (₹450/mo)'}
                                  >
                                    <CheckCircle2 className="w-2.5 h-2.5 text-brand-lime" />
                                    <span>{b.verificationPlan?.status === 'free_trial' ? 'Free Trial' : '₹450/mo'}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-400">{b.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-brand-secondary font-semibold">{b.subcategory}</td>
                        <td className="py-3.5 pr-4 text-brand-secondary">{b.neighborhood}</td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-1.5 font-bold text-brand-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{b.rating}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">({b.reviewCount})</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                              b.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : b.status === 'pending_review'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : b.status === 'needs_changes'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.verified ? (
                              <button
                                onClick={() => {
                                  store.cancelVerificationSubscription(b.id);
                                  refreshData();
                                }}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                                title="Revoke Verified Merchant subscription"
                              >
                                Revoke Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  store.activateVerificationSubscription(b.id);
                                  refreshData();
                                }}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-brand-lime text-brand-black hover:bg-[#cbf000] border border-brand-black/10"
                                title="Activate 30-Day Free Trial (₹450/mo afterwards)"
                              >
                                + Verify (Trial)
                              </button>
                            )}

                            {b.status === 'pending_review' && (
                              <>
                                <button
                                  onClick={() => handleApproveBusiness(b)}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleOpenRequestChanges(b)}
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-brand-surface-alt hover:bg-neutral-200 text-brand-black border border-brand-border"
                                >
                                  Changes
                                </button>
                              </>
                            )}

                            {b.status === 'active' && (
                              <button
                                onClick={() => handleToggleSuspend(b)}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-red-50 text-red-700 border border-red-200"
                              >
                                Suspend
                              </button>
                            )}

                            {b.status === 'suspended' && (
                              <button
                                onClick={() => handleToggleSuspend(b)}
                                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white"
                              >
                                Restore
                              </button>
                            )}

                            <Link
                              href={`/business/${b.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-surface-alt text-brand-black"
                              title="View public page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-brand-black tracking-tight">
                  Marketplace Bookings Stream
                </h2>
                <p className="text-xs text-brand-secondary">Real-time city-wide booking activity across Dehradun</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-surface-alt text-[10px] uppercase font-bold text-brand-muted">
                      <th className="py-3.5 px-4">Ref Code</th>
                      <th className="py-3.5 pr-4">Customer</th>
                      <th className="py-3.5 pr-4">Business</th>
                      <th className="py-3.5 pr-4">Service</th>
                      <th className="py-3.5 pr-4">Slot</th>
                      <th className="py-3.5 pr-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {bookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-brand-surface-alt/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-black">{bk.bookingReference}</td>
                        <td className="py-3.5 pr-4">
                          <p className="font-bold text-brand-black">{bk.customerName}</p>
                          <p className="text-[11px] text-neutral-400">{bk.customerPhone}</p>
                        </td>
                        <td className="py-3.5 pr-4 font-semibold text-brand-black">{bk.businessName}</td>
                        <td className="py-3.5 pr-4">
                          {bk.serviceName} ({formatPrice(bk.servicePrice)})
                        </td>
                        <td className="py-3.5 pr-4 font-medium">
                          {formatDatePretty(bk.date)} at {formatTime24to12(bk.startTime)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              bk.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-800'
                                : bk.status === 'completed'
                                ? 'bg-neutral-100 text-neutral-600'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {bk.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {bk.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(bk.id)}
                              className="text-[11px] font-bold text-red-700 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-brand-black tracking-tight">
                  Marketplace Categories ({categories.length})
                </h2>
                <p className="text-xs text-brand-secondary">Manage taxonomy and discovery tags</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="font-bold text-xs bg-brand-black text-white gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-extrabold text-base text-brand-black">{cat.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-surface-alt text-brand-black">
                      Order: {cat.sortOrder}
                    </span>
                  </div>
                  <p className="text-xs text-brand-secondary">{cat.description}</p>
                  <p className="text-[11px] text-neutral-400 font-mono">Slug: /category/{cat.slug}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. REVIEWS MODERATION TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-brand-black tracking-tight">
                Review Moderation Queue
              </h2>
              <p className="text-xs text-brand-secondary">Inspect, hide, or restore customer reviews</p>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rev.isHidden ? 'bg-red-50/50 border-red-200' : 'bg-white border-brand-border shadow-subtle'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-brand-black">{rev.userName}</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        <span className="w-1 h-1 rounded-full bg-emerald-600" />
                        <span>{rev.rating}.0</span>
                      </span>
                      {rev.isHidden && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          Hidden from Public
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-secondary">&ldquo;{rev.comment}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleHideReview(rev.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        rev.isHidden
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      {rev.isHidden ? 'Restore Review' : 'Hide from Public'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-brand-black tracking-tight">
                Registered Users & Operators
              </h2>
              <p className="text-xs text-brand-secondary">Platform accounts and security access roles</p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border shadow-subtle overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-surface-alt text-[10px] uppercase font-bold text-brand-muted">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 px-4 font-bold text-brand-black">{u.name}</td>
                      <td className="py-3 pr-4 text-brand-secondary">{u.email}</td>
                      <td className="py-3 pr-4 text-brand-secondary">{u.phone}</td>
                      <td className="py-3 pr-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-lime text-brand-black uppercase">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-brand-black tracking-tight">
                System Audit Log Trail
              </h2>
              <p className="text-xs text-brand-secondary">Immutable log of all administrative actions and status changes</p>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border shadow-subtle divide-y divide-brand-border/60">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-brand-black">
                      <span className="font-mono text-neutral-400 mr-2">[{log.id}]</span>
                      <span className="capitalize">{log.action.replace(/_/g, ' ')}</span>
                    </p>
                    <p className="text-neutral-500">
                      Operator: <strong className="text-brand-black">{log.actorName}</strong> • Entity: {log.entityType} ({log.entityId})
                    </p>
                    {log.metadata && (
                      <p className="text-[11px] font-mono text-neutral-400">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                    {formatDatePretty(log.createdAt.split('T')[0])} {log.createdAt.split('T')[1]?.substring(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* REQUEST CHANGES MODAL */}
      <Modal
        isOpen={isChangesModalOpen}
        onClose={() => setIsChangesModalOpen(false)}
        title="Request Changes on Business Listing"
      >
        <form onSubmit={handleSubmitRequestChanges} className="space-y-4 pt-2">
          <p className="text-xs text-brand-secondary">
            Write a clear message for the business owner explaining what they need to update before their page can be verified.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Instructions for Owner</label>
            <textarea
              rows={4}
              required
              value={changeRequestNote}
              onChange={(e) => setChangeRequestNote(e.target.value)}
              placeholder="e.g. Please update your regular opening hours and upload at least 2 photos of your facility."
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsChangesModalOpen(false)} className="text-xs font-bold">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs font-bold bg-brand-black text-white">
              Send Request to Owner
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD CATEGORY MODAL */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add Marketplace Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Pet Care & Vet"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Slug</label>
            <input
              type="text"
              value={newCatSlug}
              onChange={(e) => setNewCatSlug(e.target.value)}
              placeholder="e.g. pet-care"
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-black uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Summary of services in this category"
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black text-brand-black"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full justify-center font-bold text-xs bg-brand-black text-white">
              <span>Save category</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
