export default function SearchToolbar({ value, activeKeyword, onChange, onSubmit, onClear }) {
  return (
    <form onSubmit={onSubmit} className="panel toolbar-panel">
      <div className="toolbar-controls">
        <input value={value} onChange={(event) => onChange(event.target.value)} className="field-input" />
        <button type="submit" className="button-primary">
          搜索
        </button>
        <button type="button" className="button-secondary" onClick={onClear}>
          清空
        </button>
      </div>
      {activeKeyword ? <p className="search-active">{activeKeyword}</p> : null}
    </form>
  );
}
