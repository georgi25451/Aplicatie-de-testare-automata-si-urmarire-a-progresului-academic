import axios from 'axios';
const API_URL = "http://localhost:8080";

export const getProvocareAzi = async (token) => {
    return await axios.get(`${API_URL}/provocari/azi`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const raspundeProvocare = async (idProvocare, raspunsAles, token) => {
    return await axios.post(`${API_URL}/provocari/${idProvocare}/raspunde`, 
    { raspunsAles }, 
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getIstoricProvocari = async (token) => {
    return await axios.get(`${API_URL}/provocari/istoric`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
