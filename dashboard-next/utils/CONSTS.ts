import { IS_SERVER } from "./is_server";

export const AUTHCOOKIE = 'auth_token';
export const AUTH_ROUTE = '/auth/register'
export const DOMAIN_NAME = IS_SERVER
    ? process.env.NEXT_PUBLIC_SITE_URL!
    : window.location.origin;
