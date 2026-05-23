import { useEffect, useRef, useState } from 'react';

export default function AddItemForm({
  apiBaseUrl,
  editingItem,
  availableTagGroups,
  onSaved,
  onCancelEdit,
  onManageTags
}) {
  const [formData, setFormData] = useState({ title: '', content: '', tagIds: [] });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const tagMenuRef = useRef(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        content: editingItem.content || '',
        tagIds: Array.isArray(editingItem.tagIds) ? editingItem.tagIds.slice(0, 1) : []
      });
    } else {
      setFormData({ title: '', content: '', tagIds: [] });
    }
    setFeedback({ type: '', text: '' });
  }, [editingItem]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (tagMenuRef.current?.contains(event.target)) {
        return;
      }
      setIsTagMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: value ? [Number(value)] : []
    }));
    setIsTagMenuOpen(false);
  };

  const selectedTagId = formData.tagIds[0] ? `${formData.tagIds[0]}` : '';
  const selectedTag = availableTagGroups.flatMap((group) => group.tags).find((tag) => `${tag.id}` === selectedTagId) || null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    const isEditing = Boolean(editingItem);
    const path = isEditing ? `${apiBaseUrl}/items/${editingItem.id}` : `${apiBaseUrl}/items`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(isEditing ? '更新知识点失败' : '新增知识点失败');
      }

      setFeedback({
        type: 'success',
        text: isEditing ? '已更新' : '已创建'
      });

      if (!isEditing) {
        setFormData({ title: '', content: '', tagIds: [] });
      }

      await onSaved();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel form-panel">
      <div className="form-header">
        <h2 className="section-title">{editingItem ? '编辑知识点' : '新建知识点'}</h2>
        {onCancelEdit ? (
          <button type="button" className="button-secondary" onClick={onCancelEdit}>
            关闭
          </button>
        ) : null}
      </div>
      <label className="form-field">
        <span className="field-label">标题</span>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="field-input"
        />
      </label>
      <div className="form-field">
        <div className="field-head">
          <span className="field-label">标签</span>
          {onManageTags ? (
            <button type="button" className="button-link" onClick={onManageTags}>
              管理
            </button>
          ) : null}
        </div>
        {availableTagGroups.length > 0 ? (
          <div ref={tagMenuRef} className="custom-select">
            <button
              type="button"
              className={`custom-select-trigger ${isTagMenuOpen ? 'is-open' : ''}`}
              onClick={() => setIsTagMenuOpen((open) => !open)}
            >
              <span>{selectedTag?.name || '不选择'}</span>
              <span className="custom-select-caret" />
            </button>
            {isTagMenuOpen ? (
              <div className="custom-select-menu custom-select-menu-grouped">
                <button
                  type="button"
                  className={`custom-select-option ${selectedTagId === '' ? 'is-selected' : ''}`}
                  onClick={() => handleTagChange('')}
                >
                  不选择
                </button>
                {availableTagGroups.map((group) => (
                  <div key={group.id} className="custom-select-group">
                    <div className="custom-select-group-label">{group.name}</div>
                    {group.tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`custom-select-option ${selectedTagId === `${tag.id}` ? 'is-selected' : ''}`}
                        onClick={() => handleTagChange(`${tag.id}`)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="tag-picker-empty">
            <div className="empty-state">暂无标签</div>
            {onManageTags ? (
              <button type="button" className="button-secondary" onClick={onManageTags}>
                去标签页
              </button>
            ) : null}
          </div>
        )}
      </div>
      <label className="form-field">
        <span className="field-label">内容</span>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          className="field-textarea"
        />
      </label>
      <div className="button-row">
        <button type="submit" disabled={submitting} className="button-primary">
          {submitting ? (editingItem ? '保存中...' : '提交中...') : editingItem ? '保存' : '创建'}
        </button>
      </div>
      {feedback.text ? (
        <p className={feedback.type === 'error' ? 'feedback-error' : 'feedback-success'}>{feedback.text}</p>
      ) : null}
    </form>
  );
}
