import {
  MODULE_METADATA,
  MODULE_METADATA_KEYS,
  MODULE_METADATA_KEYS_TYPE,
} from "../common/constants.ts";
import { COMPONENT_TYPE } from "../common/constants.ts";

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface ModuleMetadata {
  [MODULE_METADATA.CONTROLLERS]?: Type<any>[];
  [MODULE_METADATA.PROVIDERS]?: Type<any>[];
}

export function Module(metadata: ModuleMetadata): ClassDecorator {
  const propsKeys = (Object.keys(metadata) as unknown) as Array<
    keyof ModuleMetadata
  >;
  validateModuleKeys(propsKeys);

  return (target: Function) => {
    // Component type is MODULE
    Reflect.defineMetadata(COMPONENT_TYPE.MODULE, true, target);
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) {
        // Add module metadata entries to respective keys on our module
        Reflect.defineMetadata(property, (metadata as any)[property], target);
      }
    }
  };
}

export const INVALID_MODULE_CONFIG_MESSAGE = (
  text: TemplateStringsArray,
  property: string,
) => `Invalid property '${property}' passed into the @Module() decorator.`;

export function validateModuleKeys(keys: typeof MODULE_METADATA_KEYS) {
  const validateKey = (key: MODULE_METADATA_KEYS_TYPE) => {
    if (MODULE_METADATA_KEYS.includes(key)) {
      return;
    }
    throw new Error(INVALID_MODULE_CONFIG_MESSAGE`${key}`);
  };
  keys.forEach(validateKey);
}
