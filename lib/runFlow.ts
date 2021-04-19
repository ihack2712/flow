// Imports
import type { Addon, BaseCallback, NextFunction } from "./types.ts";

export type RunFlowOptions<Callback extends BaseCallback> = {
  addons: Addon<Callback>[] | Set<Addon<Callback>>;
  position?: number;
  args: Parameters<Callback>;
  customLastNext?: NextFunction;
};

export type CreateNextOptions<Callback extends BaseCallback> =
  & RunFlowOptions<Callback>
  & { _error: [error?: Error] };

function createDeadNext(): NextFunction {
  // deno-lint-ignore require-await
  const self: NextFunction = async () => {
    if (self.called) {
      return;
    }
    self.called = true;
  };
  self.isNextFunction = true;
  return self;
}

function createNext<Callback extends BaseCallback>(
  {
    addons,
    position,
    args,
    customLastNext,
    _error,
  }: CreateNextOptions<Callback>,
): NextFunction {
  position ??= 0;
  const pos = position++;
  addons = addons instanceof Set ? [...addons] : addons;
  const addon = addons[pos];
  if (!addon) {
    return customLastNext || createDeadNext();
  }
  const self: NextFunction = async (callNext) => {
    if (self.called) {
      return;
    }
    self.called = true;
    if (callNext !== false) {
      try {
        if (typeof addon === "function") {
          await addon(
            ...args,
            createNext({
              addons,
              position,
              args,
              customLastNext,
              _error,
            }),
          );
        } else {
          await addon.run(
            ...args,
            createNext({
              addons,
              position,
              args,
              customLastNext,
              _error,
            }),
          );
        }
      } catch (error) {
        if (_error[0] === undefined) {
          _error[0] = error;
        }
      } finally {
        if (_error[0] !== undefined) {
          throw _error[0];
        }
      }
    }
    if (_error[0] !== undefined) {
      throw _error[0];
    }
  };
  self.isNextFunction = true;
  return self;
}

export async function runFlow<Callback extends BaseCallback>(
  {
    addons,
    position,
    args,
    customLastNext,
  }: RunFlowOptions<Callback>,
): Promise<void> {
  const next = createNext({
    addons,
    position,
    args,
    customLastNext,
    _error: [],
  });
  await next();
}
