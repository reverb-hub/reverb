import { HttpMethod } from '../common/http.ts';
import { METHOD_METADATA, PATH_METADATA } from '../common/constants.ts';

export const Mapping = (
    method: HttpMethod,
    path?: string
): MethodDecorator => {

    return (
        target: object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<any>,
    ) => {
        Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
        Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
        return descriptor;
    };
};