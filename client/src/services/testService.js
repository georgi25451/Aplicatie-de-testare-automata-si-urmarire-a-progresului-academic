import axios from 'axios';

const API_URL = "http://localhost:8080";

export const getAllTeste = async (token) => {
    const response = await axios.get(`${API_URL}/teste`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getOneTest = async (tid, token) => {
    const response = await axios.get(`${API_URL}/teste/${tid}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const generateTestByTemplate = async (idTemplate, token) => {
    const response = await axios.post(`${API_URL}/teste/generate/${idTemplate}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const submitTest = async (tid, raspunsuri, token) => {
    const response = await axios.post(`${API_URL}/teste/${tid}/submit`, { raspunsuri }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
