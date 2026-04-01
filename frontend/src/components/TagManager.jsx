import { useEffect, useState } from 'react';

export default function TagManager({
  tags,
  loading,
  creating,
  updatingTagId,
  deletingTagId,
  onCreate,
  onRename,
  onDelete
}) {
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!editingTagId) {
      setEditingName('');
      return;
    }

    const currentTag = tags.find((tag) => tag.id === editingTagId);
    setEditingName(currentTag?.name || '');
  }, [editingTagId, tags]);

  const handleCreate = async (event) => {
    event.preventDefault();
    const value = newTagName.trim();
    if (!value) {
      return;
    }

    await onCreate(value);
    setNewTagName('');
  };

  const handleRename = async (event) => {
    event.preventDefault();
    if (!editingTagId) {
      return;
    }

    const value = editingName.trim();
    if (!value) {
      return;
    }

    await onRename(editingTagId, value);
    setEditingTagId(null);
    setEditingName('');
  };

  return (
    <section className="panel tag-panel">
      <div className="form-field">
        <span className="field-label">标签名</span>
        <form className="tag-create-row" onSubmit={handleCreate}>
          <input
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            className="field-input"
          />
          <button type="submit" className="button-primary" disabled={creating || !newTagName.trim()}>
            {creating ? '提交中...' : '新建'}
          </button>
        </form>
      </div>

      {loading ? <p className="muted-text">加载中...</p> : null}
      {!loading && tags.length === 0 ? <p className="empty-state">暂无标签</p> : null}

      {!loading && tags.length > 0 ? (
        <div className="tag-admin-list">
          {tags.map((tag) =>
            editingTagId === tag.id ? (
              <form key={tag.id} className="tag-admin-card tag-admin-edit" onSubmit={handleRename}>
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className="field-input"
                />
                <div className="item-actions">
                  <button
                    type="submit"
                    className="button-primary"
                    disabled={updatingTagId === tag.id || !editingName.trim()}
                  >
                    {updatingTagId === tag.id ? '保存中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setEditingTagId(null);
                      setEditingName('');
                    }}
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <article key={tag.id} className="tag-admin-card">
                <div className="tag-admin-main">
                  <span className="tag tag-neutral tag-admin-chip">{tag.name}</span>
                  <strong className="tag-admin-count">{tag.itemCount}</strong>
                </div>
                <div className="item-actions">
                  <button type="button" className="button-secondary" onClick={() => setEditingTagId(tag.id)}>
                    改名
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => onDelete(tag.id)}
                    disabled={deletingTagId === tag.id}
                  >
                    {deletingTagId === tag.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}
