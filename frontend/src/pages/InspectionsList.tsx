import React, { useEffect, useMemo, useState } from 'react';
import '../styles/InspectionsList.css';
import { Link, useLocation } from 'react-router-dom';
import { getInspections, createInspection, getChecklists } from '../api';
import { Inspection, Checklist } from '../types';
import {
  DisplayInspectionStatus,
  displayStatusBadgeClass,
  displayStatusLabel,
  displayStatusSortOrder,
  getDisplayInspectionStatus,
} from '../inspectionStatus';

type StatusFilter = 'ALL' | DisplayInspectionStatus;
type SortOption =
  | 'DATE_DESC'
  | 'DATE_ASC'
  | 'FACILITY_ASC'
  | 'FACILITY_DESC'
  | 'EMPLOYEE_ASC'
  | 'EMPLOYEE_DESC'
  | 'STATUS_ASC'
  | 'STATUS_DESC'
  | 'STEPS_ASC'
  | 'STEPS_DESC';
type SortDirection = 'ASC' | 'DESC';
type SortableColumn = 'DATE' | 'FACILITY' | 'EMPLOYEE' | 'STATUS' | 'STEPS';

const getSortOption = (
  column: SortableColumn,
  direction: SortDirection,
): SortOption => {
  if (column === 'DATE') {
    return direction === 'ASC' ? 'DATE_ASC' : 'DATE_DESC';
  }
  if (column === 'FACILITY') {
    return direction === 'ASC' ? 'FACILITY_ASC' : 'FACILITY_DESC';
  }
  if (column === 'EMPLOYEE') {
    return direction === 'ASC' ? 'EMPLOYEE_ASC' : 'EMPLOYEE_DESC';
  }
  if (column === 'STATUS') {
    return direction === 'ASC' ? 'STATUS_ASC' : 'STATUS_DESC';
  }
  return direction === 'ASC' ? 'STEPS_ASC' : 'STEPS_DESC';
};

const getSortMeta = (
  option: SortOption,
): { column: SortableColumn; direction: SortDirection } => {
  switch (option) {
    case 'DATE_ASC':
      return { column: 'DATE', direction: 'ASC' };
    case 'DATE_DESC':
      return { column: 'DATE', direction: 'DESC' };
    case 'FACILITY_ASC':
      return { column: 'FACILITY', direction: 'ASC' };
    case 'FACILITY_DESC':
      return { column: 'FACILITY', direction: 'DESC' };
    case 'EMPLOYEE_ASC':
      return { column: 'EMPLOYEE', direction: 'ASC' };
    case 'EMPLOYEE_DESC':
      return { column: 'EMPLOYEE', direction: 'DESC' };
    case 'STATUS_ASC':
      return { column: 'STATUS', direction: 'ASC' };
    case 'STATUS_DESC':
      return { column: 'STATUS', direction: 'DESC' };
    case 'STEPS_ASC':
      return { column: 'STEPS', direction: 'ASC' };
    case 'STEPS_DESC':
      return { column: 'STEPS', direction: 'DESC' };
    default:
      return { column: 'DATE', direction: 'DESC' };
  }
};

