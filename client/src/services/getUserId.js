import { jwtDecode } from 'jwt-decode';

export default function getUserId() {
  const { user } = jwtDecode(localStorage.getItem('token'));
  return user.id;
}