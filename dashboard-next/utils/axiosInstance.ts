import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "./endpoints";
import { AUTHCOOKIE } from "./CONSTS";
import { getCookie } from "cookies-next";
import { IS_SERVER } from "./is_server";
import { IS_DEV } from "./is_dev";

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

    instance.interceptors.request.use(async (request) => {
        let token;
        // checking if the code is running on the server or client to get the cookie from server headers.
        if (IS_SERVER) {
            const { cookies } = (await import('next/headers'))
            token = cookies().get(AUTHCOOKIE)?.value
            // if the code is running on the client, get the cookie from the browser.
        } else {
            token = getCookie(AUTHCOOKIE)
        }
        if (token) {
            if (IS_DEV) console.log("access token", token);
            request.headers.Authorization = `Bearer ${token}`
        }
        return request
    })

    instance.interceptors.response.use(
        (response) => {
            return response
        },
        (error) => {
            // intercept the error on the response.
        }
    )
    return instance
}
export default ApiClient()