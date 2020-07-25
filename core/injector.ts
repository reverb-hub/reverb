import { Type } from '../decorators/module.ts';

export const Injector = new class {
    // resolving instances
    resolve<T>(target: Type<any>): T {
        // tokens are required dependencies, while injections are resolved tokens from the Injector
        let tokens = Reflect.getMetadata('design:paramtypes', target) || [],
            injections = tokens.map((token: Type<any>) => Injector.resolve<any>(token));

        return new target(...injections);
    }
};