import { jwtDecode } from 'jwt-decode';

export default function getUserId() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const { user } = jwtDecode(token);
    return user.id;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
