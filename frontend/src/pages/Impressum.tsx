import React from 'react';

export default function Impressum() {
	return (
		<div className="card">
			{/* Legal notice page content */}
			<h1 className="page-title">Impressum</h1>

			<p style={{ marginTop: '1rem' }}>Information according to § 5 TMG</p>

			<p style={{ marginTop: '1rem' }}>
				Inspection App <br />
				Student Project DHBW Web Engineering Course <br />
				Name <br />
				Baden-Wuerttemberg Cooperative State University (DHBW)
			</p>

			<p style={{ marginTop: '1rem' }}>
				Contact: <br />
				Email: your.email@dhbw.de
			</p>

			<p style={{ marginTop: '1rem' }}>
				Responsible for content according to § 55 Abs. 2 RStV: <br />
				Name
			</p>
		</div>
	);
}
