import { useEffect, useRef, useState } from 'react';

export default function SearchToolbar({
  value,
  activeKeyword,
  selectedTagId,
  activeTagName,
  tagGroups,
  onChange,
  onTagChange
}) {
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const tagMenuRef = useRef(null);
  const activeFilters = [activeKeyword ? `关键词：${activeKeyword}` : '', activeTagName ? `标签：${activeTagName}` : ''].filter(Boolean);
  const selectedTag =
    tagGroups.flatMap((group) => group.tags).find((tag) => `${tag.id}` === selectedTagId) || null;

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

  const handleSelectTag = (tagId) => {
    onTagChange(tagId);
    setIsTagMenuOpen(false);
  };

  return (
    <section className="panel toolbar-panel">
      <div className="toolbar-controls">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-input"
          placeholder="搜索标题、内容或标签"
        />
      </div>

      <div className="toolbar-filters">
        <label className="form-field toolbar-filter-field">
          <span className="field-label">按标签筛选</span>
          <div ref={tagMenuRef} className="custom-select">
            <button
              type="button"
              className={`custom-select-trigger ${isTagMenuOpen ? 'is-open' : ''}`}
              onClick={() => setIsTagMenuOpen((open) => !open)}
            >
              <span>{selectedTag?.name || '全部标签'}</span>
              <span className="custom-select-caret" />
            </button>
            {isTagMenuOpen ? (
              <div className="custom-select-menu custom-select-menu-grouped">
                <button
                  type="button"
                  className={`custom-select-option ${selectedTagId === '' ? 'is-selected' : ''}`}
                  onClick={() => handleSelectTag('')}
                >
                  全部标签
                </button>
                {tagGroups.map((group) => (
                  <div key={group.id} className="custom-select-group">
                    <div className="custom-select-group-label">{group.name}</div>
                    {group.tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`custom-select-option ${selectedTagId === `${tag.id}` ? 'is-selected' : ''}`}
                        onClick={() => handleSelectTag(`${tag.id}`)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </label>
      </div>

      {activeFilters.length > 0 ? <p className="search-active">{activeFilters.join(' · ')}</p> : null}
    </section>
  );
}
