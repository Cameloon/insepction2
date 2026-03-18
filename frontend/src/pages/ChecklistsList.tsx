import React, { useEffect, useState } from 'react';
import '../styles/ChecklistsList.css';
import {
	getChecklists,
	createChecklist,
	addChecklistStep,
	deleteChecklistStep,
} from '../api';
import { Checklist, ChecklistStep } from '../types';

export default function ChecklistsList() {
	// Page data + loading/error state.
	const [checklists, setChecklists] = useState<Checklist[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// UI state for expanded cards and modal visibility.
	const [expanded, setExpanded] = useState<Set<number>>(new Set());
	const [showModal, setShowModal] = useState(false);

	// Form state for creating a checklist.
	const [newCl, setNewCl] = useState({ name: '', description: '' });
	const [saving, setSaving] = useState(false);

	// Per-checklist temporary state for adding a new step inline.
	const [addingStep, setAddingStep] = useState<
		Record<number, { title: string; description: string }>
	>({});
	const [showAddStep, setShowAddStep] = useState<Set<number>>(new Set());

	useEffect(() => {
		// Initial load of all checklists.
		getChecklists()
			.then((data) => {
				setChecklists(data);
				setLoading(false);
			})
			.catch(() => {
				setError('Failed to load checklists.');
				setLoading(false);
			});
	}, []);

	// Expand/collapse one checklist card.
	const toggleExpand = (id: number) => {
		setExpanded((prev) => {
			const s = new Set(prev);
			s.has(id) ? s.delete(id) : s.add(id);
			return s;
		});
	};

	// Create a new checklist from modal form values.
	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const created = await createChecklist({
				name: newCl.name,
				recommendations: newCl.description,
				description: newCl.description,
				steps: [],
			});
			setChecklists((prev) => [...prev, created]);
			setShowModal(false);
			setNewCl({ name: '', description: '' });
		} catch {
			setError('Failed to create checklist.');
		} finally {
			setSaving(false);
		}
	};

	// Open/close the inline "add step" form for a specific checklist.
	const toggleAddStep = (id: number) => {
		setShowAddStep((prev) => {
			const s = new Set(prev);
			s.has(id) ? s.delete(id) : s.add(id);
			return s;
		});
		if (!addingStep[id]) {
			setAddingStep((prev) => ({
				...prev,
				[id]: { title: '', description: '' },
			}));
		}
	};

	// Add one step to a checklist and refresh only that checklist in local state.
	const handleAddStep = async (cl: Checklist, e: React.FormEvent) => {
		e.preventDefault();
		if (!cl.id) return;
		const stepData = addingStep[cl.id];
		if (!stepData?.title) return;
		try {
			const updated = await addChecklistStep(cl.id, {
				title: stepData.title,
				requirement: stepData.description,
				description: stepData.description,
			});
			setChecklists((prev) => prev.map((c) => (c.id === cl.id ? updated : c)));
			setAddingStep((prev) => ({
				...prev,
				[cl.id!]: { title: '', description: '' },
			}));
			setShowAddStep((prev) => {
				const s = new Set(prev);
				s.delete(cl.id!);
				return s;
			});
		} catch {
			setError('Failed to add step.');
		}
	};

	// Delete one step from a checklist after user confirmation.
	const handleDeleteStep = async (cl: Checklist, step: ChecklistStep) => {
		if (!cl.id || !step.id) return;
		if (!window.confirm('Delete this step?')) return;
		try {
			await deleteChecklistStep(cl.id, step.id);
			setChecklists((prev) =>
				prev.map((c) =>
					c.id === cl.id
						? { ...c, steps: c.steps.filter((s) => s.id !== step.id) }
						: c,
				),
			);
		} catch {
			setError('Failed to delete step.');
		}
	};

	return (
		<div>
			{/* Header with page title and create action */}
			<div className="page-header">
				<div>
					<h1 className="page-title">Checklists</h1>
					<p className="page-subtitle">Reusable inspection checklists</p>
				</div>
				<button className="btn btn-primary" onClick={() => setShowModal(true)}>
					+ New Checklist
				</button>
			</div>

			{/* Global error message for list and mutation actions */}
			{error && <div className="error-msg">{error}</div>}

			{loading ? (
				/* Initial loading state */
				<div className="loading">Loading...</div>
			) : checklists.length === 0 ? (
				/* Empty state when no checklist exists yet */
				<div className="empty-state">
					<div className="empty-state-icon">📂</div>
					<p>No checklists yet. Create one to get started.</p>
				</div>
			) : (
				/* Checklist cards */
				checklists.map((cl) => (
					<div key={cl.id} className="card">
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
							}}
						>
							<div>
								<h3
									style={{
										fontSize: '1.05rem',
										fontWeight: 700,
										marginBottom: '0.2rem',
									}}
								>
									{cl.name}
								</h3>
								{cl.description && (
									<p style={{ fontSize: '0.88rem', color: '#718096' }}>
										{cl.description}
									</p>
								)}
								<p
									style={{
										fontSize: '0.82rem',
										color: '#718096',
										marginTop: '0.2rem',
									}}
								>
									{cl.steps.length} step{cl.steps.length !== 1 ? 's' : ''}
								</p>
							</div>
							<div style={{ display: 'flex', gap: '0.4rem' }}>
								<button
									className="btn btn-sm btn-secondary"
									onClick={() => cl.id && toggleExpand(cl.id)}
								>
									{cl.id && expanded.has(cl.id) ? '▲ Collapse' : '▼ Expand'}
								</button>
							</div>
						</div>

						{cl.id && expanded.has(cl.id) && (
								/* Expanded details: steps list + add-step inline form */
							<div className="checklist-steps">
								{cl.steps.length === 0 ? (
									<p
										style={{
											fontSize: '0.88rem',
											color: '#718096',
											marginBottom: '0.75rem',
										}}
									>
										No steps yet.
									</p>
								) : (
										/* Render all checklist steps with delete action */
									cl.steps.map((step, idx) => (
										<div key={step.id ?? idx} className="checklist-step-item">
											<div>
												<span style={{ fontWeight: 600 }}>
													{idx + 1}. {step.title}
												</span>
												{step.description && (
													<span
														style={{
															color: '#718096',
															marginLeft: '0.5rem',
															fontSize: '0.85rem',
														}}
													>
														— {step.description}
													</span>
												)}
											</div>
											<button
												className="btn btn-sm btn-danger"
												onClick={() => handleDeleteStep(cl, step)}
											>
												✕
											</button>
										</div>
									))
								)}

								{cl.id && showAddStep.has(cl.id) ? (
										/* Inline add-step form */
									<form
										onSubmit={(e) => handleAddStep(cl, e)}
										style={{
											display: 'flex',
											gap: '0.5rem',
											alignItems: 'flex-end',
											marginTop: '0.5rem',
										}}
									>
										<div
											className="form-group"
											style={{ flex: 2, marginBottom: 0 }}
										>
											<label className="form-label">Step Title *</label>
											<input
												className="form-control"
												required
												value={addingStep[cl.id!]?.title ?? ''}
												onChange={(e) =>
													setAddingStep((prev) => ({
														...prev,
														[cl.id!]: {
															...prev[cl.id!],
															title: e.target.value,
														},
													}))
												}
											/>
										</div>
										<div
											className="form-group"
											style={{ flex: 2, marginBottom: 0 }}
										>
											<label className="form-label">Description</label>
											<input
												className="form-control"
												value={addingStep[cl.id!]?.description ?? ''}
												onChange={(e) =>
													setAddingStep((prev) => ({
														...prev,
														[cl.id!]: {
															...prev[cl.id!],
															description: e.target.value,
														},
													}))
												}
											/>
										</div>
										<div
											style={{
												display: 'flex',
												gap: '0.4rem',
												paddingBottom: '1rem',
											}}
										>
											<button type="submit" className="btn btn-primary btn-sm">
												Add
											</button>
											<button
												type="button"
												className="btn btn-secondary btn-sm"
												onClick={() => toggleAddStep(cl.id!)}
											>
												Cancel
											</button>
										</div>
									</form>
								) : (
										/* Button to reveal add-step form */
									<button
										className="btn btn-outline btn-sm"
										style={{ marginTop: '0.5rem' }}
										onClick={() => cl.id && toggleAddStep(cl.id)}
									>
										+ Add Step
									</button>
								)}
							</div>
						)}
					</div>
				))
			)}

			{/* Modal for creating a new checklist */}
			{showModal && (
				<div className="modal-overlay" onClick={() => setShowModal(false)}>
					{/* Prevent overlay close when clicking inside modal */}
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<span className="modal-title">New Checklist</span>
							<button className="btn-close" onClick={() => setShowModal(false)}>
								✕
							</button>
						</div>
						<form onSubmit={handleCreate}>
							<div className="modal-body">
								<div className="form-group">
									<label className="form-label">Checklist Name *</label>
									<input
										className="form-control"
										required
										value={newCl.name}
										onChange={(e) =>
											setNewCl((c) => ({ ...c, name: e.target.value }))
										}
									/>
								</div>
								<div className="form-group">
									<label className="form-label">Description</label>
									<textarea
										className="form-control"
										value={newCl.description}
										onChange={(e) =>
											setNewCl((c) => ({ ...c, description: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="modal-footer">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => setShowModal(false)}
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
