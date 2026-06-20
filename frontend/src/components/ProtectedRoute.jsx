import React from 'react';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // We can handle manual redirection using state or layout rendering.
    // Let's render a message or redirect inline if we manage state routes.
    // To fit a single-page application structure, we can manage the navigation in App.jsx.
    // If not authenticated, we will render a sleek screen telling them to login,
    // or let App.jsx render the login view.
    // For React-Router equivalent without router overhead, we can manage page navigation in the state.
    // That makes it extremely robust and error-free!
    return null;
  }

  return children;
};

export default ProtectedRoute;