const getLocalDateInputValue = () => {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

const createEmptyForm = () => ({
  title: '',
  facilityName: '',
  date: getLocalDateInputValue(),
  responsibleEmployee: '',
  checklistId: '',
});

export default function InspectionsList() {
  const location = useLocation();
  // Core page data and UI state.
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [createError, setCreateError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [saving, setSaving] = useState(false);

  const { column: activeSortColumn, direction: activeSortDirection } = useMemo(
    () => getSortMeta(sortBy),
    [sortBy],
  );

  // Initial load of inspections/checklists and optional modal auto-open via route state.
  useEffect(() => {
    let isMounted = true;
    // Auto-open the "New Inspection" modal when requested from the dashboard link state.
    if (location.state?.openNewModal) {
      setShowModal(true);
      // Clear route state so the modal does not re-open on refresh.
      window.history.replaceState({}, document.title);
    }

    setLoading(true);
    setLoadError('');

    Promise.allSettled([getInspections(), getChecklists()])
      .then(([inspectionsResult, checklistsResult]) => {
        if (!isMounted) {
          return;
        }

        const errors: string[] = [];

        if (inspectionsResult.status === 'fulfilled') {
          setInspections(inspectionsResult.value);
        } else {
          setInspections([]);
          errors.push('Failed to load inspections.');
        }

        if (checklistsResult.status === 'fulfilled') {
          setChecklists(checklistsResult.value);
        } else {
          setChecklists([]);
          errors.push('Checklist import is unavailable.');
        }

        setLoadError(errors.join(' '));
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location]);

  // Apply status filter, text search, and active table sort.
  const visibleInspections = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = inspections.filter((i) => {
      const displayStatus = getDisplayInspectionStatus(i);
      const matchesStatus = filter === 'ALL' || displayStatus === filter;
      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        i.facilityName.toLowerCase().includes(query) ||
        i.responsibleEmployee.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      let order = 0;

      switch (sortBy) {
        case 'DATE_ASC':
          order = a.date.localeCompare(b.date);
          break;
        case 'DATE_DESC':
          order = b.date.localeCompare(a.date);
          break;
        case 'FACILITY_ASC':
          order = a.facilityName.localeCompare(b.facilityName, undefined, {
            sensitivity: 'base',
          });
          break;
        case 'FACILITY_DESC':
          order = b.facilityName.localeCompare(a.facilityName, undefined, {
            sensitivity: 'base',
          });
          break;
        case 'EMPLOYEE_ASC':
          order = a.responsibleEmployee.localeCompare(
            b.responsibleEmployee,
            undefined,
            { sensitivity: 'base' },
          );
          break;
        case 'EMPLOYEE_DESC':
          order = b.responsibleEmployee.localeCompare(
            a.responsibleEmployee,
            undefined,
            { sensitivity: 'base' },
          );
          break;
        case 'STATUS_ASC':
          order =
            displayStatusSortOrder[getDisplayInspectionStatus(a)] -
            displayStatusSortOrder[getDisplayInspectionStatus(b)];
          break;
        case 'STATUS_DESC':
          order =
            displayStatusSortOrder[getDisplayInspectionStatus(b)] -
            displayStatusSortOrder[getDisplayInspectionStatus(a)];
          break;
        case 'STEPS_ASC':
          order = (a.steps?.length ?? 0) - (b.steps?.length ?? 0);
          break;
        case 'STEPS_DESC':
          order = (b.steps?.length ?? 0) - (a.steps?.length ?? 0);
          break;
        default:
          order = b.date.localeCompare(a.date);
          break;
      }

      if (order !== 0) {
        return order;
      }
      return b.date.localeCompare(a.date);
    });
  }, [inspections, filter, searchTerm, sortBy]);

  // Toggle sort direction when the same column is clicked.
  const sortByColumn = (column: SortableColumn) => {
    const nextDirection: SortDirection =
      activeSortColumn === column
        ? activeSortDirection === 'ASC'
          ? 'DESC'
          : 'ASC'
        : column === 'DATE'
          ? 'DESC'
          : 'ASC';

    setSortBy(getSortOption(column, nextDirection));
  };

  const getSortIndicator = (column: SortableColumn) => {
    if (activeSortColumn !== column) {
      return '↕';
    }
    return activeSortDirection === 'ASC' ? '↑' : '↓';
  };

  const closeModal = () => {
    setShowModal(false);
    setCreateError('');
  };

  const openModal = () => {
    setCreateError('');
    setShowModal(true);
  };

  // Create a new inspection and optionally clone checklist steps into it.
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setCreateError('');
    try {
      const normalizedTitle = form.title.trim();
      let steps: Inspection['steps'] = [];
      if (form.checklistId) {
        const cl = checklists.find((c) => String(c.id) === form.checklistId);
        if (cl) {
          steps = cl.steps.map((s) => ({
            title: s.title,
            description: s.description,
            result: 'PENDING' as const,
          }));
        }
      }
      const created = await createInspection({
        title: normalizedTitle || undefined,
        facilityName: form.facilityName,
        date: form.date,
        responsibleEmployee: form.responsibleEmployee,
        status: 'PLANNED',
        steps,
      });
      const resolvedTitle =
        created.title?.trim() || normalizedTitle || undefined;
      const nextInspection = { ...created, title: resolvedTitle };
      setInspections((prev) => [...prev, nextInspection]);
      setForm(createEmptyForm());
      closeModal();
    } catch {
      setCreateError('Failed to create inspection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header with list summary and create action */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inspections</h1>
          <p className="page-subtitle">
            {visibleInspections.length} of {inspections.length} inspections
          </p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + New Inspection
        </button>
      </div>

      {loadError && <div className="error-msg">{loadError}</div>}

      {/* Status filter buttons and text search */}
      <div className="filter-bar">
        {(
          [
            'ALL',
            'PLANNED',
            'IN_PROGRESS',
            'SUCCEEDED',
            'FAILED',
          ] as StatusFilter[]
        ).map((s) => (
          <button
            key={s}
            className={`filter-btn${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : displayStatusLabel[s]}
          </button>
        ))}
        <input
          className="form-control"
          type="search"
          placeholder="Search by facility or employee"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ minWidth: 220, maxWidth: 340 }}
        />
      </div>

      {/* Main table area with loading and empty states */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : visibleInspections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>
              {searchTerm
                ? 'No inspections match your search.'
                : 'No inspections found.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>
                    <button
                      type="button"
                      onClick={() => sortByColumn('FACILITY')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Facility{' '}
                      <span aria-hidden="true">
                        {getSortIndicator('FACILITY')}
                      </span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => sortByColumn('DATE')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Date{' '}
                      <span aria-hidden="true">{getSortIndicator('DATE')}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => sortByColumn('EMPLOYEE')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Employee{' '}
                      <span aria-hidden="true">
                        {getSortIndicator('EMPLOYEE')}
                      </span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => sortByColumn('STATUS')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Status{' '}
                      <span aria-hidden="true">
                        {getSortIndicator('STATUS')}
                      </span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      onClick={() => sortByColumn('STEPS')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        font: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Steps{' '}
                      <span aria-hidden="true">
                        {getSortIndicator('STEPS')}
                      </span>
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleInspections.map((insp) => {
                  const displayStatus = getDisplayInspectionStatus(insp);

                  return (
                    <tr key={insp.id}>
                      <td>
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
                          className={`badge ${displayStatusBadgeClass[displayStatus]}`}
                        >
                          {displayStatusLabel[displayStatus]}
                        </span>
                      </td>
                      <td>{insp.steps?.length ?? 0}</td>
                      <td>
                        <Link
                          to={`/inspections/${insp.id}`}
                          className={`btn btn-sm ${insp.status === 'PLANNED' ? 'btn-outline-planned' : insp.status === 'IN_PROGRESS' ? 'btn-outline-accent' : 'btn-outline-view'}`}
                        >
                          {insp.status === 'PLANNED'
                            ? 'Start'
                            : insp.status === 'IN_PROGRESS'
                              ? 'Continue'
                              : 'View'}
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

      {/* Modal for creating a new inspection */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Inspection</span>
              <button className="btn-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {createError && (
                  <div className="error-msg" style={{ marginBottom: '1rem' }}>
                    {createError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Title (optional)</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Annual Safety Check"
                    value={form.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((f) => ({ ...f, title: value }));
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Facility Name *</label>
                  <input
                    className="form-control"
                    required
                    value={form.facilityName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, facilityName: e.target.value }))
                    }
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Responsible Employee *</label>
                    <input
                      className="form-control"
                      required
                      value={form.responsibleEmployee}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          responsibleEmployee: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Import Steps from Checklist (optional)
                  </label>
                  <select
                    className="form-control"
                    value={form.checklistId}
                    disabled={checklists.length === 0}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, checklistId: e.target.value }))
                    }
                  >
                    <option value="">
                      {checklists.length === 0
                        ? 'No checklist available'
                        : '-- None --'}
                    </option>
                    {checklists.map((cl) => (
                      <option key={cl.id} value={String(cl.id)}>
                        {cl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
