import { cookies } from "next/headers";
import { AUTHCOOKIE } from "utils/CONSTS";
import axiosInstance from "utils/axiosInstance";
import { replaceTemplateString } from "utils/repalceTemplateString";
import { safeParse } from "valibot";
import { DataSourcesAfterParsing, dataSourcesSchema } from "schemas/dataSourcesSchama";
import { type Output } from 'valibot';
import { NextRequest, NextResponse } from "next/server";

function trasnformData(
    data: Output<typeof dataSourcesSchema>
): DataSourcesAfterParsing[] {
    let dataSources: DataSourcesAfterParsing[] = [];
    const sources = data.data_sources;
    const websiteDataSources = sources.websiteDataSources;
    const pdfDataSources = sources.pdfDataSources;
    const codeDataSouces = sources.codebaseDataSources;

    websiteDataSources?.forEach((source) => {
        dataSources.push({
            type: "website",
            ...source,
        });
    });
    pdfDataSources?.forEach((source) => {
        dataSources.push({
            type: "pdf",
            ...source,
        });
    });
    codeDataSouces?.forEach((source) => {
        dataSources.push({
            type: "code",
            ...source,
        });
    });
    return dataSources;
}

export async function GET(request: NextRequest,
    { params }: { params: { bot_id: string } }) {
    const authCookie = cookies().get(AUTHCOOKIE)
    if (!authCookie) return NextResponse.json({ error: "Not Authenticated" }, {
        status: 401
    })

    const endpoint = replaceTemplateString("/bots/:id/data-sources", {
        id: params.bot_id,
    })
    const data = await axiosInstance.get(endpoint);

    const safeData = safeParse(dataSourcesSchema, data.data);
    const dataSources = safeData.success ? trasnformData(safeData.data) : [];
    return NextResponse.json({ dataSources });
}