export default function KnowledgeItemList({
  items,
  loading,
  editingItemId,
  deletingItemId,
  selectedItemId,
  onEdit,
  onDelete,
  onViewDetails
}) {
  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>知识点总览</h2>
          <p style={styles.description}>查看全部知识点、当前复习进度和下一次待复习日期。</p>
        </div>
      </div>

      {loading ? <p>加载中...</p> : null}
      {!loading && items.length === 0 ? <p>还没有知识点，先在上方添加一条。</p> : null}

      <div style={styles.list}>
        {items.map((item) => {
          const totalPlans = item.totalPlans || 0;
          const completedPlans = item.completedPlans || 0;
          const progress = totalPlans === 0 ? 0 : Math.round((completedPlans / totalPlans) * 100);

          return (
            <article key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.titleRow}>
                    <h3 style={styles.title}>{item.title}</h3>
                    {editingItemId === item.id ? <span style={styles.editingTag}>编辑中</span> : null}
                  </div>
                  <p style={styles.content}>{item.content || '暂无内容'}</p>
                </div>
                <div style={styles.actions}>
                  <button type="button" style={styles.detailButton} onClick={() => onViewDetails(item.id)}>
                    {selectedItemId === item.id ? '查看中' : '查看明细'}
                  </button>
                  <button type="button" style={styles.editButton} onClick={() => onEdit(item)}>
                    编辑
                  </button>
                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => onDelete(item.id)}
                    disabled={deletingItemId === item.id}
                  >
                    {deletingItemId === item.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>

              <div style={styles.progressRow}>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <span style={styles.progressText}>{completedPlans}/{totalPlans} 已完成</span>
              </div>

              <div style={styles.metaGrid}>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>待复习</span>
                  <strong>{item.pendingPlans || 0}</strong>
                </div>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>下一次</span>
                  <strong>{item.nextReviewDate || '已全部完成'}</strong>
                </div>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>创建时间</span>
                  <strong>{formatDateTime(item.createdAt)}</strong>
                </div>
              </div>

              {item.latestStudyNote ? (
                <div style={styles.noteCard}>
                  <div style={styles.noteHeader}>
                    <span style={styles.noteLabel}>最近一次学习笔记</span>
                    <span style={styles.noteTime}>{formatDateTime(item.latestStudyNoteAt)}</span>
                  </div>
                  <p style={styles.noteContent}>{item.latestStudyNote}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return value.replace('T', ' ').slice(0, 16);
}

const styles = {
  section: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '24px'
  },
  header: {
    marginBottom: '16px'
  },
  heading: {
    margin: '0 0 4px'
  },
  description: {
    margin: 0,
    color: '#64748b'
  },
  list: {
    display: 'grid',
    gap: '16px'
  },
  card: {
    border: '1px solid #dbe2ea',
    borderRadius: '18px',
    padding: '18px',
    backgroundColor: '#fbfdff'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px'
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
  editingTag: {
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: 600
  },
  content: {
    margin: 0,
    color: '#334155',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6
  },
  actions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  editButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  detailButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    cursor: 'pointer'
  },
  deleteButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    cursor: 'pointer'
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  progressTrack: {
    flex: 1,
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2563eb, #14b8a6)'
  },
  progressText: {
    minWidth: '92px',
    color: '#475569',
    fontSize: '14px'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px'
  },
  metaCard: {
    padding: '12px 14px',
    borderRadius: '14px',
    backgroundColor: '#f1f5f9',
    display: 'grid',
    gap: '4px'
  },
  metaLabel: {
    color: '#64748b',
    fontSize: '13px'
  },
  noteCard: {
    marginTop: '14px',
    padding: '14px 16px',
    borderRadius: '14px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fdba74'
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  noteLabel: {
    color: '#9a3412',
    fontSize: '13px',
    fontWeight: 700
  },
  noteTime: {
    color: '#9a3412',
    fontSize: '12px'
  },
  noteContent: {
    margin: 0,
    color: '#7c2d12',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6
  }
};
