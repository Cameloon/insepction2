import React, { useEffect, useState, useCallback } from 'react';
import '../styles/InspectionDetail.css';
import { useParams, Link } from 'react-router-dom';
import {
	getInspections,
	updateInspection,
	addInspectionStep,
	updateInspectionStep,
	deleteInspectionStep,
	uploadPhoto,
	createChecklist,
} from '../api';
import { Inspection, InspectionStep } from '../types';
import {
	displayStatusBadgeClass,
	displayStatusLabel,
	getDisplayInspectionStatus,
	getInspectionEvaluation,
} from '../inspectionStatus';

type StepResult = 'FULFILLED' | 'NOT_FULFILLED' | 'NA' | 'PENDING';

export default function InspectionDetail() {
	// Route id and primary page state.
	const { id } = useParams<{ id: string }>();
	const [inspection, setInspection] = useState<Inspection | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// UI/process flags.
	const [savingStatus, setSavingStatus] = useState(false);
	const [showAddStep, setShowAddStep] = useState(false);
	const [newStep, setNewStep] = useState({ title: '', description: '' });

	// Debounce map for delayed per-step API updates.
	const [pendingUpdates, setPendingUpdates] = useState<
		Record<number, ReturnType<typeof setTimeout>>
	>({});

	// Save-as-checklist feedback state.
	const [savingChecklist, setSavingChecklist] = useState(false);
	const [info, setInfo] = useState('');

	// Fetch all inspections and select the current one by id.
	const load = useCallback(() => {
		getInspections()
			.then((data) => {
				const found = data.find((i) => String(i.id) === id);
				if (found) setInspection(found);
				else setError('Inspection not found.');
				setLoading(false);
			})
			.catch(() => {
				setError('Failed to load inspection.');
				setLoading(false);
			});
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	// Transition inspection workflow status with validation.
	const changeStatus = async (status: Inspection['status']) => {
		if (!inspection?.id) return;
		const hasSteps = (inspection.steps?.length ?? 0) > 0;
		const hasPendingSteps =
			inspection.steps?.some((step) => step.result === 'PENDING') ?? false;
		if (status === 'COMPLETED' && (!hasSteps || hasPendingSteps)) {
			setError(
				'You can only complete the inspection after all steps are set to Fulfilled, Not Fulfilled, or N/A.',
			);
			return;
		}
		setSavingStatus(true);
		try {
			const updated = await updateInspection(inspection.id, {
				...inspection,
				status,
			});
			setInspection(updated);
		} catch {
			setError('Failed to update status.');
		} finally {
			setSavingStatus(false);
		}
	};

	// Update a step result optimistically, then persist with debounce.
	const handleResultChange = (step: InspectionStep, result: StepResult) => {
		if (!inspection?.id || !step.id || inspection.status !== 'IN_PROGRESS')
			return;
		const updatedStep = { ...step, result };
		setInspection((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				steps: prev.steps.map((s) => (s.id === step.id ? updatedStep : s)),
			};
		});
		const key = step.id;
		if (pendingUpdates[key]) clearTimeout(pendingUpdates[key]);
		const t = setTimeout(() => {
			updateInspectionStep(inspection.id!, step.id!, updatedStep).catch(() =>
				setError('Failed to save step.'),
			);
		}, 500);
		setPendingUpdates((prev) => ({ ...prev, [key]: t }));
	};

	// Update free-text fields (comment/photoUrl) with optimistic UI and debounce.
	const handleFieldChange = (
		step: InspectionStep,
		field: 'comment' | 'photoUrl',
		value: string,
	) => {
		if (!inspection?.id || !step.id || inspection.status === 'COMPLETED')
			return;
		const updatedStep = { ...step, [field]: value };
		setInspection((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				steps: prev.steps.map((s) => (s.id === step.id ? updatedStep : s)),
			};
		});
		const key = step.id * 100 + (field === 'comment' ? 1 : 2);
		if (pendingUpdates[key]) clearTimeout(pendingUpdates[key]);
		const t = setTimeout(() => {
			updateInspectionStep(inspection.id!, step.id!, updatedStep).catch(() =>
				setError('Failed to save step.'),
			);
		}, 800);
		setPendingUpdates((prev) => ({ ...prev, [key]: t }));
	};

	// Remove one step from the inspection.
	const handleDeleteStep = async (step: InspectionStep) => {
		if (!inspection?.id || !step.id || inspection.status === 'COMPLETED')
			return;
		if (!window.confirm('Delete this step?')) return;
		try {
			await deleteInspectionStep(inspection.id, step.id);
			setInspection((prev) =>
				prev
					? { ...prev, steps: prev.steps.filter((s) => s.id !== step.id) }
					: prev,
			);
		} catch {
			setError('Failed to delete step.');
		}
	};

	// Add a new step to the current inspection.
	const handleAddStep = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inspection?.id || inspection.status === 'COMPLETED') return;
		try {
			const updated = await addInspectionStep(inspection.id, {
				title: newStep.title,
				description: newStep.description,
				result: 'PENDING',
			});
			setInspection(updated);
			setNewStep({ title: '', description: '' });
			setShowAddStep(false);
		} catch {
			setError('Failed to add step.');
		}
	};

	// Convert current inspection steps into a reusable checklist.
	const handleSaveAsChecklist = async () => {
		if (!inspection) return;
		if (!inspection.steps || inspection.steps.length === 0) {
			setError('Cannot create a checklist from an inspection without steps.');
			return;
		}

		const defaultName = inspection.title
			? `${inspection.title} (${inspection.date})`
			: `${inspection.facilityName} (${inspection.date})`;
		const name = window.prompt('Checklist name:', defaultName)?.trim();
		if (!name) {
			return;
		}

		setSavingChecklist(true);
		setError('');
		setInfo('');

		try {
			const checklist = await createChecklist({
				name,
				description: `Created from inspection #${inspection.id} (${inspection.facilityName})`,
				steps: inspection.steps.map((step, index) => ({
					title: step.title,
					description: step.description,
					orderIndex: index,
				})),
			});
			setInfo(`Checklist "${checklist.name}" was created successfully.`);
		} catch {
			setError('Failed to create checklist from inspection steps.');
		} finally {
			setSavingChecklist(false);
		}
	};

	// Row style helper based on result state.
	const stepRowClass = (result: StepResult) => {
		if (result === 'FULFILLED') return 'step-row fulfilled';
		if (result === 'NOT_FULFILLED') return 'step-row not-fulfilled';
		if (result === 'NA') return 'step-row na';
		return 'step-row';
	};

	const resultBadgeClass: Record<StepResult, string> = {
		FULFILLED: 'badge-fulfilled',
		NOT_FULFILLED: 'badge-not-fulfilled',
		NA: 'badge-na',
		PENDING: 'badge-pending',
	};
	const resultLabel: Record<StepResult, string> = {
		FULFILLED: 'Fulfilled',
		NOT_FULFILLED: 'Not Fulfilled',
		NA: 'N/A',
		PENDING: 'Pending',
	};

	if (loading) return <div className="loading">Loading...</div>;
	if (!inspection)
		return <div className="error-msg">{error || 'Not found'}</div>;

	// Capability flags derived from inspection state.
	const canStart = inspection.status === 'PLANNED';
	const hasSteps = (inspection.steps?.length ?? 0) > 0;
	const hasPendingSteps =
		inspection.steps?.some((step) => step.result === 'PENDING') ?? false;
	const canComplete =
		inspection.status === 'IN_PROGRESS' && hasSteps && !hasPendingSteps;
	const isCompleted = inspection.status === 'COMPLETED';
	const canManageSteps = !isCompleted;
	const canSetStepResult = inspection.status === 'IN_PROGRESS';
	const displayStatus = getDisplayInspectionStatus(inspection);
	const evaluation = getInspectionEvaluation(inspection);

	return (
		<div>
			{/* Header with status actions and navigation buttons */}
			<div className="page-header">
				<div>
					<div
						style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
					>
						<h1 className="page-title">
							{inspection.title || inspection.facilityName}
						</h1>
						<span className={`badge ${displayStatusBadgeClass[displayStatus]}`}>
							{displayStatusLabel[displayStatus]}
						</span>
					</div>
					<p className="page-subtitle">
						{inspection.title ? `${inspection.facilityName} · ` : ''}Inspection
						#{inspection.id}
					</p>
				</div>
				<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
					{canStart && (
						<button
							className="btn btn-primary"
							onClick={() => changeStatus('IN_PROGRESS')}
							disabled={savingStatus}
						>
							▶ Start Inspection
						</button>
					)}
					{canComplete && (
						<button
							className="btn btn-success"
							onClick={() => changeStatus('COMPLETED')}
							disabled={savingStatus}
						>
							✓ Complete & Evaluate
						</button>
					)}
					{inspection.status === 'IN_PROGRESS' && !canComplete && (
						<button
							className="btn btn-success"
							disabled
							title="Set all step results first"
						>
							✓ Complete & Evaluate
						</button>
					)}
					<button
						className="btn btn-outline"
						onClick={handleSaveAsChecklist}
						disabled={savingChecklist || (inspection.steps?.length ?? 0) === 0}
						title={
							(inspection.steps?.length ?? 0) === 0
								? 'Add steps first'
								: 'Create checklist from current steps'
						}
					>
						{savingChecklist ? 'Saving...' : 'Save As Checklist'}
					</button>
					<Link
						to={`/inspections/${inspection.id}/print`}
						target="_blank"
						className="btn btn-secondary"
					>
						🖨 Print / PDF
					</Link>
					<Link to="/inspections" className="btn btn-secondary">
						← Back
					</Link>
				</div>
			</div>

			{error && <div className="error-msg">{error}</div>}
			{/* Informational success message for checklist export */}
			{info && (
				<div
					className="card"
					style={{
						marginBottom: '1rem',
						padding: '0.9rem 1rem',
						color: '#065f46',
						background: '#ecfdf3',
					}}
				>
					{info}
				</div>
			)}

			{/* Inspection metadata and evaluation summary */}
			<div className="card">
				<div className="inspection-info-grid">
					{inspection.title && (
						<div className="info-item">
							<label>Title</label>
							<span>{inspection.title}</span>
						</div>
					)}
					<div className="info-item">
						<label>Facility</label>
						<span>{inspection.facilityName}</span>
					</div>
					<div className="info-item">
						<label>Date</label>
						<span>{inspection.date}</span>
					</div>
					<div className="info-item">
						<label>Employee</label>
						<span>{inspection.responsibleEmployee}</span>
					</div>
					<div className="info-item">
						<label>Steps</label>
						<span>{inspection.steps?.length ?? 0} total</span>
					</div>
					<div className="info-item">
						<label>Pass Rate</label>
						<span>{`${evaluation.passed}/${evaluation.total} (${Math.round(evaluation.passRate * 100)}%)`}</span>
					</div>
				</div>
			</div>

			{/* Steps section header with add-step action */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '1rem',
				}}
			>
				<h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Checklist Steps</h2>
				{canManageSteps && (
					<button
						className="btn btn-outline btn-sm"
						onClick={() => setShowAddStep((v) => !v)}
					>
						+ Add Step
					</button>
				)}
			</div>

			{/* Workflow guidance banners depending on current status */}
			{inspection.status === 'PLANNED' && (
				<div
					className="card"
					style={{
						marginBottom: '1rem',
						padding: '0.9rem 1rem',
						color: '#4a5568',
					}}
				>
					You can edit steps now, but step results can only be set after
					starting the inspection.
				</div>
			)}

			{inspection.status === 'IN_PROGRESS' && !canComplete && (
				<div
					className="card"
					style={{
						marginBottom: '1rem',
						padding: '0.9rem 1rem',
						color: '#4a5568',
					}}
				>
					Set every step result to Fulfilled, Not Fulfilled, or N/A before
					completing the inspection.
				</div>
			)}

			{isCompleted && (
				<div
					className="card"
					style={{
						marginBottom: '1rem',
						padding: '0.9rem 1rem',
						color: '#4a5568',
					}}
				>
					Inspection is completed. Steps are read-only.
				</div>
			)}

			{/* Inline add-step form */}
			{showAddStep && (
				<div className="card" style={{ marginBottom: '1rem' }}>
					<form onSubmit={handleAddStep}>
						<div className="form-row">
							<div className="form-group">
								<label className="form-label">Step Title *</label>
								<input
									className="form-control"
									required
									value={newStep.title}
									onChange={(e) =>
										setNewStep((s) => ({ ...s, title: e.target.value }))
									}
								/>
							</div>
							<div className="form-group">
								<label className="form-label">Description</label>
								<input
									className="form-control"
									value={newStep.description}
									onChange={(e) =>
										setNewStep((s) => ({ ...s, description: e.target.value }))
									}
								/>
							</div>
						</div>
						<div style={{ display: 'flex', gap: '0.5rem' }}>
							<button type="submit" className="btn btn-primary btn-sm">
								Add Step
							</button>
							<button
								type="button"
								className="btn btn-secondary btn-sm"
								onClick={() => setShowAddStep(false)}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{inspection.steps?.length === 0 ? (
				/* Empty state when no steps exist */
				<div className="empty-state">
					<div className="empty-state-icon">📝</div>
					<p>No steps yet. Add steps to start the inspection.</p>
				</div>
			) : (
				/* Step rows with editable or read-only detail blocks */
				inspection.steps.map((step, idx) => (
					<div key={step.id ?? idx} className={stepRowClass(step.result)}>
						<div className="step-header">
							<div>
								<div className="step-title">
									{idx + 1}. {step.title}
								</div>
								{step.description && (
									<div className="step-description">{step.description}</div>
								)}
							</div>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '0.5rem',
									flexShrink: 0,
								}}
							>
								<span className={`badge ${resultBadgeClass[step.result]}`}>
									{resultLabel[step.result]}
								</span>
								{!isCompleted && (
									<button
										className="btn btn-sm btn-danger"
										onClick={() => handleDeleteStep(step)}
										title="Delete step"
									>
										✕
									</button>
								)}
							</div>
						</div>

						{canManageSteps && (
							/* Editable controls while inspection is not completed */
							<div className="step-extra">
								<div className="step-actions">
									<button
										className={`result-btn result-btn-fulfilled${step.result === 'FULFILLED' ? ' active' : ''}`}
										disabled={!canSetStepResult}
										onClick={() => handleResultChange(step, 'FULFILLED')}
									>
										✓ Fulfilled
									</button>
									<button
										className={`result-btn result-btn-not-fulfilled${step.result === 'NOT_FULFILLED' ? ' active' : ''}`}
										disabled={!canSetStepResult}
										onClick={() => handleResultChange(step, 'NOT_FULFILLED')}
									>
										✗ Not Fulfilled
									</button>
									<button
										className={`result-btn result-btn-na${step.result === 'NA' ? ' active' : ''}`}
										disabled={!canSetStepResult}
										onClick={() => handleResultChange(step, 'NA')}
									>
										N/A
									</button>
								</div>
								{!canSetStepResult && (
									<div style={{ fontSize: '0.82rem', color: '#718096' }}>
										Start the inspection to set step results.
									</div>
								)}
								<textarea
									className="form-control"
									placeholder="Comment (optional)..."
									value={step.comment ?? ''}
									rows={2}
									onChange={(e) =>
										handleFieldChange(step, 'comment', e.target.value)
									}
								/>
								<input
									className="form-control"
									placeholder="Photo URL (optional)..."
									value={step.photoUrl ?? ''}
									onChange={(e) =>
										handleFieldChange(step, 'photoUrl', e.target.value)
									}
								/>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '0.5rem',
									}}
								>
									<label
										className="btn btn-outline btn-sm btn-upload-photo"
										style={{ cursor: 'pointer', marginBottom: 0 }}
									>
										📷 Upload Photo
										<input
											type="file"
											accept="image/*"
											style={{ display: 'none' }}
											onChange={(e) => {
												// Upload image first, then persist returned URL on step.
												const file = e.target.files?.[0];
												if (file && inspection?.id && step.id) {
													uploadPhoto(file)
														.then((url) =>
															handleFieldChange(step, 'photoUrl', url),
														)
														.catch(() => setError('Failed to upload photo.'));
												}
											}}
										/>
									</label>
									{step.photoUrl && (
										<a
											href={step.photoUrl}
											target="_blank"
											rel="noopener noreferrer"
											style={{ fontSize: '0.82rem' }}
										>
											View photo
										</a>
									)}
								</div>
							</div>
						)}

						{isCompleted && (step.comment || step.photoUrl) && (
							/* Read-only extras after completion */
							<div className="step-extra">
								{step.comment && (
									<p style={{ fontSize: '0.88rem', color: '#4a5568' }}>
										💬 {step.comment}
									</p>
								)}
								{step.photoUrl && (
									<div style={{ fontSize: '0.88rem' }}>
										📷{' '}
										<a
											href={step.photoUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											{step.photoUrl}
										</a>
										<img
											src={step.photoUrl}
											alt="step"
											style={{
												display: 'block',
												maxWidth: '180px',
												maxHeight: '140px',
												marginTop: '0.3rem',
												borderRadius: '4px',
												border: '1px solid #e2e8f0',
											}}
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = 'none';
											}}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				))
			)}
		</div>
	);
}
