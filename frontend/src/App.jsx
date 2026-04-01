import { useEffect, useState } from 'react';
import AddItemForm from './components/AddItemForm';
import TodayReviewList from './components/TodayReviewList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function App() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTodayReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/today`);
      if (!response.ok) {
        throw new Error('加载今日复习列表失败');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayReviews();
  }, []);

  const handleItemCreated = () => {
    loadTodayReviews();
  };

  const handleComplete = async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/complete`, {
      method: 'PUT'
    });

    if (!response.ok) {
      const message = '标记复习完成失败';
      setError(message);
      throw new Error(message);
    }

    setReviews((prev) => prev.filter((item) => item.reviewId !== reviewId));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1>21天复习计划</h1>
        <p>添加知识点后，系统会自动生成 7 条复习计划。</p>
        {error ? <div style={styles.error}>{error}</div> : null}
        <AddItemForm apiBaseUrl={API_BASE_URL} onCreated={handleItemCreated} />
        <TodayReviewList reviews={reviews} loading={loading} onComplete={handleComplete} />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    padding: '32px 16px',
    fontFamily: 'sans-serif'
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
  },
  error: {
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  }
};
