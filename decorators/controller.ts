import { PATH_METADATA } from '../common/constants.ts';

export function Controller(
    path?: string,
): ClassDecorator {
    const defaultPath = '/';

    return (target: object) => {
        Reflect.defineMetadata(PATH_METADATA, path, target);
    };
}