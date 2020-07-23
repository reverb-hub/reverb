import { Type } from '../decorators/module.ts';
import { COMPONENT_TYPE, MODULE_METADATA, PATH_METADATA, METHOD_METADATA, ROUTE_ARGS_METADATA } from '../common/constants.ts';
import { isConstructor, isMethod } from '../util/check.ts';
import { HttpMethod } from '../common/http.ts';
import { ServerRequest, Response } from '../deps.ts';

interface RouteRecord {
    handler(...args: any): any;
    // TODO use same type as metadata for ROUTE_ARGS_METADATA returns here
    argsMetadata: any;
}

type RoutesObject = { [path: string]: RouteSector };

class RouteSector {
    methods: {
        [key in HttpMethod]?: RouteRecord
    } = {};
    public subSectors: RoutesObject = {}
    constructor(route?: [HttpMethod, RouteRecord]) {
        if (route) {
            this.methods[route[0]] = route[1];
        }
    }

    addRoute(path: Array<string>, method: HttpMethod, record: RouteRecord) {
        if (path.length <= 0) {
            this.addMethod(method, record);
        }
        const subPath = path.shift()!;
        if (!this.subSectors[subPath]) {
            if (path.length <= 0) {
                this.subSectors[subPath] = new RouteSector([method, record]);
                return;
            } else {
                this.subSectors[subPath] = new RouteSector()
            }
        }
        if (path.length <= 0) {
            this.subSectors[subPath].addMethod(method, record);
        } else {
            this.subSectors[subPath].addRoute(path, method, record);
        }
    }

    addMethod(method: HttpMethod, record: RouteRecord) {
        if (this.methods[method]) {
            throw "Method already used for this route";
        }
        this.methods[method] = record;
    }

    resolveSubRoute(path: Array<string>, method: HttpMethod): RouteRecord {
        if (path.length <= 0) {
            return this.methods[method]!;
        }
        const subPath = path.shift()!;
        if (this.subSectors[subPath]) {
            if (path.length <= 0) {
                return this.subSectors[subPath].methods[method]!;
            } else {
                return this.subSectors[subPath].resolveSubRoute(path, method);
            }
        } else {
            throw "Route not found/404";
        }
    }
}

export class RouteResolver {
    private readonly routeMap: RouteSector = new RouteSector();
    constructor(private appModule: Type<any>) {
        this.resolveRoutes();
    }

    private resolveRoutes() {
        if (Reflect.getMetadata(COMPONENT_TYPE.MODULE, this.appModule) !== true) {
            throw "non module supplied"
        }

        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, this.appModule)

        controllers.forEach((controller: Type<any>) => {
            if (Reflect.getMetadata(COMPONENT_TYPE.CONTROLLER, controller) !== true) {
                throw "non controller in controllers"
            }
            // TODO inject things here
            const controllerInstance = new controller()
            const path = Reflect.getMetadata(PATH_METADATA, controller)
            const methods = Object.getOwnPropertyNames(controller.prototype).filter((property) => {
                return isMethod(controller.prototype, property) && (Reflect.getMetadata(COMPONENT_TYPE.MAPPING, controller.prototype[property]) === true)
            })

            methods.forEach((method) => {
                const mappingPath = Reflect.getMetadata(PATH_METADATA, controller.prototype[method]);
                const fullPathSections = (path + mappingPath).split("/");
                fullPathSections.shift();
                const methodType: HttpMethod = Reflect.getMetadata(METHOD_METADATA, controller.prototype[method]);
                // TODO include this in routes
                const paramMetadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, controller.prototype.constructor, method)
                console.log(`Adding new route ${fullPathSections} ${paramMetadata}`)
                this.routeMap.addRoute(fullPathSections, methodType, {
                    handler: controllerInstance[method] as (...args: any) => any,
                    argsMetadata: paramMetadata,
                });
            })
        })
    }

    resolveRoute(uri: string, method: HttpMethod): RouteRecord {
        const sections = uri.split("/");
        sections.shift();
        return this.routeMap.resolveSubRoute(sections, method);
    }

    printRoutes() {
        console.log(this.routeMap);
    }
}