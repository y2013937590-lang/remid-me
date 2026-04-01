import { useEffect, useRef, useState } from 'react';
import AddItemForm from './components/AddItemForm';
import KnowledgeItemList from './components/KnowledgeItemList';
import ReviewHistoryPanel from './components/ReviewHistoryPanel';
import SearchToolbar from './components/SearchToolbar';
import StatsDashboard from './components/StatsDashboard';
import TagManager from './components/TagManager';
import TodayReviewList from './components/TodayReviewList';
import UpcomingReviewList from './components/UpcomingReviewList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const ITEMS_PER_PAGE = 20;
const VIEW_CONFIG = {
  overview: {
    label: '总览'
  },
  review: {
    label: '复习'
  },
  upcoming: {
    label: '未来计划'
  },
  library: {
    label: '知识库'
  },
  stats: {
    label: '统计'
  },
  tags: {
    label: '标签'
  }
};

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUpcomingDate, setSelectedUpcomingDate] = useState(null);
  const [selectedUpcomingReviews, setSelectedUpcomingReviews] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemReviews, setSelectedItemReviews] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [libraryPage, setLibraryPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalLibraryPages, setTotalLibraryPages] = useState(1);
  const [completingReviewId, setCompletingReviewId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [updatingTagId, setUpdatingTagId] = useState(null);
  const [deletingTagId, setDeletingTagId] = useState(null);
  const [deleteDialogItem, setDeleteDialogItem] = useState(null);
  const [deleteDialogTag, setDeleteDialogTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const drawerPanelRef = useRef(null);

  const dueCount = reviews.length;
  const overdueCount = reviews.filter((review) => review.overdue).length;
  const totalPlans = items.reduce((sum, item) => sum + (item.totalPlans || 0), 0);
  const completedPlans = items.reduce((sum, item) => sum + (item.completedPlans || 0), 0);
  const completionRate = totalPlans === 0 ? 0 : Math.round((completedPlans / totalPlans) * 100);
  const focusReview = reviews[0] || null;
  const overviewItems = items.slice(0, 3);
  const viewBadgeMap = {
    overview: `${completionRate}%`,
    review: `${dueCount}`,
    upcoming: `${upcomingReviews.length}`,
    library: `${totalItems}`,
    stats: `${stats?.completionRate ?? completionRate}%`,
    tags: `${tags.length}`
  };

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

  const loadItems = async (keyword = activeKeyword, page = libraryPage) => {
    setItemsLoading(true);
    try {
      const params = new URLSearchParams({
        page: `${page}`,
        pageSize: `${ITEMS_PER_PAGE}`
      });
      if (keyword) {
        params.set('q', keyword);
      }
      const data = await requestJson(`/items?${params.toString()}`, {}, '加载知识点列表失败');
      setItems(data.items || []);
      setTotalItems(data.total || 0);
      setTotalLibraryPages(data.totalPages || 1);
      if (typeof data.page === 'number' && data.page !== libraryPage) {
        setLibraryPage(data.page);
      }
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

  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const data = await requestJson('/tags', {}, '加载标签失败');
      setTags(data);
      return data;
    } finally {
      setTagsLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await requestJson('/stats/overview', {}, '加载统计失败');
      setStats(data);
      return data;
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUpcomingReviews = async () => {
    setUpcomingLoading(true);
    try {
      const data = await requestJson('/reviews/upcoming', {}, '加载未来计划失败');
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

  const refreshDashboard = async (keyword = activeKeyword, page = libraryPage) => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadItems(keyword, page), loadReviews(), loadUpcomingReviews(), loadTags(), loadStats()]);
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
    refreshDashboard(activeKeyword, libraryPage);
  }, [activeKeyword, libraryPage]);

  useEffect(() => {
    if (!isDetailsOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (drawerPanelRef.current?.contains(event.target)) {
        return;
      }

      setIsDetailsOpen(false);
      setSelectedItem(null);
      setSelectedItemReviews([]);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isDetailsOpen]);

  const handleItemSaved = async () => {
    const currentItemId = editingItem?.id ?? selectedItem?.id ?? null;
    setEditingItem(null);
    setIsItemModalOpen(false);
    try {
      await Promise.all([loadItems(activeKeyword, libraryPage), loadReviews(), loadUpcomingReviews(), loadTags(), loadStats()]);
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
      await Promise.all([loadItems(activeKeyword, libraryPage), loadReviews(), loadUpcomingReviews(), loadTags(), loadStats()]);
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
    setDeleteDialogItem(items.find((item) => item.id === itemId) || { id: itemId });
  };

  const handleConfirmDeleteItem = async () => {
    if (!deleteDialogItem?.id) {
      return;
    }

    const itemId = deleteDialogItem.id;
    setDeletingItemId(itemId);
    setError('');
    try {
      await requestJson(`/items/${itemId}`, { method: 'DELETE' }, '删除知识点失败');
      if (editingItem?.id === itemId) {
        setEditingItem(null);
        setIsItemModalOpen(false);
      }
      if (selectedItem?.id === itemId) {
        setIsDetailsOpen(false);
        setSelectedItem(null);
        setSelectedItemReviews([]);
      }
      await Promise.all([loadItems(activeKeyword, libraryPage), loadReviews(), loadUpcomingReviews(), loadTags(), loadStats()]);
    } catch (err) {
      setError(getErrorMessage('删除知识点失败', err));
    } finally {
      setDeletingItemId(null);
      setDeleteDialogItem(null);
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setLibraryPage(1);
    setActiveKeyword(searchKeyword.trim());
  };

  const handleSearchClear = () => {
    setSearchKeyword('');
    setLibraryPage(1);
    setActiveKeyword('');
  };

  const handleTagFilter = async (tag) => {
    const normalizedTag = tag.trim();
    if (!normalizedTag) {
      return;
    }

    setActiveView('library');
    setSearchKeyword(normalizedTag);
    setSelectedUpcomingDate(null);
    if (activeKeyword === normalizedTag && libraryPage === 1) {
      await loadItems(normalizedTag, 1);
      return;
    }
    setLibraryPage(1);
    setActiveKeyword(normalizedTag);
  };

  const handleOpenDetails = async (itemId, targetView = 'library') => {
    setActiveView(targetView);
    setIsDetailsOpen(true);
    await openItemDetails(itemId);
  };

  const refreshTagDependencies = async () => {
    await Promise.all([loadTags(), loadItems(activeKeyword, libraryPage)]);
    if (selectedItem?.id) {
      await openItemDetails(selectedItem.id);
    }
  };

  const handleEditItem = async (item) => {
    setError('');
    try {
      const detail = await requestJson(`/items/${item.id}`, {}, '加载知识点详情失败');
      setEditingItem(detail);
      setActiveView('library');
      setIsItemModalOpen(true);
    } catch (err) {
      setError(getErrorMessage('加载知识点详情失败', err));
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setActiveView('library');
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(false);
  };

  const handleManageTags = () => {
    setEditingItem(null);
    setIsItemModalOpen(false);
    setActiveView('tags');
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedItem(null);
    setSelectedItemReviews([]);
  };

  const handleOpenUpcomingDate = (dateKey, dateReviews) => {
    setSelectedUpcomingDate(dateKey);
    setSelectedUpcomingReviews(dateReviews);
  };

  const handleCloseUpcomingDate = () => {
    setSelectedUpcomingDate(null);
    setSelectedUpcomingReviews([]);
  };

  const handleCreateTag = async (name) => {
    setCreatingTag(true);
    setError('');
    try {
      await requestJson(
        '/tags',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        },
        '新建标签失败'
      );
      await refreshTagDependencies();
    } catch (err) {
      const message = getErrorMessage('新建标签失败', err);
      setError(message);
      throw new Error(message);
    } finally {
      setCreatingTag(false);
    }
  };

  const handleRenameTag = async (tagId, name) => {
    setUpdatingTagId(tagId);
    setError('');
    try {
      await requestJson(
        `/tags/${tagId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        },
        '更新标签失败'
      );
      await refreshTagDependencies();
    } catch (err) {
      const message = getErrorMessage('更新标签失败', err);
      setError(message);
      throw new Error(message);
    } finally {
      setUpdatingTagId(null);
    }
  };

  const handleDeleteTag = async (tagId) => {
    setDeleteDialogTag(tags.find((tag) => tag.id === tagId) || { id: tagId });
  };

  const handleConfirmDeleteTag = async () => {
    if (!deleteDialogTag?.id) {
      return;
    }

    const tagId = deleteDialogTag.id;
    setDeletingTagId(tagId);
    setError('');
    try {
      await requestJson(`/tags/${tagId}`, { method: 'DELETE' }, '删除标签失败');
      await refreshTagDependencies();
    } catch (err) {
      const message = getErrorMessage('删除标签失败', err);
      setError(message);
      throw new Error(message);
    } finally {
      setDeletingTagId(null);
      setDeleteDialogTag(null);
    }
  };

  const renderOverview = () => (
    <>
      <section className="stats-grid">
        <article className="panel stat-card">
          <span className="stat-label">今日待处理</span>
          <strong className="stat-value">{dueCount}</strong>
        </article>
        <article className="panel stat-card">
          <span className="stat-label">逾期复习</span>
          <strong className="stat-value">{overdueCount}</strong>
        </article>
        <article className="panel stat-card">
          <span className="stat-label">知识点总数</span>
          <strong className="stat-value">{totalItems}</strong>
        </article>
        <article className="panel stat-card">
          <span className="stat-label">总体完成率</span>
          <strong className="stat-value">{completionRate}%</strong>
          <span className="stat-note">{completedPlans}/{totalPlans || 0}</span>
        </article>
      </section>

      <section className="overview-grid">
        <article className="panel panel-accent focus-card">
          <div className="section-header">
            <div>
              <span className="eyebrow">今日焦点</span>
              <h2 className="section-title">今日焦点</h2>
            </div>
          </div>

          {focusReview ? (
            <div className="focus-content">
              <div className="review-head">
                <h3 className="focus-title">{focusReview.title}</h3>
                <span className={`tag ${focusReview.overdue ? 'tag-danger' : 'tag-success'}`}>
                  {focusReview.overdue ? '逾期' : '今天'}
                </span>
              </div>
              <p className="muted-text">{focusReview.content || '这条知识点还没有补充说明。'}</p>
              <p className="mini-meta">计划日期：{focusReview.scheduledDate}</p>
              <div className="button-row">
                <button type="button" className="button-primary" onClick={() => setActiveView('review')}>
                  进入复习流
                </button>
                {focusReview.itemId ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => handleOpenDetails(focusReview.itemId, 'review')}
                  >
                    查看关联明细
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>今天没有待处理复习。现在更适合去知识库补充新内容，或者提前看看未来计划。</p>
              <div className="button-row">
                <button type="button" className="button-secondary" onClick={() => setActiveView('library')}>
                  打开知识库
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">知识库速览</span>
              <h2 className="section-title">知识库速览</h2>
            </div>
            <button type="button" className="button-link" onClick={() => setActiveView('library')}>
              打开
            </button>
          </div>
          {overviewItems.length === 0 ? (
            <p className="empty-state">还没有知识点，先录入一条新内容。</p>
          ) : (
            <div className="mini-list">
              {overviewItems.map((item) => (
                <button key={item.id} type="button" className="mini-item" onClick={() => handleOpenDetails(item.id, 'library')}>
                  <div className="review-head">
                    <strong className="mini-title">{item.title}</strong>
                    <span className="tag tag-neutral">{item.pendingPlans || 0} 待复习</span>
                  </div>
                  <span className="muted-text">{item.content || '暂无内容'}</span>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );

  const renderReviewWorkspace = () => (
    <section className="workspace-layout">
      <div className="workspace-main">
        <TodayReviewList
          reviews={reviews}
          loading={reviewsLoading}
          completingReviewId={completingReviewId}
          onComplete={handleComplete}
          onOpenDetails={(itemId) => handleOpenDetails(itemId, 'review')}
          onTagSelect={handleTagFilter}
        />
      </div>

      <aside className="workspace-side side-stack">
        <article className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">执行摘要</span>
              <h2 className="section-title">执行摘要</h2>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-row">
              <span>今日待处理</span>
              <strong>{dueCount}</strong>
            </div>
            <div className="summary-row">
              <span>逾期任务</span>
              <strong>{overdueCount}</strong>
            </div>
            <div className="summary-row">
              <span>未来 7 天</span>
              <strong>{upcomingReviews.length}</strong>
            </div>
            <div className="summary-row">
              <span>已选中明细</span>
              <strong>{selectedItem?.title || '未选择'}</strong>
            </div>
          </div>
        </article>
      </aside>
    </section>
  );

  const renderUpcomingWorkspace = () => (
    <section className="library-layout">
      <UpcomingReviewList
        reviews={upcomingReviews}
        loading={upcomingLoading}
        selectedDateKey={selectedUpcomingDate}
        onSelectDate={handleOpenUpcomingDate}
      />
    </section>
  );

  const renderLibraryWorkspace = () => (
    <>
      <SearchToolbar
        value={searchKeyword}
        activeKeyword={activeKeyword}
        onChange={setSearchKeyword}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
      />

      <section className="library-layout">
        <KnowledgeItemList
          items={items}
          loading={itemsLoading}
          currentPage={libraryPage}
          totalPages={totalLibraryPages}
          editingItemId={editingItem?.id ?? null}
          deletingItemId={deletingItemId}
          selectedItemId={selectedItem?.id ?? null}
          totalItems={totalItems}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onPageChange={setLibraryPage}
          onViewDetails={(itemId) => handleOpenDetails(itemId, 'library')}
          onTagSelect={handleTagFilter}
        />
      </section>
    </>
  );

  const renderTagsWorkspace = () => (
    <section className="library-layout">
      <TagManager
        tags={tags}
        loading={tagsLoading}
        creating={creatingTag}
        updatingTagId={updatingTagId}
        deletingTagId={deletingTagId}
        onCreate={handleCreateTag}
        onRename={handleRenameTag}
        onDelete={handleDeleteTag}
      />
    </section>
  );

  const renderStatsWorkspace = () => (
    <section className="library-layout">
      <StatsDashboard stats={stats} loading={statsLoading} />
    </section>
  );

  return (
    <div className="app-shell">
      <div className="app-frame app-layout">
        <aside className="panel app-sidebar">
          <div className="sidebar-top">
            <div className="sidebar-block">
              <span className="eyebrow">21 天复习计划</span>
              <h1 className="sidebar-title">Remid</h1>
            </div>

            <nav className="sidebar-nav" aria-label="主导航">
              {Object.entries(VIEW_CONFIG).map(([viewKey, viewMeta]) => (
                <button
                  key={viewKey}
                  type="button"
                  className={`sidebar-nav-item ${activeView === viewKey ? 'is-active' : ''}`}
                  onClick={() => setActiveView(viewKey)}
                >
                  <span className="sidebar-nav-label">{viewMeta.label}</span>
                  <span className="sidebar-nav-badge">{viewBadgeMap[viewKey]}</span>
                </button>
              ))}
            </nav>
          </div>

          <article className="sidebar-summary">
            <div className="summary-row">
              <span>今日待处理</span>
              <strong>{dueCount}</strong>
            </div>
            <div className="summary-row">
              <span>逾期复习</span>
              <strong>{overdueCount}</strong>
            </div>
          </article>
        </aside>

        <main className="app-main">
          <header className="panel workspace-header">
            <div className="workspace-header-bar">
              <div className="workspace-actions">
                <button type="button" className="button-primary" onClick={handleCreateItem}>
                  新建知识点
                </button>
              </div>
            </div>
          </header>

          {error ? <div className="alert-banner">{error}</div> : null}

          {activeView === 'overview' ? renderOverview() : null}
          {activeView === 'review' ? renderReviewWorkspace() : null}
          {activeView === 'upcoming' ? renderUpcomingWorkspace() : null}
          {activeView === 'library' ? renderLibraryWorkspace() : null}
          {activeView === 'stats' ? renderStatsWorkspace() : null}
          {activeView === 'tags' ? renderTagsWorkspace() : null}
        </main>
      </div>

      {isItemModalOpen ? (
        <div className="modal-backdrop" onClick={handleCloseItemModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <AddItemForm
              apiBaseUrl={API_BASE_URL}
              editingItem={editingItem}
              availableTags={tags}
              onSaved={handleItemSaved}
              onCancelEdit={handleCloseItemModal}
              onManageTags={handleManageTags}
            />
          </div>
        </div>
      ) : null}

      {deleteDialogItem ? (
        <div className="modal-backdrop" onClick={() => setDeleteDialogItem(null)}>
          <div className="modal-card modal-card-compact" onClick={(event) => event.stopPropagation()}>
            <section className="panel form-panel">
              <h2 className="section-title">删除知识点：{deleteDialogItem.title || '未命名'}</h2>
              <div className="button-row">
                <button type="button" className="button-danger" onClick={handleConfirmDeleteItem} disabled={deletingItemId === deleteDialogItem.id}>
                  {deletingItemId === deleteDialogItem.id ? '删除中...' : '确认删除'}
                </button>
                <button type="button" className="button-secondary" onClick={() => setDeleteDialogItem(null)}>
                  取消
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {deleteDialogTag ? (
        <div className="modal-backdrop" onClick={() => setDeleteDialogTag(null)}>
          <div className="modal-card modal-card-compact" onClick={(event) => event.stopPropagation()}>
            <section className="panel form-panel">
              <h2 className="section-title">删除标签：{deleteDialogTag.name || '未命名'}</h2>
              <div className="button-row">
                <button type="button" className="button-danger" onClick={handleConfirmDeleteTag} disabled={deletingTagId === deleteDialogTag.id}>
                  {deletingTagId === deleteDialogTag.id ? '删除中...' : '确认删除'}
                </button>
                <button type="button" className="button-secondary" onClick={() => setDeleteDialogTag(null)}>
                  取消
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {isDetailsOpen ? (
        <div className="drawer-shell">
          <aside ref={drawerPanelRef} className="drawer-panel">
            <ReviewHistoryPanel
              item={selectedItem}
              reviews={selectedItemReviews}
              loading={detailsLoading}
              onTagSelect={handleTagFilter}
            />
          </aside>
        </div>
      ) : null}

      {selectedUpcomingDate ? (
        <div className="modal-backdrop" onClick={handleCloseUpcomingDate}>
          <div className="modal-card modal-card-compact" onClick={(event) => event.stopPropagation()}>
            <section className="panel form-panel">
              <h3 className="section-title">{selectedUpcomingDate}</h3>
              {selectedUpcomingReviews.length === 0 ? (
                <p className="empty-state">当天没有计划。</p>
              ) : (
                <div className="list-stack">
                  {selectedUpcomingReviews.map((review) => (
                    <div key={review.reviewId} className="mini-item">
                      <button
                        type="button"
                        className="mini-item-link"
                        onClick={() => {
                          handleOpenDetails(review.itemId, 'upcoming');
                        }}
                      >
                        <strong className="mini-title">{review.title}</strong>
                      </button>
                      {parseTags(review.tags).length > 0 ? (
                        <div className="tag-list">
                          {parseTags(review.tags).map((tag) => (
                            <button
                              key={`${review.reviewId}-${tag}`}
                              type="button"
                              className="tag tag-neutral tag-button"
                              onClick={() => handleTagFilter(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              <div className="button-row">
                <button type="button" className="button-secondary" onClick={handleCloseUpcomingDate}>
                  关闭
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function parseTags(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
