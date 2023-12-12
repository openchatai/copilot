import fs from 'fs/promises';
import fm from 'front-matter';
import z from 'zod';

const CONTENT_PATH = './content/static/';

const contentSchema = z.array(z.object({
    body: z.string(),
    attributes: z.object({
        name: z.string(),
        title: z.string(),
        pathname: z.string(),
    }),
}))

export type MdContentType = z.infer<typeof contentSchema>[0];
export async function getContent() {
    const allContent = (await fs.readdir(CONTENT_PATH)).map((file) => `${CONTENT_PATH}/${file}`);
    const content = allContent.map(async (file) => {
        const content = await fs.readFile(file, 'utf-8');
        return fm(content);
    });
    const parsedContent = await Promise.all(content);
    const validatedContent = contentSchema.parse(parsedContent);
    // withSlug 

    return validatedContent.map((content) => {
        return {
            ...content,
            attributes: {
                ...content.attributes,
                slug: content.attributes.pathname.replace('.md', ''),
            }
        }
    });
}