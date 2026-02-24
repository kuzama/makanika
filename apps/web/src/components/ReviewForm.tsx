'use client';

import { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!rating) {
      setError('Rating is required');
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({
        rating: parseInt(rating),
        comment,
      });

      if (result.success) {
        setSuccess(true);
        setRating('');
        setComment('');
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold mb-3">Leave a Review</h3>

      {success && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
          Thank you for your review!
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="rating" className="block text-sm font-medium mb-1">
          Rating
        </label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select rating...</option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
      </div>

      <div className="mb-3">
        <textarea
          placeholder="Write a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
