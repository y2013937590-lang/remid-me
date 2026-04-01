import { useEffect, useState } from 'react';

export default function AddItemForm({ apiBaseUrl, editingItem, onSaved, onCancelEdit }) {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        content: editingItem.content || ''
      });
    } else {
      setFormData({ title: '', content: '' });
    }
    setFeedback({ type: '', text: '' });
  }, [editingItem]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        text: isEditing ? '知识点已更新。' : '知识点已添加，并生成 7 条复习计划。'
      });

      if (!isEditing) {
        setFormData({ title: '', content: '' });
      }

      await onSaved();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>{editingItem ? '编辑知识点' : '添加知识点'}</h2>
          <p style={styles.description}>
            {editingItem ? '修改标题或内容，不影响已生成的复习计划。' : '输入标题和内容，系统会自动生成 7 次复习计划。'}
          </p>
        </div>
        {editingItem ? (
          <button type="button" style={styles.cancelButton} onClick={onCancelEdit}>
            取消编辑
          </button>
        ) : null}
      </div>
      <input
        name="title"
        placeholder="标题"
        value={formData.title}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <textarea
        name="content"
        placeholder="内容"
        value={formData.content}
        onChange={handleChange}
        rows={4}
        style={styles.textarea}
      />
      <button type="submit" disabled={submitting} style={styles.button}>
        {submitting ? (editingItem ? '保存中...' : '提交中...') : editingItem ? '保存修改' : '添加'}
      </button>
      {feedback.text ? (
        <p style={feedback.type === 'error' ? styles.errorMessage : styles.successMessage}>{feedback.text}</p>
      ) : null}
    </form>
  );
}

const styles = {
  form: {
    display: 'grid',
    gap: '12px',
    padding: '20px',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    alignSelf: 'start'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start'
  },
  heading: {
    margin: '0 0 6px'
  },
  description: {
    margin: 0,
    color: '#64748b',
    lineHeight: 1.5
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    resize: 'vertical'
  },
  button: {
    width: '140px',
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    cursor: 'pointer'
  },
  cancelButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '10px 12px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  successMessage: {
    margin: 0,
    color: '#0f766e'
  },
  errorMessage: {
    margin: 0,
    color: '#b91c1c'
  }
};
