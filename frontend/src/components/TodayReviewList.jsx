import { useState } from 'react';

export default function TodayReviewList({ reviews, loading, completingReviewId, onComplete }) {
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
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.heading}>待处理复习</h2>
        <p style={styles.description}>显示今天以及之前逾期未完成的所有复习项。</p>
      </div>
      {loading ? <p>加载中...</p> : null}
      {!loading && reviews.length === 0 ? <p>当前没有待处理的复习内容。</p> : null}
      <div style={styles.list}>
        {reviews.map((review) => (
          <article key={review.reviewId} style={styles.card}>
            <div>
              <div style={styles.titleRow}>
                <h3 style={styles.title}>{review.title}</h3>
                <span style={review.overdue ? styles.overdueTag : styles.todayTag}>
                  {review.overdue ? '逾期' : '今天'}
                </span>
              </div>
              <p style={styles.content}>{review.content || '暂无内容'}</p>
              <p style={styles.meta}>计划日期：{review.scheduledDate}</p>
              <textarea
                value={notes[review.reviewId] || ''}
                onChange={(event) => handleNoteChange(review.reviewId, event.target.value)}
                placeholder="这次复习顺手记点笔记，比如易错点、联想记忆、例句..."
                rows={3}
                style={styles.textarea}
              />
            </div>
            <button
              type="button"
              style={styles.button}
              onClick={() => handleClick(review.reviewId)}
              disabled={completingReviewId === review.reviewId}
            >
              {completingReviewId === review.reviewId ? '处理中...' : '完成'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '20px',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  header: {
    marginBottom: '16px'
  },
  heading: {
    margin: '0 0 6px'
  },
  description: {
    margin: 0,
    color: '#64748b',
    lineHeight: 1.5
  },
  list: {
    display: 'grid',
    gap: '16px'
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  title: {
    margin: 0
  },
  content: {
    margin: '0 0 8px',
    whiteSpace: 'pre-wrap'
  },
  textarea: {
    width: '100%',
    marginTop: '8px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    resize: 'vertical',
    font: 'inherit',
    boxSizing: 'border-box'
  },
  meta: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px'
  },
  todayTag: {
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '12px',
    fontWeight: 600
  },
  overdueTag: {
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '12px',
    fontWeight: 600
  },
  button: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    cursor: 'pointer'
  }
};
