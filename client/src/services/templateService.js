import axios from "axios";

//aici punem requesturile catre backend pentru sabloane si profiluri

const API_URL="http://localhost:8080";

//returneaza toate profilurile
export const getAllProfiluri=async(token)=>{
    const response=await axios.get(`${API_URL}/profiluri`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//returneaza toate sabloanele pentru un profil
export const getAllTemplates=async(profilId, token)=>{
    const response=await axios.get(`${API_URL}/profiluri/${profilId}/templates`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//creeaza un sablon pentru un profil
export const createTemplate=async(profilId, data, token)=>{
    const response=await axios.post(`${API_URL}/profiluri/${profilId}/templates`, data, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//editeaza un sablon
export const updateTemplate=async(profilId, ttid, data, token)=>{
    const response=await axios.put(`${API_URL}/profiluri/${profilId}/templates/${ttid}`, data, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//sterge (dezactiveaza) un sablon - soft delete
export const deleteTemplate=async(profilId, ttid, token)=>{
    const response=await axios.delete(`${API_URL}/profiluri/${profilId}/templates/${ttid}`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//returneaza toate intrebarile pentru un profil
export const getAllIntrebari=async(profilId, token)=>{
    const response=await axios.get(`${API_URL}/profiluri/${profilId}/intrebari`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//returneaza o singura intrebare
export const getOneIntrebare=async(profilId, iid, token)=>{
    const response=await axios.get(`${API_URL}/profiluri/${profilId}/intrebari/${iid}`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//creeaza o intrebare pentru un profil
export const createIntrebare=async(profilId, data, token)=>{
    const response=await axios.post(`${API_URL}/profiluri/${profilId}/intrebari`, data, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//editeaza o intrebare
export const updateIntrebare=async(profilId, iid, data, token)=>{
    const response=await axios.put(`${API_URL}/profiluri/${profilId}/intrebari/${iid}`, data, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};

//sterge o intrebare
export const deleteIntrebare=async(profilId, iid, token)=>{
    const response=await axios.delete(`${API_URL}/profiluri/${profilId}/intrebari/${iid}`, {
        headers:{ Authorization:`Bearer ${token}` }
    });
    return response.data;
};
