import { COMPONENT_TYPE, PATH_METADATA } from '../common/constants.ts';

export function Controller(
    path?: string,
): ClassDecorator {
    const defaultPath = '/';

    return (target: object) => {
        Reflect.defineMetadata(PATH_METADATA, path, target);
        Reflect.defineMetadata(COMPONENT_TYPE.CONTROLLER, true, target);
    };
}