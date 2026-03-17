import React from 'react';

export default function Privacy() {
	return (
		<div className="card">
			{/* Privacy policy summary for this student project */}
			<h1 className="page-title">Privacy Policy</h1>

			<p style={{ marginTop: '1rem' }}>
				This application is a student project developed as part of the Web
				Engineering course at the Baden-Wuerttemberg Cooperative State
				University (DHBW).
			</p>

			<p style={{ marginTop: '1rem' }}>
				No personal data is permanently stored. All data displayed in the
				application is used only for demonstration purposes within the project
				environment.
			</p>

			<p style={{ marginTop: '1rem' }}>
				Uploaded files and inspection data are stored temporarily for
				demonstration and testing.
			</p>

			<p style={{ marginTop: '1rem' }}>
				If you have questions regarding privacy, please contact:
				app.email@dhbw.de
			</p>
		</div>
	);
}
