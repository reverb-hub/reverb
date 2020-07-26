import { COMPONENT_TYPE } from "../common/constants.ts";

export function Injectable(): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(COMPONENT_TYPE.INJECTABLE, true, target);
  };
}
