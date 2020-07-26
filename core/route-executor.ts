import { RouteResolution } from './route-resolver.ts';
import { RouteArgtype } from '../decorators/parameter.ts';
import { ServerRequest, ServerResponse } from '../deps.ts';
import { BodyReader } from '../common/body-reader.ts';
import { isNull, isObject, isString } from '../util/check.ts';

async function getArgFromRequest(arg: RouteArgtype, request: ServerRequest, resolution: RouteResolution, key?: string): Promise<any> {
    switch (arg) {
        case RouteArgtype.REQUEST:
            return request;
        case RouteArgtype.SESSION:
        case RouteArgtype.QUERY:
            return null;
        case RouteArgtype.PARAM:
            if (isString(key)) {
                return resolution?.pathVariables?[key] : undefined;
            } else {
                throw "Param key not defined";
            }
        case RouteArgtype.HEADERS:
            return request.headers;
        case RouteArgtype.HEADER:
            if (isString(key)) {
                return request.headers.get(key);
            } else {
                throw "Header key not defined";
            }
        case RouteArgtype.HOST:
            return request.headers.get("host");
        case RouteArgtype.BODY:
            return await BodyReader(request);
    }
}

export async function RouteExecutor(resolution: RouteResolution, request: ServerRequest): Promise<ServerResponse> {
    if (resolution?.route === undefined) {
        throw "404"
    } else {
        const args: Array<any> = []
        if (isObject(resolution.route.argsMetadata)) {
            for (const arg of Object.entries(resolution.route.argsMetadata)) {
                const [key, argMetadata] = arg
                args[argMetadata.index] = await getArgFromRequest(key as RouteArgtype, request, resolution, argMetadata.data)
            }
        }
        const result = resolution.route.handler(...args)
        if (isString(result) || isObject(result)) {
            return {
                status: 200,
                body: JSON.stringify(result)
            }
        } else if (isNull(result)) {
            return { status: 204 }
        } else {
            throw "500 cant encode response"
        }
    }
}