import { useState } from 'react';
import { predictionService } from '../services/apiService';

/**
 * Hook for managing prediction form state and submission.
 * TODO: Connect to PredictPage form when UI is implemented.
 */
function usePrediction() {
 const [prediction, setPrediction] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const submitPrediction = async (formData) => {
 setLoading(true);
 setError(null);
 try {
 const response = await predictionService.create(formData);
 setPrediction(response.data);
 return response.data;
 } catch (err) {
 setError(err.response?.data?.message || err.message);
 throw err;
 } finally {
 setLoading(false);
 }
 };

 const clearPrediction = () => {
 setPrediction(null);
 setError(null);
 };

 return { prediction, loading, error, submitPrediction, clearPrediction };
}

export default usePrediction;
