import React, { useEffect, useState } from 'react';
import '../styles/PrintView.css';
import { useParams } from 'react-router-dom';
import { getInspections } from '../api';
import { Inspection } from '../types';
import {
	displayStatusLabel,
	getDisplayInspectionStatus,
	getInspectionEvaluation,
} from '../inspectionStatus';

const resultLabel: Record<string, string> = {
	FULFILLED: '✓ Fulfilled',
	NOT_FULFILLED: '✗ Not Fulfilled',
	NA: 'N/A',
	PENDING: 'Pending',
};
const resultColor: Record<string, string> = {
	FULFILLED: '#065f46',
	NOT_FULFILLED: '#991b1b',
	NA: '#4b5563',
	PENDING: '#5b21b6',
};

export default function PrintView() {
	// Read inspection id from route and load matching data for print mode.
	const { id } = useParams<{ id: string }>();
	const [inspection, setInspection] = useState<Inspection | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!id) return;

		// Guard so auto-print runs once per inspection id in this browser session.
		const storageKey = `print-run-${id}`;

		if (sessionStorage.getItem(storageKey)) return;
		sessionStorage.setItem(storageKey, '1');

		// Load the selected inspection and trigger native print dialog.
		getInspections()
			.then((data) => {
				const found = data.find((i) => String(i.id) === id);
				if (found) {
					setInspection(found);
					setTimeout(() => window.print(), 500);
				} else {
					setError('Inspection not found.');
				}
			})
			.catch(() => setError('Failed to load inspection.'));
	}, [id]);

	if (error)
		return <div style={{ padding: '2rem', color: '#991b1b' }}>{error}</div>;
	if (!inspection)
		return <div style={{ padding: '2rem', color: '#718096' }}>Loading...</div>;

	const displayStatus = getDisplayInspectionStatus(inspection);
	const evaluation = getInspectionEvaluation(inspection);

	// Summary counters for step result categories.
	const fulfilled = inspection.steps.filter(
		(s) => s.result === 'FULFILLED',
	).length;
	const notFulfilled = inspection.steps.filter(
		(s) => s.result === 'NOT_FULFILLED',
	).length;
	const na = inspection.steps.filter((s) => s.result === 'NA').length;
	const pending = inspection.steps.filter((s) => s.result === 'PENDING').length;

	return (
		<div className="print-container">
			{/* Printable report header */}
			<div className="print-header">
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
					}}
				>
					<div>
						<div className="print-title">
							{inspection.title || 'Inspection Report'}
						</div>
						<div
							style={{
								fontSize: '1.1rem',
								color: '#4a5568',
								marginTop: '0.25rem',
							}}
						>
							{inspection.facilityName}
						</div>
					</div>
					<div style={{ textAlign: 'right' }}>
						<div style={{ fontSize: '0.9rem', color: '#718096' }}>Status</div>
						<div style={{ fontWeight: 700, fontSize: '1rem' }}>
							{displayStatusLabel[displayStatus]}
						</div>
						{inspection.status === 'COMPLETED' && (
							<div
								style={{
									fontSize: '0.8rem',
									color: '#718096',
									marginTop: '0.2rem',
								}}
							>
								Pass rate: {Math.round(evaluation.passRate * 100)}% (
								{evaluation.passed}/{evaluation.total})
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Core inspection metadata */}
			<div className="print-meta">
				<div className="print-meta-item">
					<label>Facility</label>
					<span>{inspection.facilityName}</span>
				</div>
				<div className="print-meta-item">
					<label>Date</label>
					<span>{inspection.date}</span>
				</div>
				<div className="print-meta-item">
					<label>Responsible Employee</label>
					<span>{inspection.responsibleEmployee}</span>
				</div>
				<div className="print-meta-item">
					<label>Inspection ID</label>
					<span>#{inspection.id}</span>
				</div>
			</div>

			{/* Quick result summary row */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 1fr)',
					gap: '0.75rem',
					marginBottom: '1.5rem',
					background: '#f7fafc',
					padding: '1rem',
					borderRadius: '8px',
				}}
			>
				<div style={{ textAlign: 'center' }}>
					<div
						style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46' }}
					>
						{fulfilled}
					</div>
					<div style={{ fontSize: '0.78rem', color: '#718096' }}>Fulfilled</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<div
						style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}
					>
						{notFulfilled}
					</div>
					<div style={{ fontSize: '0.78rem', color: '#718096' }}>
						Not Fulfilled
					</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<div
						style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4b5563' }}
					>
						{na}
					</div>
					<div style={{ fontSize: '0.78rem', color: '#718096' }}>N/A</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<div
						style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5b21b6' }}
					>
						{pending}
					</div>
					<div style={{ fontSize: '0.78rem', color: '#718096' }}>Pending</div>
				</div>
			</div>

			{/* Detailed step-by-step result list */}
			<h2
				style={{
					fontSize: '1.05rem',
					fontWeight: 700,
					marginBottom: '0.75rem',
					color: '#1a202c',
				}}
			>
				Steps ({inspection.steps.length})
			</h2>

			{inspection.steps.map((step, idx) => (
				<div key={step.id ?? idx} className="print-step">
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'flex-start',
						}}
					>
						<div>
							<div className="print-step-title">
								{idx + 1}. {step.title}
							</div>
							{step.description && (
								<div
									style={{
										fontSize: '0.85rem',
										color: '#718096',
										marginTop: '0.15rem',
									}}
								>
									{step.description}
								</div>
							)}
						</div>
						<div
							className="print-step-result"
							style={{
								color: resultColor[step.result],
								fontWeight: 700,
								fontSize: '0.88rem',
								whiteSpace: 'nowrap',
								marginLeft: '1rem',
							}}
						>
							{resultLabel[step.result]}
						</div>
					</div>
					{step.comment && (
						<div
							style={{
								marginTop: '0.5rem',
								fontSize: '0.85rem',
								color: '#4a5568',
								borderTop: '1px solid #f0f4f8',
								paddingTop: '0.4rem',
							}}
						>
							💬 {step.comment}
						</div>
					)}
					{step.photoUrl && (
						<div
							style={{
								marginTop: '0.3rem',
								fontSize: '0.82rem',
								color: '#1a56db',
							}}
						>
							📷{' '}
							<a href={step.photoUrl} target="_blank" rel="noopener noreferrer">
								{step.photoUrl}
							</a>
							<img
								src={step.photoUrl}
								alt="step"
								style={{
									display: 'block',
									maxWidth: '200px',
									maxHeight: '160px',
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
			))}

			{/* Controls hidden in print output via CSS class */}
			<div
				className="no-print"
				style={{ marginTop: '2rem', textAlign: 'center' }}
			>
				<button
					onClick={() => window.print()}
					className="btn btn-warning"
					style={{ marginRight: '0.75rem' }}
				>
					🖨 Print
				</button>
				<button onClick={() => window.close()} className="btn btn-secondary">
					Close
				</button>
			</div>

			{/* Footer timestamp for generated report */}
			<div
				style={{
					marginTop: '2rem',
					borderTop: '1px solid #e2e8f0',
					paddingTop: '1rem',
					fontSize: '0.78rem',
					color: '#9ca3af',
					textAlign: 'center',
				}}
			>
				Generated on {new Date().toLocaleString()}
			</div>
		</div>
	);
}
