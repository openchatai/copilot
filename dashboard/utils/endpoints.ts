import { IS_DEV } from "./is_dev"
import { IS_SERVER } from "./is_server"
// browser => http://localhost:8888/backend
// server => http://backend:5000
// DEV(SERVER,client) => http://localhost:8888/backend

export const BASE_BACKEND_URL = IS_DEV || !IS_SERVER ? "http://localhost:8888/backend" : "http://backend:5000"
