export default function TodayReviewList({ reviews, loading, onComplete }) {
  const handleClick = async (reviewId) => {
    try {
      await onComplete(reviewId);
    } catch (error) {
      // Error state is handled in the parent component.
    }
  };

  return (
    <section>
      <h2>今日待复习</h2>
      {loading ? <p>加载中...</p> : null}
      {!loading && reviews.length === 0 ? <p>今天没有待复习内容。</p> : null}
      <div style={styles.list}>
        {reviews.map((review) => (
          <article key={review.reviewId} style={styles.card}>
            <div>
              <h3 style={styles.title}>{review.title}</h3>
              <p style={styles.content}>{review.content || '暂无内容'}</p>
              <p style={styles.meta}>计划日期：{review.scheduledDate}</p>
            </div>
            <button type="button" style={styles.button} onClick={() => handleClick(review.reviewId)}>
              完成
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

const styles = {
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
    backgroundColor: '#fafafa'
  },
  title: {
    margin: '0 0 8px'
  },
  content: {
    margin: '0 0 8px',
    whiteSpace: 'pre-wrap'
  },
  meta: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px'
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
