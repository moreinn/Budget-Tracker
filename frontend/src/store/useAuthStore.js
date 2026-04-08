import { create } from  "zustand";;
import api from "../api/axios";

const useAuthStore = create((set) => ({
    user: null,
    isLoading: false,

    signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
            const res = await api.post("/auth/signup", { name, email, password });
            set({ user: res.data.user,  isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try{
            const res = await api.post("/auth/login", { email, password }); 
            set({ user: res.data.user, isLoading: false }); 
        } catch (error) {   
            set({ isLoading: false });  
            throw error;    
        }
    },

    logout: async () => {
        set({ isLoading: true });    
        await api.post("/auth/logout");
        set({ user: null,  });   
    },

}));


export default useAuthStore;
