import axios from 'axios';
import apiUrl from './serverConfig';

const fetchLeagues = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const response = await axios.get(`${apiUrl}/getuserleagues/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return [];
  }
};

export default fetchLeagues;
