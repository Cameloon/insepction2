import React, { useState } from 'react';

export default function Contact() {
	// Controlled form state for all input fields.
	const [form, setForm] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});

	// UI flag shown after successful submit.
	const [submitted, setSubmitted] = useState(false);

	// Generic change handler for both input and textarea fields.
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setForm((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	// Submit handler (currently local-only demo behavior).
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Can later be connected to a backend endpoint or email service.
		console.log('Contact form submitted:', form);

		setSubmitted(true);
		setForm({
			name: '',
			email: '',
			subject: '',
			message: '',
		});
	};

	return (
		<div className="card contact-page">
			{/* Intro and direct contact details */}
			<h1 className="page-title">Contact</h1>
			<p className="page-subtitle" style={{ marginTop: '0.5rem' }}>
				Don't hesitate to send us a message regarding the Inspection App
				project.
			</p>

			<div
				style={{
					marginTop: '2rem',
					marginBottom: '2rem',
					padding: '1.5rem',
					backgroundColor: '#f2eefb',
					borderRadius: '0.5rem',
				}}
			>
				<p style={{ marginBottom: '1rem', fontSize: '1rem' }}>
					You can reach us in the following ways:
				</p>
				<ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
					<li style={{ marginBottom: '0.5rem' }}>
						<strong>Phone:</strong> +49 (0) 123 456789
					</li>
					<li>
						<strong>Email:</strong>{' '}
						<a href="mailto:contact@inspectionapp.de">
							contact@inspectionapp.de
						</a>
					</li>
				</ul>
				<p style={{ marginTop: '1rem', marginBottom: '0' }}>
					Or simply fill out the contact form below and we'll get back to you as
					soon as possible.
				</p>
			</div>

			{/* Success feedback after form submission */}
			{submitted && (
				<div className="success-msg" style={{ marginTop: '1rem' }}>
					Your message has been submitted successfully.
				</div>
			)}

			{/* Contact form */}
			<form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
				<div className="form-row">
					<div className="form-group">
						<label className="form-label">Name</label>
						<input
							className="form-control"
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label className="form-label">Email</label>
						<input
							className="form-control"
							type="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							required
						/>
					</div>
				</div>

				<div className="form-group">
					<label className="form-label">Subject</label>
					<input
						className="form-control"
						type="text"
						name="subject"
						value={form.subject}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="form-group">
					<label className="form-label">Message</label>
					<textarea
						className="form-control"
						name="message"
						rows={6}
						value={form.message}
						onChange={handleChange}
						required
					/>
				</div>

				<button type="submit" className="btn btn-primary">
					Send Message
				</button>
			</form>
		</div>
	);
}
