function isEmpty(value: string | object | any[] | undefined): boolean {
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  if (value === undefined) {
    return true;
  }
  return false;
}

function getLast<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

export { isEmpty, getLast };
