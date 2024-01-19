import toJsonSchema, { type JSONSchema3or4 } from 'to-json-schema';

function isSchama(json: any) {
    if (typeof json !== 'object') {
        return false
    }
    if (json?.type !== 'object') {
        return false
    }
    return true
}

export function toShema(json: any): JSONSchema3or4 {
    const obj = JSON.parse(json)
    return !isSchama(obj) ? toJsonSchema(obj) : obj
}