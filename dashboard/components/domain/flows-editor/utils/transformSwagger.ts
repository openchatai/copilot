import type { ExtendedOperation, Method, Paths, TransformedPath } from "../types/Swagger";
import { methods as methodsArray } from "../types/Swagger";

/** 
 * @description Transforms the paths object from the swagger file into a more usable format
 */
export function transformPaths(paths: Paths): TransformedPath[] {
    const trasnformedPaths = new Set<TransformedPath>();
    Object.keys(paths).forEach((pathString) => {
        const endpoint = paths[pathString];
        const methods = new Set<ExtendedOperation>()
        endpoint && Object.keys(endpoint).forEach((method) => {
            if (methodsArray.includes(method as Method)) {
                const operation = endpoint[method as Method];
                operation && methods.add({
                    method: method as Method,
                    description: operation.description,
                    summary: operation.summary,
                    parameters: operation.parameters,
                    tags: operation.tags,
                    operationId: operation.operationId,
                    methods: []
                });
            }

        });
        trasnformedPaths.add({
            path: pathString,
            methods: Array.from(methods)
        });
    });
    return Array.from(trasnformedPaths);
}