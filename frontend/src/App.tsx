import React from 'react';
import {
	BrowserRouter,
	Routes,
	Route,
	Link,
	useLocation,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InspectionsList from './pages/InspectionsList';
import InspectionDetail from './pages/InspectionDetail';
import ChecklistsList from './pages/ChecklistsList';
import PrintView from './pages/PrintView';
import NotFound from './pages/NotFound';
import Impressum from './pages/Impressum';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import LandingPage from './pages/LandingPage';

function NavBar() {
	const location = useLocation();
	const isActive = (path: string) =>
		location.pathname === path || location.pathname.startsWith(path + '/');
	return (
		<nav className="navbar">
			<div className="navbar-brand">
				<span className="navbar-title">Inspections</span>
			</div>
			<div className="navbar-links">
				<Link
					to="/"
					className={`nav-link${location.pathname === '/' ? ' active' : ''}`}
				>
					Home
				</Link>

				<Link
					to="/dashboard"
					className={`nav-link${location.pathname === '/dashboard' ? ' active' : ''}`}
				>
					Dashboard
				</Link>

				<Link
					to="/inspections"
					className={`nav-link${isActive('/inspections') ? ' active' : ''}`}
				>
					Inspections
				</Link>

				<Link
					to="/checklists"
					className={`nav-link${isActive('/checklists') ? ' active' : ''}`}
				>
					Checklists
				</Link>
			</div>
		</nav>
	);
}

function App() {
	return (
		<BrowserRouter>
			<div className="app-container">
				<Routes>
					<Route path="/inspections/:id/print" element={<PrintView />} />
					<Route
						path="*"
						element={
							<>
								<NavBar />
								<main className="main-content">
									<Routes>
										<Route path="/" element={<LandingPage />} />
										<Route path="/dashboard" element={<Dashboard />} />
										<Route path="/inspections" element={<InspectionsList />} />
										<Route
											path="/inspections/:id"
											element={<InspectionDetail />}
										/>
										<Route path="/checklists" element={<ChecklistsList />} />
										<Route path="/impressum" element={<Impressum />} />
										<Route path="/privacy" element={<Privacy />} />
										<Route path="/contact" element={<Contact />} />
										<Route path="*" element={<NotFound />} />
									</Routes>
								</main>

								<footer className="footer">
									<div className="footer-inner">
										<span>
											&copy; Made with &#9749; and curiosity. 2026 Inspections
											App | DHBW Project
										</span>

										<div className="footer-links">
											<Link to="/impressum">Impressum</Link>
											<span>|</span>
											<Link to="/privacy">Privacy Policy</Link>
											<span>|</span>
											<Link to="/contact">Contact</Link>
										</div>
									</div>
								</footer>
							</>
						}
					/>
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
