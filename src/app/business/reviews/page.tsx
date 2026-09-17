'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { Business, Review } from '@/types';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import { Button } from '@/components/ui/Button';
import { formatDatePretty } from '@/lib/utils';
import {
  MessageSquare,
  CornerDownRight,
  CheckCircle2,
} from 'lucide-react';

export default function BusinessReviewsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');

  const refreshData = () => {
    const user = store.getCurrentUser();
    const allBiz = store.getAllBusinessesAdmin();
    const activeBiz = user.businessId
      ? store.getBusinessById(user.businessId) || allBiz[0]
      : allBiz[0];

    if (activeBiz) {
      setBusiness(activeBiz);
      setReviews(store.getReviewsByBusinessId(activeBiz.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = store.subscribe(() => refreshData());
    return unsub;
  }, []);

  const handleSendReply = (reviewId: string) => {
    if (!replyComment.trim()) return;
    store.replyToReview(reviewId, replyComment);
    setReplyingReviewId(null);
    setReplyComment('');
    refreshData();
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
            Customer Reviews
          </h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
            Read verified reviews and post official owner responses
          </p>
        </div>

        {/* Rating Overview Strip */}
        {business && (
          <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-black text-white text-2xl font-black">
                {business.rating}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Rating Score</span>
                </div>
                <p className="text-xs text-brand-secondary mt-1">
                  Based on <strong className="text-brand-black">{reviews.length} verified customer reviews</strong>
                </p>
              </div>
            </div>

            <div className="text-xs text-brand-muted">
              <span>All reviews are verified from completed BUKKAPP appointments.</span>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-brand-border shadow-subtle space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-black text-white font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-brand-black">{rev.userName}</p>
                    {rev.serviceName && (
                      <p className="text-[10px] text-brand-muted">Booked: {rev.serviceName}</p>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* Existing Business Reply */}
              {rev.businessReply ? (
                <div className="p-4 rounded-xl bg-brand-surface-alt border border-brand-border text-xs space-y-1">
                  <p className="font-bold text-brand-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Your Official Public Reply</span>
                  </p>
                  <p className="text-brand-secondary pl-4">{rev.businessReply.comment}</p>
                </div>
              ) : replyingReviewId === rev.id ? (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    placeholder="Write a warm, professional reply visible to customers..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-black"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendReply(rev.id)}
                      className="text-xs font-bold bg-brand-black text-white"
                    >
                      Post Public Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingReviewId(null)}
                      className="text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingReviewId(rev.id);
                      setReplyComment('');
                    }}
                    className="text-xs font-bold border-brand-border gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply to review</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </BusinessLayout>
  );
}
