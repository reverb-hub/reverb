import { Type } from '../decorators/module.ts';
import { COMPONENT_TYPE, MODULE_METADATA, PATH_METADATA, METHOD_METADATA, ROUTE_ARGS_METADATA } from '../common/constants.ts';
import { isMethod, isString } from '../util/check.ts';
import { Injector } from './injector.ts';
import { HttpMethod } from '../common/http.ts';

interface RouteRecord {
    handler(...args: any): any;
    // TODO use same type as metadata for ROUTE_ARGS_METADATA returns here
    argsMetadata: any;
}

type RoutesObject = { [path: string]: RouteSector };

export interface RouteResolution {
    route: RouteRecord;
    pathVariables?: { [name: string]: string };
    queryParameters?: { [name: string]: string | Array<string>};
}

class RouteSector {
    methods: {
        [key in HttpMethod]?: RouteRecord
    } = {};
    public staticSectors: RoutesObject = {}
    public varSectors: RoutesObject = {};
    constructor(route?: [HttpMethod, RouteRecord]) {
        if (route) {
            this.methods[route[0]] = route[1];
        }
    }

    addRoute(path: Array<string>, method: HttpMethod, record: RouteRecord) {
        if (path.length <= 0) {
            this.addMethod(method, record);
        } else {
            const subPath = path.shift()!;
            if (subPath.startsWith("{") && subPath.endsWith("}")) {
                // @ts-ignore
                const varName = subPath.replaceAll("{", "").replaceAll("}", "");
                if (!this.varSectors[varName]) {
                    this.varSectors[varName] = new RouteSector();
                }
                this.varSectors[varName].addRoute(path, method, record);
            } else {
                if (!this.staticSectors[subPath]) {
                    this.staticSectors[subPath] = new RouteSector();
                }
                this.staticSectors[subPath].addRoute(path, method, record);
            }
        }

    }

    addMethod(method: HttpMethod, record: RouteRecord) {
        if (this.methods[method]) {
            throw "Method already used for this route";
        }
        this.methods[method] = record;
    }

    resolveSubRoute(path: Array<string>, method: HttpMethod, pathVariables: { [name: string]: string } = {}): RouteResolution {
        if (path.length <= 0) {
            return {
                route: this.methods[method]!,
                pathVariables
            };
        } else {
            const subPath = path.shift()!;
            const varSectors = Object.keys(this.varSectors);
            if (varSectors.length >= 1) {
                let routeFinal: RouteResolution | undefined = undefined;
                for (const sector of varSectors) {
                    try {
                        const route = this.varSectors[sector].resolveSubRoute(path, method, {
                            [sector]: subPath,
                            ...pathVariables
                        });
                        if (routeFinal != undefined) {
                            throw "Multiple correct route resolutions!";
                        }
                        return route;
                    } catch {}
                }
            }
            if (this.staticSectors[subPath]) {
                return this.staticSectors[subPath].resolveSubRoute(path, method, pathVariables);
            } else {
                throw "Route not found/404";
            }
        }
    }
}

export class RouteResolver {
    private readonly routeMap: RouteSector = new RouteSector();
    constructor(private controllerInstances: any[]) {
        this.resolveRoutes();
    }

    private resolveRoutes() {
        this.controllerInstances.forEach((controllerInstance: any) => {
            const path = Reflect.getMetadata(PATH_METADATA, controllerInstance.constructor)
            const methods = Object.getOwnPropertyNames(controllerInstance.constructor.prototype).filter((property) => {
                return isMethod(controllerInstance.constructor.prototype, property) && (Reflect.getMetadata(COMPONENT_TYPE.MAPPING, controllerInstance.constructor.prototype[property]) === true)
            })

            methods.forEach((method) => {
                const mappingPath = Reflect.getMetadata(PATH_METADATA, controllerInstance.constructor.prototype[method]);
                const fullPathSections = (path + mappingPath).split("/");
                fullPathSections.shift();
                const methodType: HttpMethod = Reflect.getMetadata(METHOD_METADATA, controllerInstance.constructor.prototype[method]);
                // TODO include this in routes
                const paramMetadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, controllerInstance.constructor.prototype.constructor, method)
                this.routeMap.addRoute(fullPathSections, methodType, {
                    handler: (controllerInstance[method] as (...args: any) => any).bind(controllerInstance),
                    argsMetadata: paramMetadata,
                });
            })
        })
    }

    private resolveQueryParameters(queryParamSection: string): { [name: string]: string | Array<string>} {
        const queryParamSections = queryParamSection.split("&");
        const queryParams: { [name: string]: string | Array<string>} = {};

        queryParamSections.forEach((queryParam) => {
            const [key, value] = queryParam.split("=")
            const values = value.split(",").map(val => {
                return decodeURIComponent(val)
            })

            const existingParam = queryParams[key]

            if (existingParam) {
                if (isString(existingParam)) {
                    queryParams[key] = [existingParam].concat(values)
                } else {
                    queryParams[key] = existingParam.concat(values)
                }
            } else {
                if (values.length === 1) {
                    queryParams[key] = values[0]
                } else {
                    queryParams[key] = values
                }
            }
        })

        return queryParams;
    }

    resolveRoute(uri: string, method: HttpMethod): RouteResolution {
        const [url, queryParams] = uri.split("?");
        const sections = url.split("/");
        sections.shift();
        const resolution = this.routeMap.resolveSubRoute(sections, method);
        if (queryParams) {
            resolution.queryParameters = this.resolveQueryParameters(queryParams)
        }
        return resolution
    }

    printRoutes() {
        console.log(this.routeMap);
    }
}