import { useState } from 'react';

export default function UpcomingReviewList({ reviews, loading, selectedDateKey, onSelectDate }) {
  const groupedReviews = reviews.reduce((groups, review) => {
    const dateKey = review.scheduledDate || '未安排';
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(review);
    return groups;
  }, {});
  const currentMonthKey = formatMonthKey(new Date());
  const [visibleMonthKey, setVisibleMonthKey] = useState(currentMonthKey);

  const visibleMonth = buildVisibleMonth(visibleMonthKey, groupedReviews);

  return (
    <section className="panel">
      <div className="section-header">
        <div className="calendar-nav">
          <button
            type="button"
            className="button-secondary calendar-nav-button"
            onClick={() => setVisibleMonthKey(shiftMonthKey(visibleMonthKey, -1))}
            aria-label="上个月"
          >
            ◀
          </button>
          <div className="calendar-nav-title">{visibleMonth.label}</div>
          <button
            type="button"
            className="button-secondary calendar-nav-button"
            onClick={() => setVisibleMonthKey(shiftMonthKey(visibleMonthKey, 1))}
            aria-label="下个月"
          >
            ▶
          </button>
        </div>
      </div>
      {loading ? <p className="muted-text">加载中...</p> : null}
      {!loading && reviews.length === 0 ? <p className="empty-state">没有未来计划。</p> : null}
      {!loading && reviews.length > 0 ? (
        <>
          <div className="calendar-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="calendar-weekday-header">{label}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {visibleMonth.days.map((day, index) =>
              day ? (
                <button
                  key={day.key}
                  type="button"
                  className={`calendar-day ${day.isToday ? 'is-today' : ''} ${selectedDateKey === day.key ? 'is-selected' : ''}`}
                  onClick={() => onSelectDate(day.key, day.reviews)}
                >
                  <div className="calendar-day-head">
                    <span className="calendar-date">{day.dateLabel}</span>
                    {day.reviews.length > 0 ? <span className="calendar-dot" /> : null}
                  </div>
                  {day.reviews.length > 0 ? <span className="calendar-day-note">{day.reviews.length} 项</span> : null}
                </button>
              ) : (
                <div key={`empty-${visibleMonth.key}-${index}`} className="calendar-day calendar-day-empty" aria-hidden="true" />
              )
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function buildVisibleMonth(monthKey, groupedReviews) {
  const currentMonth = parseMonthKey(monthKey);
  const todayKey = formatDateKey(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingEmpty = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: leadingEmpty }, () => null);

  for (let dayNumber = 1; dayNumber <= lastDay.getDate(); dayNumber += 1) {
    const currentDate = new Date(year, month, dayNumber);
    const key = formatDateKey(currentDate);
    days.push({
      key,
      dateLabel: `${dayNumber}`,
      isToday: key === todayKey,
      reviews: groupedReviews[key] || []
    });
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return {
    key: monthKey,
    label: `${year}年${month + 1}月`,
    days
  };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

function parseMonthKey(value) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function shiftMonthKey(value, delta) {
  const date = parseMonthKey(value);
  date.setMonth(date.getMonth() + delta);
  return formatMonthKey(date);
}
