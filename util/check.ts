export const isUndefined = (obj: any): obj is undefined =>
    typeof obj === 'undefined';

export const isObject = (func: any): func is object =>
    !isNull(func) && typeof func === 'object';

export const isPlainObject = (func: any): func is object => {
    if (!isObject(func)) {
        return false;
    }
    const proto = Object.getPrototypeOf(func);
    if (proto === null) {
        return true;
    }
    const ctor =
        Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
        proto.constructor;
    return (
        typeof ctor === 'function' &&
        ctor instanceof ctor &&
        Function.prototype.toString.call(ctor) ===
        Function.prototype.toString.call(Object)
    );
};

export const isMethod = (prototype: object, prop: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
    // @ts-ignore
    if (descriptor.set || descriptor.get) {
        return false;
    }
    // @ts-ignore
    // @ts-ignore
    return !isConstructor(prop) && isFunction(prototype[prop]);
}

export const validatePath = (path?: string): string =>
    path ? (path.charAt(0) !== '/' ? '/' + path : path) : '';

export const isFunction = (func: any): boolean => typeof func === 'function';
export const isString = (func: any): func is string => typeof func === 'string';
export const isConstructor = (func: any): boolean => func === 'constructor';
export const isNull = (obj: any): obj is null | undefined => isUndefined(obj) || obj === null;
export const isEmpty = (array: any): boolean => !(array && array.length > 0);
export const isSymbol = (func: any): func is symbol => typeof func === 'symbol';