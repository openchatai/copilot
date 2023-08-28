import { cookies } from "next/headers";
import { AUTHCOOKIE } from "utils/CONSTS";

export async function GET() {
    return new Response(
        JSON.stringify({
            auth_token: cookies().get(AUTHCOOKIE)
        }),
    )
}