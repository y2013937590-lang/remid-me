import { useState } from 'react';

export default function AddItemForm({ apiBaseUrl, onCreated }) {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('新增知识点失败');
      }

      setFormData({ title: '', content: '' });
      setMessage('知识点已添加，并生成 7 条复习计划。');
      onCreated();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>添加知识点</h2>
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
        {submitting ? '提交中...' : '添加'}
      </button>
      {message ? <p style={styles.message}>{message}</p> : null}
    </form>
  );
}

const styles = {
  form: {
    display: 'grid',
    gap: '12px',
    marginBottom: '32px'
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
    width: '120px',
    padding: '10px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer'
  },
  message: {
    margin: 0,
    color: '#1d4ed8'
  }
};
