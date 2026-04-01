import { useEffect, useState } from 'react';
import AddItemForm from './components/AddItemForm';
import KnowledgeItemList from './components/KnowledgeItemList';
import TodayReviewList from './components/TodayReviewList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function App() {
  const [reviews, setReviews] = useState([]);
  const [items, setItems] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [completingReviewId, setCompletingReviewId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (fallbackMessage, error) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallbackMessage;
  };

  const requestJson = async (path, options, fallbackMessage) => {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  };

  const loadItems = async () => {
    setItemsLoading(true);
    try {
      const data = await requestJson('/items', {}, '加载知识点列表失败');
      setItems(data);
    } finally {
      setItemsLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await requestJson('/reviews/today', {}, '加载待复习列表失败');
      setReviews(data);
    } finally {
      setReviewsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadItems(), loadReviews()]);
    } catch (err) {
      setError(getErrorMessage('加载数据失败', err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleItemSaved = async () => {
    setEditingItem(null);
    try {
      await Promise.all([loadItems(), loadReviews()]);
    } catch (err) {
      setError(getErrorMessage('刷新数据失败', err));
    }
  };

  const handleComplete = async (reviewId) => {
    setCompletingReviewId(reviewId);
    setError('');
    try {
      await requestJson(`/reviews/${reviewId}/complete`, { method: 'PUT' }, '标记复习完成失败');
      await Promise.all([loadItems(), loadReviews()]);
    } catch (err) {
      const message = getErrorMessage('标记复习完成失败', err);
      setError(message);
      throw new Error(message);
    } finally {
      setCompletingReviewId(null);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('删除知识点后，对应的全部复习计划也会被删除。确认继续吗？')) {
      return;
    }

    setDeletingItemId(itemId);
    setError('');
    try {
      await requestJson(`/items/${itemId}`, { method: 'DELETE' }, '删除知识点失败');
      if (editingItem?.id === itemId) {
        setEditingItem(null);
      }
      await Promise.all([loadItems(), loadReviews()]);
    } catch (err) {
      setError(getErrorMessage('删除知识点失败', err));
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.title}>21天复习计划</h1>
            <p style={styles.subtitle}>支持新增、编辑、删除知识点，自动生成 7 次复习，并显示今天及逾期未完成的任务。</p>
          </div>
          <button type="button" style={styles.refreshButton} onClick={refreshDashboard} disabled={loading}>
            {loading ? '刷新中...' : '刷新数据'}
          </button>
        </div>
        {error ? <div style={styles.error}>{error}</div> : null}
        <div style={styles.topGrid}>
          <AddItemForm
            apiBaseUrl={API_BASE_URL}
            editingItem={editingItem}
            onSaved={handleItemSaved}
            onCancelEdit={() => setEditingItem(null)}
          />
          <TodayReviewList
            reviews={reviews}
            loading={reviewsLoading}
            completingReviewId={completingReviewId}
            onComplete={handleComplete}
          />
        </div>
        <KnowledgeItemList
          items={items}
          loading={itemsLoading}
          editingItemId={editingItem?.id ?? null}
          deletingItemId={deletingItemId}
          onEdit={setEditingItem}
          onDelete={handleDeleteItem}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 24%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.14), transparent 22%), #f3f4f6',
    padding: '32px 16px',
    fontFamily: '"Helvetica Neue", Arial, sans-serif'
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)'
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '36px'
  },
  subtitle: {
    margin: 0,
    color: '#475569',
    maxWidth: '720px',
    lineHeight: 1.6
  },
  refreshButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '12px 18px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    cursor: 'pointer'
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  error: {
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  }
};
