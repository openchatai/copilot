import axios, { AxiosInstance } from "axios";
import { BASE_BACKEND_URL } from "./endpoints";
/**
 * @description Axios instance with interceptors 
 */
function ApiClient(): AxiosInstance {
    const instance = axios.create({
        baseURL: BASE_BACKEND_URL + "/api",
        headers: {
            Accept: "application/json",
        }
    })
    instance.interceptors.response.use((response) => {
        return response
    }, (error) => {
        console.log(error)
        throw error
    }
    )
    return instance
}
export default ApiClient()