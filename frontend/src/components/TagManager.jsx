import { useEffect, useRef, useState } from 'react';

export default function TagManager({
  categories,
  tags,
  loading,
  creatingTag,
  updatingTagId,
  deletingTagId,
  creatingCategory,
  updatingCategoryId,
  deletingCategoryId,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderTag
}) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategoryId, setNewTagCategoryId] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryDraftName, setCategoryDraftName] = useState('');
  const [categoryDraftSortOrder, setCategoryDraftSortOrder] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [tagDraftName, setTagDraftName] = useState('');
  const [dropTarget, setDropTarget] = useState(null);
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState([]);
  const categoryMenuRef = useRef(null);
  const dragTriggeredRef = useRef(false);
  const uncategorizedTags = tags.filter((tag) => tag.categoryId == null);
  const selectedCategory = categories.find((category) => `${category.id}` === newTagCategoryId) || null;

  const groups = categories.map((category) => ({
    id: category.id,
    key: `category-${category.id}`,
    name: category.name,
    sortOrder: category.sortOrder,
    tagCount: category.tagCount,
    tags: tags.filter((tag) => tag.categoryId === category.id)
  }));

  if (uncategorizedTags.length > 0) {
    groups.push({
      id: null,
      key: 'uncategorized',
      name: '未分类',
      sortOrder: null,
      tagCount: uncategorizedTags.length,
      tags: uncategorizedTags
    });
  }

  useEffect(() => {
    if (!activeCategory?.id) {
      setCategoryDraftName('');
      setCategoryDraftSortOrder('');
      return;
    }

    const currentCategory = categories.find((category) => category.id === activeCategory.id);
    setCategoryDraftName(currentCategory?.name || '');
    setCategoryDraftSortOrder(currentCategory?.sortOrder ? `${currentCategory.sortOrder}` : '');
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!activeTag?.id) {
      setTagDraftName('');
      return;
    }

    const currentTag = tags.find((tag) => tag.id === activeTag.id);
    setTagDraftName(currentTag?.name || '');
  }, [activeTag, tags]);

  useEffect(() => {
    setCollapsedGroupKeys((previousKeys) => previousKeys.filter((key) => groups.some((group) => group.key === key)));
  }, [groups]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (categoryMenuRef.current?.contains(event.target)) {
        return;
      }
      setIsCategoryMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const value = newCategoryName.trim();
    if (!value) {
      return;
    }

    await onCreateCategory(value);
    setNewCategoryName('');
  };

  const handleCreateTag = async (event) => {
    event.preventDefault();
    const value = newTagName.trim();
    if (!value) {
      return;
    }

    await onCreateTag(value, parseCategoryId(newTagCategoryId));
    setNewTagName('');
    setNewTagCategoryId('');
    setIsCategoryMenuOpen(false);
  };

  const handleRenameCategory = async (event) => {
    event.preventDefault();
    if (!activeCategory?.id) {
      return;
    }

    const name = categoryDraftName.trim();
    if (!name) {
      return;
    }

    await onUpdateCategory(activeCategory.id, name, parseSortOrder(categoryDraftSortOrder));
    setActiveCategory(null);
    setCategoryDraftName('');
    setCategoryDraftSortOrder('');
  };

  const handleRenameTag = async (event) => {
    event.preventDefault();
    if (!activeTag?.id) {
      return;
    }

    const value = tagDraftName.trim();
    if (!value) {
      return;
    }

    const currentTag = tags.find((tag) => tag.id === activeTag.id);
    await onUpdateTag(activeTag.id, value, currentTag?.categoryId ?? null);
    setActiveTag(null);
    setTagDraftName('');
  };

  const handleDragStart = (event, tagId) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `${tagId}`);
    dragTriggeredRef.current = true;
  };

  const handleDragEnd = () => {
    setDropTarget(null);
    window.setTimeout(() => {
      dragTriggeredRef.current = false;
    }, 0);
  };

  const handleDragOverTarget = (event, categoryId, categoryKey, targetIndex, placement = 'inside') => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const nextTarget = { categoryId, categoryKey, targetIndex, placement };
    if (
      !dropTarget ||
      dropTarget.categoryKey !== nextTarget.categoryKey ||
      dropTarget.targetIndex !== nextTarget.targetIndex ||
      dropTarget.placement !== nextTarget.placement
    ) {
      setDropTarget(nextTarget);
    }
  };

  const handleDragOverRow = (event, group, index) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const shouldPlaceBefore = event.clientY < bounds.top + bounds.height / 2;
    handleDragOverTarget(
      event,
      group.id,
      group.key,
      shouldPlaceBefore ? index : index + 1,
      shouldPlaceBefore ? 'before' : 'after'
    );
  };

  const handleDropRow = async (event, group, index) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const shouldPlaceBefore = event.clientY < bounds.top + bounds.height / 2;
    await handleDrop(event, group.id, shouldPlaceBefore ? index : index + 1);
  };

  const handleDrop = async (event, categoryId, targetIndex) => {
    event.preventDefault();
    const tagId = Number(event.dataTransfer.getData('text/plain') || 0);
    setDropTarget(null);
    if (!tagId) {
      return;
    }

    await onReorderTag(tagId, categoryId, targetIndex);
  };

  const toggleCollapsedGroup = (groupKey) => {
    setCollapsedGroupKeys((previousKeys) =>
      previousKeys.includes(groupKey) ? previousKeys.filter((key) => key !== groupKey) : [...previousKeys, groupKey]
    );
  };

  return (
    <>
      <section className="panel tag-panel">
        <div className="tag-manager-grid">
          <article className="tag-admin-card">
            <span className="field-label">新建分类</span>
            <form className="tag-create-row" onSubmit={handleCreateCategory}>
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="field-input"
              />
              <button type="submit" className="button-primary" disabled={creatingCategory || !newCategoryName.trim()}>
                {creatingCategory ? '提交中...' : '新建'}
              </button>
            </form>
          </article>

          <article className="tag-admin-card">
            <span className="field-label">新建标签</span>
            <form className="tag-create-row tag-create-row-tag" onSubmit={handleCreateTag}>
              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                className="field-input"
              />
              <div ref={categoryMenuRef} className="custom-select">
                <button
                  type="button"
                  className={`custom-select-trigger ${isCategoryMenuOpen ? 'is-open' : ''}`}
                  onClick={() => setIsCategoryMenuOpen((open) => !open)}
                >
                  <span>{selectedCategory?.name || '未分类'}</span>
                  <span className="custom-select-caret" />
                </button>
                {isCategoryMenuOpen ? (
                  <div className="custom-select-menu">
                    <button
                      type="button"
                      className={`custom-select-option ${newTagCategoryId === '' ? 'is-selected' : ''}`}
                      onClick={() => {
                        setNewTagCategoryId('');
                        setIsCategoryMenuOpen(false);
                      }}
                    >
                      未分类
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className={`custom-select-option ${newTagCategoryId === `${category.id}` ? 'is-selected' : ''}`}
                        onClick={() => {
                          setNewTagCategoryId(`${category.id}`);
                          setIsCategoryMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button type="submit" className="button-primary" disabled={creatingTag || !newTagName.trim()}>
                {creatingTag ? '提交中...' : '新建'}
              </button>
            </form>
          </article>
        </div>

        {loading ? <p className="muted-text">加载中...</p> : null}
        {!loading && tags.length === 0 && categories.length === 0 ? <p className="empty-state">暂无分类和标签</p> : null}

        {!loading && groups.some((group) => group.tags.length > 0 || group.id !== null) ? (
          <div className="tag-group-list">
            {groups.map((group) => {
              const isCollapsed = collapsedGroupKeys.includes(group.key);

              return (
                <section key={group.key} className="tag-group-card">
                  <div
                    className={`tag-group-head ${group.id !== null ? 'is-clickable' : ''}`}
                    onClick={() => {
                      if (group.id === null) {
                        return;
                      }
                      setActiveCategory(group);
                    }}
                  >
                    <div className="tag-group-main">
                      <button
                        type="button"
                        className={`collapse-toggle ${isCollapsed ? 'is-collapsed' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleCollapsedGroup(group.key);
                        }}
                        aria-label={isCollapsed ? '展开分类标签' : '收起分类标签'}
                      >
                        <span className="collapse-toggle-icon" />
                      </button>
                      <strong className="tag-group-name">{group.name}</strong>
                      <span className="tag tag-neutral">{group.tagCount}</span>
                    </div>
                  </div>

                  {!isCollapsed ? (
                    <div className="tag-group-tags">
                      {group.tags.length === 0 ? <div className="empty-state tag-inline-empty">暂无标签</div> : null}

                      {group.tags.map((tag, index) => (
                        <div key={tag.id} className="tag-stack-row">
                          <article
                            className={`tag-inline-row ${resolveDropClass(dropTarget, group.key, index)}`}
                            draggable
                            onClick={() => {
                              if (dragTriggeredRef.current) {
                                return;
                              }
                              setActiveTag(tag);
                            }}
                            onDragStart={(event) => handleDragStart(event, tag.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(event) => handleDragOverRow(event, group, index)}
                            onDrop={(event) => handleDropRow(event, group, index)}
                          >
                            <div className="tag-inline-main">
                              <span className="tag tag-neutral tag-admin-chip">{tag.name}</span>
                              <strong className="tag-admin-count">{tag.itemCount}</strong>
                            </div>
                          </article>
                        </div>
                      ))}

                      <div
                        className={`tag-drop-tail ${isDropTarget(dropTarget, group.key, group.tags.length, 'tail') ? 'is-active' : ''}`}
                        onDragOver={(event) => handleDragOverTarget(event, group.id, group.key, group.tags.length, 'tail')}
                        onDrop={(event) => handleDrop(event, group.id, group.tags.length)}
                      />
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : null}
      </section>

      {activeCategory?.id ? (
        <div className="modal-backdrop" onClick={() => setActiveCategory(null)}>
          <div className="modal-card modal-card-compact" onClick={(event) => event.stopPropagation()}>
            <section className="panel form-panel">
              <form className="tag-edit-modal" onSubmit={handleRenameCategory}>
                <input
                  value={categoryDraftName}
                  onChange={(event) => setCategoryDraftName(event.target.value)}
                  className="field-input"
                />
                <input
                  type="number"
                  min="1"
                  value={categoryDraftSortOrder}
                  onChange={(event) => setCategoryDraftSortOrder(event.target.value)}
                  className="field-input"
                />
                <div className="button-row">
                  <button
                    type="submit"
                    className="button-primary"
                    disabled={updatingCategoryId === activeCategory.id || !categoryDraftName.trim()}
                  >
                    {updatingCategoryId === activeCategory.id ? '保存中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => {
                      onDeleteCategory(activeCategory.id);
                      setActiveCategory(null);
                    }}
                    disabled={deletingCategoryId === activeCategory.id}
                  >
                    {deletingCategoryId === activeCategory.id ? '删除中...' : '删除'}
                  </button>
                  <button type="button" className="button-secondary" onClick={() => setActiveCategory(null)}>
                    取消
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      ) : null}

      {activeTag?.id ? (
        <div className="modal-backdrop" onClick={() => setActiveTag(null)}>
          <div className="modal-card modal-card-compact" onClick={(event) => event.stopPropagation()}>
            <section className="panel form-panel">
              <form className="tag-edit-modal" onSubmit={handleRenameTag}>
                <input
                  value={tagDraftName}
                  onChange={(event) => setTagDraftName(event.target.value)}
                  className="field-input"
                />
                <div className="button-row">
                  <button
                    type="submit"
                    className="button-primary"
                    disabled={updatingTagId === activeTag.id || !tagDraftName.trim()}
                  >
                    {updatingTagId === activeTag.id ? '保存中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => {
                      onDeleteTag(activeTag.id);
                      setActiveTag(null);
                    }}
                    disabled={deletingTagId === activeTag.id}
                  >
                    {deletingTagId === activeTag.id ? '删除中...' : '删除'}
                  </button>
                  <button type="button" className="button-secondary" onClick={() => setActiveTag(null)}>
                    取消
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

function isDropTarget(dropTarget, categoryKey, targetIndex, placement) {
  return Boolean(
    dropTarget &&
      dropTarget.categoryKey === categoryKey &&
      dropTarget.targetIndex === targetIndex &&
      (placement ? dropTarget.placement === placement : true)
  );
}

function resolveDropClass(dropTarget, categoryKey, index) {
  if (!dropTarget || dropTarget.categoryKey !== categoryKey) {
    return '';
  }
  if (dropTarget.targetIndex === index && dropTarget.placement === 'before') {
    return 'is-drop-before';
  }
  if (dropTarget.targetIndex === index + 1 && dropTarget.placement === 'after') {
    return 'is-drop-after';
  }
  return '';
}

function parseCategoryId(value) {
  return value ? Number(value) : null;
}

function parseSortOrder(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
}
