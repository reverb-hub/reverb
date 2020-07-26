import { MODULE_METADATA } from "../common/constants.ts";
import { Type } from "../decorators/module.ts";
import { COMPONENT_TYPE } from "../common/constants.ts";

export class ModuleBuilder {

  // Map<Constructable type, Constructed instance>
  private readonly controllerInstances:Map<Type<any>, any> = new Map();
  // Map<Constructable type, Constructed instance>
  private readonly providerInstances: Map<Type<any>, any> = new Map();

  constructor(private appModule: Type<any>) {
    this.buildModule();
  }

  private buildModule() {
    if (Reflect.getMetadata(COMPONENT_TYPE.MODULE, this.appModule) !== true) {
      throw "non module supplied";
    }

    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, this.appModule);
    controllers.forEach((controller: Type<any>) => {
      const controllerInstance = this.resolveController<any>(controller)
    });
  }

  private resolveController<T>(target: Type<any>): T {
    // tokens are required dependencies, while injections are resolved tokens from the Injector
    const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
    const injections = tokens.map((token: Type<any>) => this.resolveProvider<any>(token));

    const controller = new target(...injections);
    this.controllerInstances.set(target, controller);
    return new target(...injections);
  }

  private resolveProvider<T>(target: Type<any>): T {
    if (this.providerInstances.has(target)) {
      // If we already have a instance of this return it.
      return this.providerInstances.get(target);
    }
    const moduleProviers: Type<any>[] = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, this.appModule);
    if (!moduleProviers.includes(target)) {
      throw "Provider not included in module: " + target.name;
    }
    const tokens = Reflect.getMetadata('design:paramtypes', target) || [];
    const injections = tokens.map((token: Type<any>) => this.resolveProvider<any>(token));

    // Instance our new provider and insert it into our map
    const provider = new target(...injections);
    this.providerInstances.set(target, provider);
    return provider;
  }

  controllers(): any[] {
    return [ ...this.controllerInstances.values() ];
  }

}