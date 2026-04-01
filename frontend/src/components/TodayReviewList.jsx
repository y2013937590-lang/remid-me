import { useState } from 'react';

export default function TodayReviewList({ reviews, loading, completingReviewId, onComplete, onOpenDetails, onTagSelect }) {
  const [notes, setNotes] = useState({});

  const handleNoteChange = (reviewId, value) => {
    setNotes((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleClick = async (reviewId) => {
    try {
      await onComplete(reviewId, notes[reviewId] || '');
      setNotes((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (error) {
      // Error state is handled in the parent component.
    }
  };

  return (
    <section className="panel">
      {loading ? <p className="muted-text">加载中...</p> : null}
      {!loading && reviews.length === 0 ? <p className="empty-state">当前没有待处理的复习内容。</p> : null}
      <div className="list-stack">
        {reviews.map((review) => (
          <article key={review.reviewId} className="review-card">
            <div className="review-main">
              <div className="review-head">
                <h3 className="mini-title">{review.title}</h3>
                {review.overdue ? <span className="tag tag-danger">逾期</span> : null}
              </div>
              <p className="review-copy">{review.content || '暂无内容'}</p>
              {parseTags(review.tags).length > 0 ? (
                <div className="tag-list">
                  {parseTags(review.tags).map((tag) => (
                    <button
                      key={`${review.reviewId}-${tag}`}
                      type="button"
                      className="tag tag-neutral tag-button"
                      onClick={() => onTagSelect(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}
              <p className="review-meta">计划日期：{review.scheduledDate}</p>
              <textarea
                value={notes[review.reviewId] || ''}
                onChange={(event) => handleNoteChange(review.reviewId, event.target.value)}
                placeholder="这次复习顺手记点笔记，比如易错点、联想记忆、例句..."
                rows={3}
                className="field-textarea"
              />
            </div>
            <div className="review-actions">
              {review.itemId ? (
                <button type="button" className="button-secondary" onClick={() => onOpenDetails(review.itemId)}>
                  查看明细
                </button>
              ) : null}
              <button
                type="button"
                className="button-primary"
                onClick={() => handleClick(review.reviewId)}
                disabled={completingReviewId === review.reviewId}
              >
                {completingReviewId === review.reviewId ? '处理中...' : '完成复习'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function parseTags(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
