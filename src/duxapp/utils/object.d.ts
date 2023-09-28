export function recursionSetValue(
  keys: string[] | string,
  data: any[] | object,
  value: any,
  childKey: string,
  splice: boolean
): void

export function recursionGetValue(
  keys: string[] | string,
  data: string[] | object,
  childKey: string,
  splice: boolean
): any

export function verifyValueInArray(value: string | any, array: any[], defaultValue: any): any

export function deepCopy(data: object | any): object | any
