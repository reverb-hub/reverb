import { RouteResolution } from './route-resolver.ts';
import { RouteArgtype } from '../decorators/parameter.ts';
import { ServerRequest } from '../deps.ts';
import { BodyReader } from '../common/body-reader.ts';

async function getArgFromRequest(arg: RouteArgtype, request: ServerRequest, resolution: RouteResolution, key?: string) {
    switch (arg) {
        case RouteArgtype.REQUEST:
            return request;
        case RouteArgtype.SESSION:
        case RouteArgtype.QUERY:
            return null;
        case RouteArgtype.PARAM:
            if (typeof key === "string") {
                // @ts-ignore
                return resolution.pathVariables[key];
            } else {
                throw "Param key not defined";
            }
        case RouteArgtype.HEADERS:
            return request.headers;
        case RouteArgtype.HEADER:
            if (typeof key === "string") {
                return request.headers.get(key);
            } else {
                throw "Header key not defined";
            }
        case RouteArgtype.HOST:
            // @ts-ignore
            return request.headers.host;
        case RouteArgtype.BODY:
            return await BodyReader(request);
    }
}

export async function RouteExecutor(resolution: RouteResolution, request: ServerRequest) {
    if (resolution?.route === undefined) {
        throw "404"
    } else {
        const args: Array<any> = []
        for (const arg of Object.entries(resolution.route.argsMetadata)) {
            const [key, argMetadata] = arg
            // @ts-ignore
            args[argMetadata.index] = await getArgFromRequest(key as RouteArgtype, request, resolution, argMetadata.data)
        }
        resolution.route.handler(...args)
    }
}