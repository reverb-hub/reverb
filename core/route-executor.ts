import { RouteResolution } from './route-resolver.ts';
import { RouteArgtype } from '../decorators/parameter.ts';
import { ServerRequest, ServerResponse } from '../deps.ts';
import { BodyReader } from '../common/body-reader.ts';
import { isNull, isObject, isString } from '../util/check.ts';
import { HttpError } from '../common/http-error.ts';
import { HttpStatusCode } from '../common/http-status-code.ts';

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
                throw {
                    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                    body: "Param key not defined"
                };
            }
        case RouteArgtype.HEADERS:
            return request.headers;
        case RouteArgtype.HEADER:
            if (isString(key)) {
                return request.headers.get(key);
            } else {
                throw {
                    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                    body: "Header key not defined"
                };
            }
        case RouteArgtype.HOST:
            return request.headers.get("host");
        case RouteArgtype.BODY:
            return await BodyReader(request);
    }
}

export async function RouteExecutor(resolution: RouteResolution, request: ServerRequest): Promise<ServerResponse> {
    if (resolution?.route === undefined) {
        return { status: HttpStatusCode.NOT_FOUND }
    } else {
        const args: Array<any> = []
        if (isObject(resolution.route.argsMetadata)) {
            for (const arg of Object.entries(resolution.route.argsMetadata)) {
                const [key, argMetadata] = arg
                args[argMetadata.index] = await getArgFromRequest(key as RouteArgtype, request, resolution, argMetadata.data)
            }
        }
        try {
            const result = resolution.route.handler(...args)
            if (isString(result) || isObject(result)) {
                return {
                    status: HttpStatusCode.OK,
                    body: JSON.stringify(result)
                }
            } else if (isNull(result)) {
                return { status: HttpStatusCode.NO_CONTENT }
            } else {
                return {
                    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                    body: "Cannot encode Body"
                }
            }
        } catch (e) {
            if (e.status) {
                return {
                    status: e.status,
                    body: e.message
                }
            } else {
                return {
                    status: HttpStatusCode.INTERNAL_SERVER_ERROR,
                    body: isString(e) ? e : undefined
                }
            }
        }
    }
}