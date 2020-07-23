import { Type } from '../decorators/module.ts';
import { COMPONENT_TYPE, MODULE_METADATA, PATH_METADATA, ROUTE_ARGS_METADATA } from '../common/constants.ts';
import { isConstructor, isMethod } from '../util/check.ts';


export class RouteResolver {
    constructor(private appModule: Type<any>) {
    }

    resolveRoutes(): Map<string, [Type<any>, string]> {
        if (Reflect.getMetadata(COMPONENT_TYPE.MODULE, this.appModule) !== true) {
            throw "non module supplied"
        }

        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, this.appModule)

        const controllerMappings = new Map<string, [Type<any>, string]>()

        controllers.forEach((controller: Type<any>) => {
            if (Reflect.getMetadata(COMPONENT_TYPE.CONTROLLER, controller) !== true) {
                throw "non controller in controllers"
            }
            const controllerInstance = new controller()
            const path = Reflect.getMetadata(PATH_METADATA, controller)
            const methods = Object.getOwnPropertyNames(controller.prototype).filter((property) => {
                return isMethod(controller.prototype, property) && (Reflect.getMetadata(COMPONENT_TYPE.MAPPING, controller.prototype[property]) === true)
            })

            methods.forEach((method) => {
                const mappingPath = Reflect.getMetadata(PATH_METADATA, controller.prototype[method])
                const paramMetadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, controller.prototype.constructor, method)
                controllerMappings.set(path + mappingPath, [controllerInstance, method])
            })
        })

        return controllerMappings
    }
}