import { AUTHCOOKIE } from "utils/CONSTS";
import { serialize } from "cookie";

export async function POST() {
    const Cookie = serialize(AUTHCOOKIE, "deleted", {
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() - 1),
        httpOnly: false,
    })

    return new Response("ok", {
        status: 200,
        headers: {
            "Set-Cookie": Cookie
        }
    })
}