export default function UpcomingReviewList({ reviews, loading, onOpenDetails }) {
  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.heading}>未来 7 天计划</h2>
        <p style={styles.description}>提前看看接下来一周需要复习什么，避免临时堆积。</p>
      </div>
      {loading ? <p>加载中...</p> : null}
      {!loading && reviews.length === 0 ? <p>未来 7 天没有待复习计划。</p> : null}
      <div style={styles.list}>
        {reviews.map((review) => (
          <button key={review.reviewId} type="button" style={styles.card} onClick={() => onOpenDetails(review.itemId)}>
            <span style={styles.date}>{review.scheduledDate}</span>
            <strong style={styles.title}>{review.title}</strong>
          </button>
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
    gap: '12px'
  },
  card: {
    display: 'grid',
    gap: '6px',
    textAlign: 'left',
    border: '1px solid #dbe2ea',
    borderRadius: '14px',
    padding: '14px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  date: {
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: 700
  },
  title: {
    color: '#0f172a'
  }
};
