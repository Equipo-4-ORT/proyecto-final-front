import api from "./api";

export const getUserSettings = () => api.get("/users/settings").then((r) => r.data);
export const updateUserSettings = (payload) => api.put("/users/settings", payload).then((r) => r.data);