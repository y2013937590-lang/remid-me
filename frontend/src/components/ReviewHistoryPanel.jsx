export default function ReviewHistoryPanel({ item, reviews, loading, onTagSelect }) {
  const tags = parseTags(item?.tags);

  return (
    <section className="panel">
      {loading ? <p className="muted-text">加载中...</p> : null}
      {!loading && !item ? <p className="empty-state">从列表或未来计划里点“查看明细”，这里会显示完整复习记录。</p> : null}

      {item ? (
        <div className="side-stack">
          <div className="detail-item">
            <h3 className="detail-title">{item.title}</h3>
            {tags.length > 0 ? (
              <div className="tag-list">
                {tags.map((tag) => (
                  <button
                    key={`${item.id}-${tag}`}
                    type="button"
                    className="tag tag-neutral tag-button"
                    onClick={() => onTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="detail-copy">{item.content || '暂无内容'}</p>
          </div>
          <div className="timeline-list">
            {reviews.map((review, index) => (
              <article key={review.id} className="timeline-card">
                <div className="review-head">
                  <strong>第 {index + 1} 次</strong>
                  <span className={`tag ${review.status === 'completed' ? 'tag-success' : 'tag-neutral'}`}>
                    {review.status === 'completed' ? '已完成' : '待复习'}
                  </span>
                </div>
                <p className="review-meta">计划日期：{review.scheduledDate}</p>
                <p className="review-meta">完成时间：{formatDateTime(review.completedAt) || '未完成'}</p>
                {review.studyNote ? <p className="note-panel detail-copy">{review.studyNote}</p> : <p className="muted-text">这次没有记录笔记。</p>}
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

function parseTags(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
