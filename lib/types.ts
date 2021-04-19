// deno-lint-ignore no-explicit-any
export type BaseCallback = (...args: any[]) => Promise<any> | any;
export type NextFunction =
  & ((callNext?: boolean) => Promise<void>)
  & { called?: true }
  & { isNextFunction: true };
export type AddonFunction<Callback extends BaseCallback> = (
  ...args: [...args: Parameters<Callback>, next: NextFunction]
) => ReturnType<BaseCallback>;
export type AddonObject<Callback extends BaseCallback> = {
  run: AddonFunction<Callback>;
};
export type Addon<Callback extends BaseCallback> =
  | AddonFunction<Callback>
  | AddonObject<Callback>;
