import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { getInspections } from '../api';
import { Inspection } from '../types';
import {
  displayStatusLabel,
  DisplayInspectionStatus,
  getDisplayInspectionStatus,
} from '../inspectionStatus';

const STATUS_COLORS: Record<string, string> = {
  Planned: '#7a6ea8',
  'In Progress': '#5f5a66',
  Succeeded: '#f28848',
  Failed: ' #e75a7c',
};

const DASHBOARD_STATUS_BADGE_CLASS: Record<DisplayInspectionStatus, string> = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

export default function Dashboard() {
  // Page data and request state.
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load inspections once.
  useEffect(() => {
    getInspections()
      .then((data) => {
        setInspections(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load inspections.');
        setLoading(false);
      });
  }, []);

  const total = inspections.length;
  const planned = inspections.filter((i) => i.status === 'PLANNED').length;
  const inProgress = inspections.filter(
    (i) => i.status === 'IN_PROGRESS',
  ).length;
  const succeeded = inspections.filter(
    (i) => getDisplayInspectionStatus(i) === 'SUCCEEDED',
  ).length;
  const failed = inspections.filter(
    (i) => getDisplayInspectionStatus(i) === 'FAILED',
  ).length;

  // Show only the newest items in the "Recent Inspections" table.
  const recent = [...inspections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // Pie chart source data: only include statuses with count > 0.
  const pieData = [
    { name: 'Planned', value: planned },
    { name: 'In Progress', value: inProgress },
    { name: 'Succeeded', value: succeeded },
    { name: 'Failed', value: failed },
  ].filter((d) => d.value > 0);

  // Aggregate status counts per month for the stacked bar chart.
  const monthlyCounts: Record<
    string,
    {
      Planned: number;
      'In Progress': number;
      Succeeded: number;
      Failed: number;
    }
  > = {};
  inspections.forEach((insp) => {
    const month = insp.date.slice(0, 7);
    if (!monthlyCounts[month])
      monthlyCounts[month] = {
        Planned: 0,
        'In Progress': 0,
        Succeeded: 0,
        Failed: 0,
      };
    const status = displayStatusLabel[getDisplayInspectionStatus(insp)] as
      | 'Planned'
      | 'In Progress'
      | 'Succeeded'
      | 'Failed';
    monthlyCounts[month][status]++;
  });
  const barData = Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, counts]) => ({ month, ...counts }));

  return (
    <div>
      {/* Dashboard header with quick action to create a new inspection */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of all inspections</p>
        </div>
        <Link to="/inspections" state={{ openNewModal: true }} className="btn btn-primary">
          + New Inspection
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}

  {/* Top-level KPI cards */}
      <div className="stats-grid">
        <div className="stat-card-total">
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total Inspections</div>
        </div>
        <div className="stat-card planned">
          <div className="stat-number">{planned}</div>
          <div className="stat-label">Planned</div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-number">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card succeeded">
          <div className="stat-number">{succeeded}</div>
          <div className="stat-label">Succeeded</div>
        </div>
        <div className="stat-card failed">
          <div className="stat-number">{failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

  {/* Analytics charts shown when inspection data is available */}
      {!loading && total > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="card">
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              Inspections per Month
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={barData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Planned" fill={STATUS_COLORS['Planned']} />
                <Bar
                  dataKey="In Progress"
                  fill={STATUS_COLORS['In Progress']}
                />
                <Bar dataKey="Succeeded" fill={STATUS_COLORS['Succeeded']} />
                <Bar dataKey="Failed" fill={STATUS_COLORS['Failed']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

  {/* Recent inspections table with loading and empty states */}
      <div className="card">
        <h2
          style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}
        >
          Recent Inspections
        </h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>
              No inspections yet. <Link to="/inspections">Create one</Link>.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Steps</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((insp) => {
                  const displayStatus = getDisplayInspectionStatus(insp);

                  return (
                    <tr key={insp.id}>
                      <td style={{ fontWeight: 600 }}>
                        {insp.title || (
                          <span
                            style={{ color: '#a0aec0', fontStyle: 'italic' }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{insp.facilityName}</td>
                      <td>{insp.date}</td>
                      <td>{insp.responsibleEmployee}</td>
                      <td>
                        <span
                          className={`badge recent-status-badge ${DASHBOARD_STATUS_BADGE_CLASS[displayStatus]}`}
                        >
                          {displayStatusLabel[displayStatus]}
                        </span>
                      </td>
                      <td>{insp.steps?.length ?? 0}</td>
                      <td>
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
