import { createContext, useContext, useState } from 'react';

const RequestsContext = createContext();

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState([]);

  const addRequest = (request) => {
    setRequests(prev => [...prev, request]);
  };

  const updateStatus = (id, status) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status } : r
      )
    );
  };

  return (
    <RequestsContext.Provider value={{ requests, addRequest, updateStatus }}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  return useContext(RequestsContext);
}
