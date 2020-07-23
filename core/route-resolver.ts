import { Type } from '../decorators/module.ts';
import { COMPONENT_TYPE, MODULE_METADATA, PATH_METADATA, METHOD_METADATA, ROUTE_ARGS_METADATA } from '../common/constants.ts';
import { isConstructor, isMethod } from '../util/check.ts';
import { HttpMethod } from '../common/http.ts';
import { ServerRequest, Response } from '../deps.ts';

interface PlaceHolderHandler {
    (req: ServerRequest): Response
}

interface RouteMap {
    [r: string]: Route
}

interface Route {
    methods?: {
        [key in HttpMethod]?: PlaceHolderHandler
    };
    subRoutes: RouteMap;
}

export class RouteResolver {
    private readonly routes: RouteMap;
    constructor(private appModule: Type<any>) {
        this.routes = this.resolveRoutes();
    }

    private resolveRoutes(): RouteMap {
        if (Reflect.getMetadata(COMPONENT_TYPE.MODULE, this.appModule) !== true) {
            throw "non module supplied"
        }

        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, this.appModule)

        const routeMap: RouteMap = {};

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
                const mappingPath = Reflect.getMetadata(PATH_METADATA, controller.prototype[method])
                const existingRoute = routeMap[path + mappingPath];
                const methodType: HttpMethod = Reflect.getMetadata(METHOD_METADATA, controller.prototype[method]);
                // TODO include this in routes
                const paramMetadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, controller.prototype.constructor, method)
                if (existingRoute && existingRoute.methods && existingRoute.methods[methodType]) {
                    // TODO expand this error message
                    throw "Route defined twice";
                }
                routeMap[path + mappingPath] = {
                    methods: {
                        [methodType]: controllerInstance[method],
                        ...existingRoute?.methods
                    },
                    subRoutes: {
                        ...existingRoute?.subRoutes
                    }
                };
            })
        })

        return routeMap
    }

    printRoutes() {
        console.log(this.routes);
    }
}