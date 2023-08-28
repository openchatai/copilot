import axios from "axios";
import { getCookie } from "cookies-next";
import { AUTHCOOKIE } from "utils/CONSTS";
import axiosInstance from "utils/axiosInstance";
export function getToken() {
    return getCookie(AUTHCOOKIE)
}
export async function logout() {
    const resp = await axiosInstance.get("/logout");
    if (resp.status === 200) {
        await axios.post("/api/auth/logout");
    }
    return resp.status === 200;
}
