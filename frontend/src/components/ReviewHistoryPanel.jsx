export default function ReviewHistoryPanel({ item, reviews, loading, onClose }) {
  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>复习明细</h2>
          <p style={styles.description}>打开某条知识点后，可以看到 7 次计划、完成时间和每次留下的笔记。</p>
        </div>
        {item ? (
          <button type="button" style={styles.closeButton} onClick={onClose}>
            收起
          </button>
        ) : null}
      </div>

      {loading ? <p>加载中...</p> : null}
      {!loading && !item ? <p>从总览列表或未来计划里点“查看明细”，这里会显示完整复习记录。</p> : null}

      {item ? (
        <div style={styles.content}>
          <div style={styles.itemCard}>
            <h3 style={styles.title}>{item.title}</h3>
            <p style={styles.itemText}>{item.content || '暂无内容'}</p>
          </div>
          <div style={styles.timeline}>
            {reviews.map((review, index) => (
              <article key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHead}>
                  <strong>第 {index + 1} 次</strong>
                  <span style={review.status === 'completed' ? styles.completed : styles.pending}>
                    {review.status === 'completed' ? '已完成' : '待复习'}
                  </span>
                </div>
                <p style={styles.meta}>计划日期：{review.scheduledDate}</p>
                <p style={styles.meta}>完成时间：{formatDateTime(review.completedAt) || '未完成'}</p>
                {review.studyNote ? <p style={styles.note}>{review.studyNote}</p> : <p style={styles.emptyNote}>这次没有记录笔记。</p>}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }
  return value.replace('T', ' ').slice(0, 16);
}

const styles = {
  section: {
    padding: '20px',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
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
  closeButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 12px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  content: {
    display: 'grid',
    gap: '16px'
  },
  itemCard: {
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #dbe2ea'
  },
  title: {
    margin: '0 0 8px'
  },
  itemText: {
    margin: 0,
    color: '#334155',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6
  },
  timeline: {
    display: 'grid',
    gap: '12px'
  },
  reviewCard: {
    padding: '14px 16px',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #dbe2ea'
  },
  reviewHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '8px'
  },
  pending: {
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    fontSize: '12px',
    fontWeight: 700
  },
  completed: {
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '12px',
    fontWeight: 700
  },
  meta: {
    margin: '0 0 6px',
    color: '#64748b',
    fontSize: '14px'
  },
  note: {
    margin: '8px 0 0',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#fff7ed',
    color: '#7c2d12',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6
  },
  emptyNote: {
    margin: '8px 0 0',
    color: '#94a3b8',
    fontStyle: 'italic'
  }
};
