export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  }
}