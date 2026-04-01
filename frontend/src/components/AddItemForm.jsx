import { useEffect, useState } from 'react';

export default function AddItemForm({
  apiBaseUrl,
  editingItem,
  availableTags,
  onSaved,
  onCancelEdit,
  onManageTags
}) {
  const [formData, setFormData] = useState({ title: '', content: '', tagIds: [] });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        content: editingItem.content || '',
        tagIds: editingItem.tagIds || []
      });
    } else {
      setFormData({ title: '', content: '', tagIds: [] });
    }
    setFeedback({ type: '', text: '' });
  }, [editingItem]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((currentId) => currentId !== tagId) : [...prev.tagIds, tagId]
    }));
  };

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
        <div>
          <span className="eyebrow">{editingItem ? '编辑模式' : '新建内容'}</span>
          <h2 className="section-title">{editingItem ? '修改当前知识点' : '添加一个新的知识点'}</h2>
        </div>
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
        {availableTags.length > 0 ? (
          <div className="tag-picker">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`tag-option ${formData.tagIds.includes(tag.id) ? 'is-selected' : ''}`}
                onClick={() => handleToggleTag(tag.id)}
              >
                {tag.name}
              </button>
            ))}
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
