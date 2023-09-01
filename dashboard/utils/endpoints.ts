import { IS_SERVER } from "./is_server"

const isDEV = process.env.NODE_ENV === 'development'
export const BASE_BACKEND_URL = !IS_SERVER ? "http://localhost:5000" : "http://backend:5000"
// export const BASE_BACKEND_URL = "http://0.0.0.0:5000"
export const BASE_DASHBOARD_URL = "http://127.0.0.1:8000/api" // @todo
