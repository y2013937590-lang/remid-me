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
          <article
            key={review.reviewId}
            className={`review-card ${review.itemId ? 'review-card-clickable' : ''}`}
            onClick={() => {
              if (review.itemId) {
                onOpenDetails(review.itemId);
              }
            }}
            role={review.itemId ? 'button' : undefined}
            tabIndex={review.itemId ? 0 : undefined}
            onKeyDown={(event) => {
              if (!review.itemId || event.target !== event.currentTarget) {
                return;
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenDetails(review.itemId);
              }
            }}
          >
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
                      onClick={(event) => {
                        event.stopPropagation();
                        onTagSelect(tag);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}
              {review.latestStudyNote ? (
                <div className="note-panel">
                  <span className="meta-label">上次复习笔记</span>
                  <p className="review-copy">{review.latestStudyNote}</p>
                </div>
              ) : null}
              <textarea
                value={notes[review.reviewId] || ''}
                onChange={(event) => handleNoteChange(review.reviewId, event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder="这次复习顺手记点笔记，比如易错点、联想记忆、例句..."
                rows={3}
                className="field-textarea"
              />
            </div>
            <div className="review-actions">
              <button
                type="button"
                className="button-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClick(review.reviewId);
                }}
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
