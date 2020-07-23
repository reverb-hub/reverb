import { HttpMethod } from '../common/http.ts';
import { COMPONENT_TYPE, METHOD_METADATA, PATH_METADATA } from '../common/constants.ts';

export const Mapping = (
    method: HttpMethod,
    path?: string
): MethodDecorator => {

    return (
        target: object,
        key: string | symbol,
        descriptor: TypedPropertyDescriptor<any>,
    ) => {
        Reflect.defineMetadata(PATH_METADATA, path || "", descriptor.value);
        Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
        Reflect.defineMetadata(COMPONENT_TYPE.MAPPING, true, descriptor.value);
        return descriptor;
    };
};

const createMapping = (method: HttpMethod) => (
    path?: string,
): MethodDecorator => {
    return Mapping(method, path);
};

export const Get = createMapping(HttpMethod.GET);
export const Head = createMapping(HttpMethod.HEAD);
export const Post = createMapping(HttpMethod.POST);
export const Put = createMapping(HttpMethod.PUT);
export const Delete = createMapping(HttpMethod.DELETE);
export const Connect = createMapping(HttpMethod.CONNECT);
export const Options = createMapping(HttpMethod.OPTIONS);
export const Trace = createMapping(HttpMethod.TRACE);
export const Patch = createMapping(HttpMethod.PATCH);