export const PATH_METADATA = 'path';
export const METHOD_METADATA = 'method';
export const ROUTE_ARGS_METADATA = '__routeArguments__';
export const MODULE_METADATA = {
    IMPORTS: 'imports' as 'imports',
    PROVIDERS: 'providers' as 'providers',
    CONTROLLERS: 'controllers' as 'controllers',
    EXPORTS: 'exports' as 'exports',
};
export const MODULE_METADATA_KEYS = [
    ...Object.values(MODULE_METADATA)
];
export type MODULE_METADATA_KEYS_TYPE = typeof MODULE_METADATA[keyof typeof MODULE_METADATA];
export const COMPONENT_MODULE = "__componentModule___";
export const COMPONENT_TYPE = {
    PARAMETER: '__parameter__',
    CONTROLLER: '__controller__',
    MAPPING: '__mapping__',
    INJECTABLE: '__injectable__',
    MODULE: '__module__'
};