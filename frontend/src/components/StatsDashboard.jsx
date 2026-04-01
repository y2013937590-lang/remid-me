const CHART_COLORS = ['#b64926', '#1f6f78', '#d48a3a', '#5f6caf', '#2f8f5b', '#7e4b8b', '#c35a74', '#6f6259'];

export default function StatsDashboard({ stats, loading }) {
  if (loading) {
    return <section className="panel"><p className="muted-text">加载中...</p></section>;
  }

  if (!stats) {
    return <section className="panel"><p className="empty-state">暂无统计</p></section>;
  }

  const summaryCards = [
    { label: '知识点', value: stats.totalItems || 0 },
    { label: '标签', value: stats.totalTags || 0 },
    { label: '计划', value: stats.totalPlans || 0 },
    { label: '完成率', value: `${stats.completionRate || 0}%` },
    { label: '今日', value: stats.dueToday || 0 },
    { label: '逾期', value: stats.overduePlans || 0 }
  ];

  return (
    <section className="stats-workspace">
      <div className="stats-grid stats-grid-six">
        {summaryCards.map((card, index) => (
          <article key={card.label} className={`panel stat-card stats-kpi-card tone-${(index % 4) + 1}`}>
            <span className="stat-label">{card.label}</span>
            <strong className="stat-value">{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="stats-chart-grid">
        <article className="panel chart-panel chart-panel-wide">
          <div className="chart-head">
            <strong>标签</strong>
          </div>
          <TagSummaryGrid points={stats.topTags || []} />
        </article>

        <article className="panel chart-panel chart-panel-wide">
          <div className="chart-head">
            <strong>完成趋势</strong>
          </div>
          <LineChart points={stats.recentCompletionTrend || []} />
        </article>

        <article className="panel chart-panel chart-panel-wide">
          <div className="chart-head">
            <strong>未来计划</strong>
          </div>
          <BarTrendChart points={stats.upcomingPlanTrend || []} />
        </article>

        <article className="panel chart-panel chart-panel-wide">
          <div className="chart-head">
            <strong>知识点增长</strong>
          </div>
          <MonthBarChart points={stats.itemGrowthTrend || []} />
        </article>
      </div>
    </section>
  );
}

function TagSummaryGrid({ points }) {
  if (!points.length) {
    return <p className="empty-state">暂无数据</p>;
  }

  const total = points.reduce((sum, point) => sum + (point.value || 0), 0);

  return (
    <div className="tag-stats-grid">
      {points.map((point, index) => (
        <article key={point.label} className="tag-stats-card">
          <div className="tag-stats-head">
            <span className="tag-stats-rank">{String(index + 1).padStart(2, '0')}</span>
            <span className="tag tag-neutral tag-stats-chip" title={point.label}>
              {point.label}
            </span>
          </div>
          <div className="tag-stats-value">{point.value}</div>
          <div className="tag-stats-share">
            {total === 0 ? '0%' : `${Math.round(((point.value || 0) / total) * 100)}%`}
          </div>
          <div className="tag-stats-meter">
            <div
              className="tag-stats-meter-fill"
              style={{
                width: total === 0 ? '0%' : `${((point.value || 0) / total) * 100}%`,
                background: CHART_COLORS[index % CHART_COLORS.length]
              }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function LineChart({ points }) {
  if (!points.length) {
    return <p className="empty-state">暂无数据</p>;
  }

  const width = 720;
  const height = 220;
  const paddingX = 52;
  const paddingY = 24;
  const maxValue = Math.max(...points.map((point) => point.value || 0), 1);
  const stepX = points.length === 1 ? 0 : (width - paddingX * 2) / (points.length - 1);
  const axisLabels = points.filter((_, index) => index === 0 || index === points.length - 1 || index % 2 === 1);
  const yTicks = [maxValue, Math.round(maxValue / 2), 0];

  const coordinates = points.map((point, index) => {
    const x = paddingX + index * stepX;
    const y = height - paddingY - ((point.value || 0) / maxValue) * (height - paddingY * 2);
    return { x, y, point };
  });

  const path = coordinates
    .map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ');
  const areaPath = `${path} L ${coordinates.at(-1)?.x || paddingX} ${height - paddingY} L ${coordinates[0]?.x || paddingX} ${height - paddingY} Z`;

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label="完成趋势">
        <defs>
          <linearGradient id="stats-line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(31, 111, 120, 0.30)" />
            <stop offset="100%" stopColor="rgba(31, 111, 120, 0.02)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="18" fill="rgba(255, 255, 255, 0.38)" />
        {yTicks.map((tickValue, index) => {
          const y = height - paddingY - (tickValue / maxValue) * (height - paddingY * 2);
          return (
            <g key={`${tickValue}-${index}`}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} className="chart-grid-line" />
              <text x={paddingX - 10} y={y + 4} textAnchor="end" className="chart-y-label">
                {tickValue}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#stats-line-fill)" />
        <path d={path} fill="none" stroke={CHART_COLORS[1]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {coordinates.map(({ x, y, point }) => {
          return <circle key={point.date} cx={x} cy={y} r="5" fill={CHART_COLORS[1]} />;
        })}
      </svg>
      <div className="chart-axis chart-axis-readable">
        {axisLabels.map((point) => (
          <span key={point.date} title={point.date}>
            {formatShortDate(point.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarTrendChart({ points }) {
  if (!points.length) {
    return <p className="empty-state">暂无数据</p>;
  }

  const maxValue = Math.max(...points.map((point) => point.value || 0), 1);

  return (
    <div className="trend-bars trend-bars-soft">
      {points.map((point, index) => (
        <div key={point.date} className="trend-bar-col">
          <div className="trend-bar-value">{point.value}</div>
          <div className="trend-bar-track">
            <div
              className="trend-bar-fill"
              style={{
                height: `${((point.value || 0) / maxValue) * 100}%`,
                background: CHART_COLORS[index % CHART_COLORS.length]
              }}
          />
          </div>
          <span className="trend-bar-label">{index % 2 === 0 ? point.date.slice(5) : ''}</span>
        </div>
      ))}
    </div>
  );
}

function MonthBarChart({ points }) {
  if (!points.length) {
    return <p className="empty-state">暂无数据</p>;
  }

  const maxValue = Math.max(...points.map((point) => point.value || 0), 1);

  return (
    <div className="month-growth-grid">
      {points.map((point, index) => (
        <div key={point.month} className="month-growth-card">
          <strong className="month-growth-value">{point.value}</strong>
          <div className="month-growth-track">
            <div
              className="month-growth-fill"
              style={{
                height: `${Math.max(((point.value || 0) / maxValue) * 100, point.value > 0 ? 12 : 6)}%`,
                background: CHART_COLORS[(index + 2) % CHART_COLORS.length]
              }}
            />
          </div>
          <span className="month-growth-label">{point.month.slice(2)}</span>
        </div>
      ))}
    </div>
  );
}

function formatShortDate(value) {
  return value.slice(5).replace('-', '/');
}
