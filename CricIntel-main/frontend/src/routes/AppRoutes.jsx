import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import PredictPage from '../pages/PredictPage';
import ResultsPage from '../pages/ResultsPage';
import PlayerDetailsPage from '../pages/PlayerDetailsPage';
import AboutPage from '../pages/AboutPage';
import NotFoundPage from '../pages/NotFoundPage';

function AppRoutes() {
 return (
 <Routes>
 <Route element={<MainLayout />}>
 <Route path="/" element={<HomePage />} />
 <Route path="/predict" element={<PredictPage />} />
 <Route path="/results" element={<ResultsPage />} />
 <Route path="/players/:id" element={<PlayerDetailsPage />} />
 <Route path="/about" element={<AboutPage />} />
 <Route path="*" element={<NotFoundPage />} />
 </Route>
 </Routes>
 );
}

export default AppRoutes;
