import { MODULE_METADATA as metadataConstants } from '../common/constants.ts';
import { COMPONENT_TYPE } from '../common/constants.ts';

export interface Type<T> extends Function {
    new (...args: any[]): T;
}

export interface ModuleMetadata {
    controllers?: Type<any>[];
}

export function Module(metadata: ModuleMetadata): ClassDecorator {
    const propsKeys = Object.keys(metadata);
    validateModuleKeys(propsKeys);

    return (target: Function) => {
        for (const property in metadata) {
            if (metadata.hasOwnProperty(property)) {
                Reflect.defineMetadata(COMPONENT_TYPE.MODULE, true, target);
                Reflect.defineMetadata(property, (metadata as any)[property], target);
            }
        }
    };
}

export const INVALID_MODULE_CONFIG_MESSAGE = (
    text: TemplateStringsArray,
    property: string,
) => `Invalid property '${property}' passed into the @Module() decorator.`;

const metadataKeys = [
    metadataConstants.IMPORTS,
    metadataConstants.EXPORTS,
    metadataConstants.CONTROLLERS,
    metadataConstants.PROVIDERS,
];

export function validateModuleKeys(keys: string[]) {
    const validateKey = (key: string) => {
        if (metadataKeys.includes(key)) {
            return;
        }
        throw new Error(INVALID_MODULE_CONFIG_MESSAGE`${key}`);
    };
    keys.forEach(validateKey);
}