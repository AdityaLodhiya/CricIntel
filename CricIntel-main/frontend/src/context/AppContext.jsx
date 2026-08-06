import { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
 const [selectedFormat, setSelectedFormat] = useState('ODI');
 const [lastPrediction, setLastPrediction] = useState(null);

 const value = useMemo(
 () => ({
 selectedFormat,
 setSelectedFormat,
 lastPrediction,
 setLastPrediction,
 }),
 [selectedFormat, lastPrediction],
 );

 return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
 const context = useContext(AppContext);
 if (!context) {
 throw new Error('useAppContext must be used within AppProvider');
 }
 return context;
}
