import { useEffect, useState } from 'react';
import AddItemForm from './components/AddItemForm';
import KnowledgeItemList from './components/KnowledgeItemList';
import ReviewHistoryPanel from './components/ReviewHistoryPanel';
import SearchToolbar from './components/SearchToolbar';
import TodayReviewList from './components/TodayReviewList';
import UpcomingReviewList from './components/UpcomingReviewList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function App() {
  const [reviews, setReviews] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [items, setItems] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemReviews, setSelectedItemReviews] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
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

  const loadItems = async (keyword = activeKeyword) => {
    setItemsLoading(true);
    try {
      const suffix = keyword ? `?q=${encodeURIComponent(keyword)}` : '';
      const data = await requestJson(`/items${suffix}`, {}, '加载知识点列表失败');
      setItems(data);
      return data;
    } finally {
      setItemsLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await requestJson('/reviews/today', {}, '加载待复习列表失败');
      setReviews(data);
      return data;
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadUpcomingReviews = async () => {
    setUpcomingLoading(true);
    try {
      const data = await requestJson('/reviews/upcoming?days=7', {}, '加载未来计划失败');
      setUpcomingReviews(data);
      return data;
    } finally {
      setUpcomingLoading(false);
    }
  };

  const openItemDetails = async (itemId) => {
    setDetailsLoading(true);
    setError('');
    try {
      const [item, reviewDetails] = await Promise.all([
        requestJson(`/items/${itemId}`, {}, '加载知识点详情失败'),
        requestJson(`/items/${itemId}/reviews`, {}, '加载复习明细失败')
      ]);
      setSelectedItem(item);
      setSelectedItemReviews(reviewDetails);
    } catch (err) {
      setError(getErrorMessage('加载知识点详情失败', err));
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshDashboard = async (keyword = activeKeyword) => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadItems(keyword), loadReviews(), loadUpcomingReviews()]);
      if (selectedItem?.id) {
        await openItemDetails(selectedItem.id);
      }
    } catch (err) {
      setError(getErrorMessage('加载数据失败', err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard(activeKeyword);
  }, [activeKeyword]);

  const handleItemSaved = async () => {
    const currentItemId = editingItem?.id ?? selectedItem?.id ?? null;
    setEditingItem(null);
    try {
      await Promise.all([loadItems(activeKeyword), loadReviews(), loadUpcomingReviews()]);
      if (currentItemId) {
        await openItemDetails(currentItemId);
      }
    } catch (err) {
      setError(getErrorMessage('刷新数据失败', err));
    }
  };

  const handleComplete = async (reviewId, studyNote) => {
    setCompletingReviewId(reviewId);
    setError('');
    try {
      await requestJson(
        `/reviews/${reviewId}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ studyNote })
        },
        '标记复习完成失败'
      );
      await Promise.all([loadItems(activeKeyword), loadReviews(), loadUpcomingReviews()]);
      if (selectedItem?.id) {
        await openItemDetails(selectedItem.id);
      }
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
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setSelectedItemReviews([]);
      }
      await Promise.all([loadItems(activeKeyword), loadReviews(), loadUpcomingReviews()]);
    } catch (err) {
      setError(getErrorMessage('删除知识点失败', err));
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setActiveKeyword(searchKeyword.trim());
  };

  const handleSearchClear = () => {
    setSearchKeyword('');
    setActiveKeyword('');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.title}>21天复习计划</h1>
            <p style={styles.subtitle}>
              支持搜索知识点、查看未来 7 天计划、打开单条知识点的完整复习明细，并保留每次学习时写下的笔记。
            </p>
          </div>
          <button type="button" style={styles.refreshButton} onClick={() => refreshDashboard(activeKeyword)} disabled={loading}>
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

        <div style={styles.middleGrid}>
          <UpcomingReviewList
            reviews={upcomingReviews}
            loading={upcomingLoading}
            onOpenDetails={(itemId) => openItemDetails(itemId)}
          />
          <ReviewHistoryPanel
            item={selectedItem}
            reviews={selectedItemReviews}
            loading={detailsLoading}
            onClose={() => {
              setSelectedItem(null);
              setSelectedItemReviews([]);
            }}
          />
        </div>

        <SearchToolbar
          value={searchKeyword}
          activeKeyword={activeKeyword}
          onChange={setSearchKeyword}
          onSubmit={handleSearchSubmit}
          onClear={handleSearchClear}
        />

        <KnowledgeItemList
          items={items}
          loading={itemsLoading}
          editingItemId={editingItem?.id ?? null}
          deletingItemId={deletingItemId}
          selectedItemId={selectedItem?.id ?? null}
          onEdit={setEditingItem}
          onDelete={handleDeleteItem}
          onViewDetails={(itemId) => openItemDetails(itemId)}
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
    maxWidth: '1180px',
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
    maxWidth: '760px',
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
  middleGrid: {
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
