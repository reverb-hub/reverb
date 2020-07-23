import { Type } from '../decorators/module.ts';
import { COMPONENT_TYPE, MODULE_METADATA, PATH_METADATA } from '../common/constants.ts';
import { isConstructor, isMethod } from '../util/check.ts';


export class RouteResolver {
    constructor(private appModule: Type<any>) {
    }

    resolveRoutes(): Map<string, [Type<any>, Function]> {
        if (Reflect.getMetadata(COMPONENT_TYPE.MODULE, this.appModule) !== true) {
            throw "non module supplied"
        }

        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, this.appModule)

        controllers.forEach((controller: Type<any>) => {
            if (Reflect.getMetadata(COMPONENT_TYPE.CONTROLLER, controller) !== true) {
                throw "non controller in controllers"
            }
            const path = Reflect.getMetadata(PATH_METADATA, controller)
            const mappings = Object.getOwnPropertyNames(controller.prototype).filter((property) => {
                return isMethod(controller.prototype, property) && (Reflect.getMetadata(COMPONENT_TYPE.MAPPING, controller.prototype[property]) === true)
            })
            console.log(mappings)
        })

        return new Map<string, [Type<any>, Function]>()
    }
}