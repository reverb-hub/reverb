import { ROUTE_ARGS_METADATA } from '../common/constants.ts';
import { COMPONENT_TYPE } from '../common/constants.ts';

export enum RouteArgtype {
    REQUEST = 'REQUEST',
    RESPONSE = 'RESPONSE',
    NEXT = 'NEXT',
    BODY = 'BODY',
    QUERY = 'QUERY',
    PARAM = 'PARAM',
    HEADERS = 'HEADERS',
    SESSION = 'SESSION',
    FILE = 'FILE',
    FILES = 'FILES',
    HOST = 'HOST',
    IP = 'IP',
}

export type ArgData = object | string | number;
export interface RouteParamMetadata {
    index: number;
    data?: ArgData;
}

export function assignMetadata<TParamtype = any, TArgs = any>(
    args: TArgs,
    paramtype: TParamtype,
    index: number,
    data?: ArgData
) {
    return {
        ...args,
        [`${paramtype}`]: {
            index,
            data
        },
    };
}

export function Parameter(paramtype: RouteArgtype) {
    return (data?: ArgData): ParameterDecorator => (target, key, index) => {
        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(COMPONENT_TYPE.PARAMETER, true, target.constructor);
        Reflect.defineMetadata(ROUTE_ARGS_METADATA, assignMetadata<RouteArgtype, Record<number, RouteParamMetadata>>(
                args,
                paramtype,
                index,
                data,
            ),
            target.constructor,
            key,
        );
    };
}

export const RequestHeaders: (header?: string) => ParameterDecorator = Parameter(RouteArgtype.HEADERS);
export const Param: (parameter: string) => ParameterDecorator = Parameter(RouteArgtype.PARAM);
export const Body: () => ParameterDecorator = Parameter(RouteArgtype.BODY);