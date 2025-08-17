export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    window.location.href = '/login';
  }
}