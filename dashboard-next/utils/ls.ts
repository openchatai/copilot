// we intent to ensure validation of the data. 
// parsing the data before saving it to the local storage (JSON)
// read storage

function read<TData>(key: string) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) as TData : undefined
}
/**
 * @param key string
 * @description write item to local storage 
 */
function write<TData>(key: string, data: TData) {
    localStorage.setItem(key, JSON.stringify(data))
    return !!localStorage.getItem(key)
}
/** 
 * @param key string
 * @description remove item from local storage
 */
function remove(key: string) {
    localStorage.removeItem(key)
}


export { read, write, remove }