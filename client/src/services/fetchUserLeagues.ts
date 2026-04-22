import axios from 'axios';
import apiUrl from './serverConfig.js';

const fetchUserLeagues = async (userId: number | null): Promise<any[]> => {
  if (!userId) return [];

  try {
    const res = await axios.get(`${apiUrl}/getuserleagues/${userId}`);
    return res.data;
  } catch {
    return [];
  }
};

export default fetchUserLeagues;
