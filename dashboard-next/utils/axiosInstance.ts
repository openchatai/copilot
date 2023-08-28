import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "./endpoints";
/**
 * @description Axios instance with interceptors 
 */
function ApiClient(): AxiosInstance {
    const instance = axios.create({
        baseURL: BASE_URL,
        headers: {
            Accept: "application/json",
        }
    })

    return instance
}
export default ApiClient()