import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
	return (
		/* Generic fallback page for unknown routes */
		<div className="not-found-container">
			<div className="not-found-content">
				<h1 className="not-found-title">404</h1>
				<p className="not-found-message">Page not found</p>
				<p className="not-found-description">
					The requested page does not exist or has been moved.
				</p>
				<Link to="/" className="not-found-link">
					Back to Dashboard
				</Link>
			</div>
		</div>
	);
}

export default NotFound;
