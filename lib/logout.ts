// utils/logout.ts

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    window.location.href = '/login';
  }
}
