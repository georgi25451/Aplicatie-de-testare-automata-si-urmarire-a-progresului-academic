import axios from 'axios';

const API_URL = "http://localhost:8080";

export const getRecomandariByUser = async (token) => {
    const response = await axios.get(`${API_URL}/recomandari/user`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
