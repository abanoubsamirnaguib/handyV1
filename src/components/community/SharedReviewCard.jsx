import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
    />
  ));

const SharedReviewCard = ({ review }) => {
  if (!review) {
    return null;
  }

  if (review.unavailable) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
        هذا التقييم لم يعد متاحاً.
      </div>
    );
  }

  const productImage = review.product?.images?.[0]?.image_url || review.product?.image || null;

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm">
      <div className="border-r-4 border-r-roman-500 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
              <span className="text-sm font-semibold text-neutral-700">{review.rating}/5</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-neutral-900">{review.user?.name || 'مشتري موثّق'}</span>
              <Badge variant="success" className="bg-emerald-100 text-emerald-700">
                مشتري موثّق
              </Badge>
            </div>
          </div>

          {review.image_url && (
            <img
              src={review.image_url}
              alt="مرفق التقييم"
              className="h-16 w-16 rounded-xl object-cover shadow-sm"
            />
          )}
        </div>

        <p className="mb-4 text-sm leading-6 text-neutral-700">{review.comment || 'لا يوجد تعليق مكتوب.'}</p>

        {review.product && (
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-amber-100">
            {productImage ? (
              <img
                src={productImage}
                alt={review.product.title || review.product.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Package className="h-5 w-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900">
                {review.product.title || review.product.name || 'منتج'}
              </p>
              <Link
                to={`/gigs/${review.product_id}`}
                className="text-sm font-medium text-roman-500 hover:text-roman-600"
              >
                عرض المنتج
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedReviewCard;
