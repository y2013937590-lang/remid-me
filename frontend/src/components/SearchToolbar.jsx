export default function SearchToolbar({ value, activeKeyword, onChange, onSubmit, onClear }) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <div>
        <h2 style={styles.heading}>搜索知识点</h2>
        <p style={styles.description}>按标题或内容筛选。搜索不会影响今天待复习和未来计划区域。</p>
      </div>
      <div style={styles.controls}>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="输入关键词，例如 abandon / 递归 / TCP"
          style={styles.input}
        />
        <button type="submit" style={styles.primaryButton}>
          搜索
        </button>
        <button type="button" style={styles.secondaryButton} onClick={onClear}>
          清空
        </button>
      </div>
      {activeKeyword ? <p style={styles.active}>当前筛选：{activeKeyword}</p> : null}
    </form>
  );
}

const styles = {
  form: {
    display: 'grid',
    gap: '12px',
    marginBottom: '20px',
    padding: '18px 20px',
    borderRadius: '18px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  heading: {
    margin: '0 0 6px'
  },
  description: {
    margin: 0,
    color: '#64748b'
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1'
  },
  primaryButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer'
  },
  secondaryButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  active: {
    margin: 0,
    color: '#1d4ed8'
  }
};
