import { RouteResolution } from './route-resolver.ts';
import { RouteArgtype } from '../decorators/parameter.ts';
import { ServerRequest } from '../deps.ts';
import { BodyReader } from '../common/body-reader.ts';

async function getArgFromRequest(arg: RouteArgtype, request: ServerRequest, resolution: RouteResolution, key?: string) {
    switch (arg) {
        case RouteArgtype.REQUEST:
            return request;
        case RouteArgtype.RESPONSE:
            return null;
        case RouteArgtype.NEXT:
            return null;
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
        case RouteArgtype.SESSION:
            return null;
        case RouteArgtype.FILE:
            return null;
        case RouteArgtype.FILES:
            return null;
        case RouteArgtype.HOST:
            return null;
        case RouteArgtype.IP:
            return null;
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