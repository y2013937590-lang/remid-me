export default function KnowledgeItemList({
  items,
  loading,
  currentPage,
  totalItems,
  totalPages,
  editingItemId,
  deletingItemId,
  selectedItemId,
  onEdit,
  onDelete,
  onPageChange,
  onViewDetails,
  onTagSelect
}) {
  return (
    <section className="panel">
      {loading ? <p className="muted-text">加载中...</p> : null}
      {!loading && items.length === 0 ? <p className="empty-state">还没有知识点，先在右侧添加一条。</p> : null}

      <div className="list-stack">
        {items.map((item) => {
          const totalPlans = item.totalPlans || 0;
          const completedPlans = item.completedPlans || 0;
          const progress = totalPlans === 0 ? 0 : Math.round((completedPlans / totalPlans) * 100);
          const cardClassName = `item-card ${selectedItemId === item.id ? 'is-selected' : ''} ${
            editingItemId === item.id ? 'is-editing' : ''
          }`;
          const tags = parseTags(item.tags);

          return (
            <article
              key={item.id}
              className={`${cardClassName} item-card-clickable`}
              onClick={() => onViewDetails(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onViewDetails(item.id);
                }
              }}
            >
              <div className="item-header">
                <div>
                  <div className="review-head">
                    <h3 className="mini-title">{item.title}</h3>
                    {editingItemId === item.id ? <span className="tag tag-neutral">编辑中</span> : null}
                  </div>
                  <p className="review-copy">{item.content || '暂无内容'}</p>
                  {tags.length > 0 ? (
                    <div className="tag-list">
                      {tags.map((tag) => (
                        <button
                          key={`${item.id}-${tag}`}
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
                </div>
                <div className="item-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(item.id);
                    }}
                    disabled={deletingItemId === item.id}
                  >
                    {deletingItemId === item.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-text">{completedPlans}/{totalPlans} 已完成</span>
              </div>

              <div className="meta-grid">
                <div className="meta-card">
                  <span className="meta-label">待复习</span>
                  <strong>{item.pendingPlans || 0}</strong>
                </div>
                <div className="meta-card">
                  <span className="meta-label">下一次</span>
                  <strong>{item.nextReviewDate || '已全部完成'}</strong>
                </div>
              </div>

              {item.latestStudyNote ? (
                <div className="note-panel">
                  <div className="review-head">
                    <span className="meta-label">最近一次学习笔记</span>
                    <span className="mini-meta">{formatDateTime(item.latestStudyNoteAt)}</span>
                  </div>
                  <p className="review-copy">{item.latestStudyNote}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {!loading && totalItems > 20 ? (
        <div className="pagination-bar">
          <button
            type="button"
            className="button-secondary pagination-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            上一页
          </button>
          <span className="pagination-status">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="button-secondary pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            下一页
          </button>
        </div>
      ) : null}
    </section>
  );
}

function formatDateTime(value) {
  if (!value) {
    return '-';
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
