import { ROUTE_ARGS_METADATA } from '../common/constants.ts';

export enum RouteParamtypes {
    REQUEST,
    RESPONSE,
    NEXT,
    BODY,
    QUERY,
    PARAM,
    HEADERS,
    SESSION,
    FILE,
    FILES,
    HOST,
    IP,
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
        [`${paramtype}:${index}`]: {
            index,
            data
        },
    };
}

export function Parameter(paramtype: RouteParamtypes) {
    return (data?: ParamData): ParameterDecorator => (target, key, index) => {
        const args =
            Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(
            ROUTE_ARGS_METADATA,
            assignMetadata<RouteParamtypes, Record<number, RouteParamMetadata>>(
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

export function Body(
    property?: string,
): ParameterDecorator {
    return Parameter(RouteParamtypes.BODY)(property);
}