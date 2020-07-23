import { ROUTE_ARGS_METADATA } from '../common/constants.ts';
import { COMPONENT_TYPE } from '../common/constants.ts';

export enum RouteParamtypes {
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

export type ParamData = object | string | number;
export interface RouteParamMetadata {
    index: number;
    data?: ParamData;
}

export function assignMetadata<TParamtype = any, TArgs = any>(
    args: TArgs,
    paramtype: TParamtype,
    index: number,
    data?: ParamData
) {
    return {
        ...args,
        [`${paramtype}`]: {
            index,
            data
        },
    };
}

export function Parameter(paramtype: RouteParamtypes) {
    return (data?: ParamData): ParameterDecorator => (target, key, index) => {
        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(COMPONENT_TYPE.PARAMETER, true, target.constructor);
        Reflect.defineMetadata(ROUTE_ARGS_METADATA, assignMetadata<RouteParamtypes, Record<number, RouteParamMetadata>>(
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

export const RequestHeaders: (header?: string) => ParameterDecorator = Parameter(RouteParamtypes.HEADERS);
export const Param: (parameter: string) => ParameterDecorator = Parameter(RouteParamtypes.PARAM);
export const Body: () => ParameterDecorator = Parameter(RouteParamtypes.BODY);