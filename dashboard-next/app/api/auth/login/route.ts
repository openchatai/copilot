import { AUTHCOOKIE } from 'utils/CONSTS';
import { serialize } from 'cookie'
import { NextRequest } from 'next/server';
// 7 days
const COOKIE_EXPIRE = 7 * 24 * 60 * 60 * 1000;
export async function POST(request: NextRequest) {
    const { auth_token } = await request.json();
    
    const Cookie = serialize(AUTHCOOKIE, auth_token, {
        path: '/',
        sameSite: 'strict',
        expires: new Date(Date.now() + COOKIE_EXPIRE),
        httpOnly: false,
    })
    return new Response("ok", {
        status: 200,
        headers: {
            "Set-Cookie": Cookie
        }
    })

}