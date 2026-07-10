import axios from "axios";

//aici punem requesturile catre backend

const API_URL="http://localhost:8080";

export const loginRequest=async(data)=>{
    const response=await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
};

export const registerRequest=async(data)=>{
    const response=await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
};
export const getPublicProfiluri = async () => {
    const response = await axios.get(`${API_URL}/profiluri`);
    return response.data;
};

export const updateMyProfileRequest = async(data, token) => {
    const response = await axios.put(`${API_URL}/utilizatori/me/profil`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
