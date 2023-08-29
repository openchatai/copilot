import { botSchema } from "./botSchema";
import * as v from "valibot";

const DataSourceBaseSchema = v.object({
    id: v.string(),
    chatbot_id: v.string(),
    created_at: v.transform(v.string(), (val) => new Date(val)),
    updated_at: v.transform(v.string(), (val) => new Date(val)),
})

const WebsiteDataSourceSchema = v.object({
    root_url: v.string([v.url()]),
    icon: v.nullable(v.string()),
    vector_databased_last_ingested_at: v.nullable(v.string()),
    crawling_type: v.string(),
    crawling_status: v.union([
        v.literal("failed"),
        v.literal("completed"),
        v.literal("in_progress"),
    ]),
    crawling_progress: v.number([v.minValue(0), v.maxValue(100)]),
})

const PdfDataSourceSchema = v.object({
    files: v.array(v.string()),
    ingest_status: v.union([v.literal("success"), v.literal("failed")]),
})

const CodebaseDataSourceSchema = v.object({
    ingest_status: v.string()
})

export const dataSourcesSchema = v.object({
    bot: botSchema,
    data_sources: v.object({
        websiteDataSources: v.nullable(v.array(v.merge([WebsiteDataSourceSchema, DataSourceBaseSchema]))),
        pdfDataSources: v.nullable(v.array(v.merge([PdfDataSourceSchema, DataSourceBaseSchema]))),
        codebaseDataSources: v.nullable(v.array(v.merge([CodebaseDataSourceSchema, DataSourceBaseSchema]))),
        totalNumberOfDataSources: v.number(),
    }),
});

// this is required to be displayed in the UI
export type DataSourcesAfterParsing = v.Output<typeof DataSourceBaseSchema> & (v.Output<typeof WebsiteDataSourceSchema> & { type: "website" } | v.Output<typeof PdfDataSourceSchema> & { type: "pdf" } | v.Output<typeof CodebaseDataSourceSchema> & { type: "code" })