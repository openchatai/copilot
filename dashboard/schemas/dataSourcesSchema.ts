import * as v from 'valibot';
import { type Output } from 'valibot';
import { botSchema } from './botSchema';

export const DataSourcesSchema = v.object({
    bot: botSchema,
    data_sources: v.object({
        websiteDataSources: v.array(v.object({
            id: v.string(),
            chatbot_id: v.string(),
            root_url: v.string(),
            icon: v.nullable(v.string()),
            vector_databased_last_ingested_at: v.nullable(v.string()),
            crawling_type: v.string(),
            crawling_status: v.string(),
            crawling_progress: v.number(),
            created_at: v.string(),
            updated_at: v.string()
        })),
        pdfDataSources: v.nullable(v.array(v.object({
            id: v.string(),
            chatbot_id: v.string(),
            root_url: v.string(),
            icon: v.nullable(v.string()),
            vector_databased_last_ingested_at: v.nullable(v.string()),
            crawling_type: v.string(),
            crawling_status: v.string(),
            crawling_progress: v.number(),
            created_at: v.string(),
            updated_at: v.string()
        }))),
        codebaseDataSources: v.nullable(v.array(v.object({
            id: v.string(),
            chatbot_id: v.string(),
            root_url: v.string(),
            icon: v.nullable(v.string()),
            vector_databased_last_ingested_at: v.nullable(v.string()),
            crawling_type: v.string(),
            crawling_status: v.string(),
            crawling_progress: v.number(),
            created_at: v.string(),
            updated_at: v.string()
        }))),
        totalNumberOfDataSources: v.number()
    })
})


export type DataSourcesType = Output<typeof DataSourcesSchema>