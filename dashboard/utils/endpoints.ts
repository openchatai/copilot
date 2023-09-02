import { IS_SERVER } from "./is_server"
export const BASE_BACKEND_URL = !IS_SERVER ? "http://localhost:8888/backend" : "http://backend:5000"
