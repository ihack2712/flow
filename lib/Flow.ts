// Imports
import type {
	NextFunction,
	BaseCallback,
	AddonObject,
	Addon
} from "./types.ts";
import { runFlow } from "./runFlow.ts";

const isAddon = (addon: unknown) => typeof addon === "function" || (typeof addon === "object" && addon !== null && typeof (addon as Record<string, unknown>).run === "function");

/** A flow of addons. */
export class Flow<Callback extends BaseCallback> implements AddonObject<Callback> {

	/** The addons in this flow. */
	#addons = new Set<Addon<Callback>>();

	/**
	 * Initialize a new flow.
	 * @param addons Addons to add to the flow.
	 */
	public constructor(...addons: Addon<Callback>[]) {
		this.use(...addons);
	}

	/**
	 * Add addons to the flow.
	 * @param addons The addons to add.
	 */
	public use(...addons: Addon<Callback>[]): this {
		for (const addon of addons)
			if (isAddon(addon))
				this.#addons.add(addon);
		return this;
	}

	/**
	 * Remove addons to the flow.
	 * @param addons The addons to add.
	 */
	public unuse(...addons: Addon<Callback>[]): this {
		for (const addon of addons)
			if (isAddon(addon))
				this.#addons.delete(addon);
		return this;
	}

	/**
	 * Run the addons in this flow.
	 * @param args The arguments to pass to the addons. A next
	 *  function can also be added in the end of the arguments to
	 *  specify a custom next function.
	 */
	public async run(...args: [...args: Parameters<Callback>, next?: NextFunction]): Promise<void> {
		let customLastNext: undefined | NextFunction;
		const lastArg: NextFunction = args[args.length - 1] as NextFunction;
		if (lastArg && lastArg.isNextFunction === true) {
			customLastNext = lastArg;
			args.pop();
		}
		await runFlow({
			addons: [...this.#addons],
			args: args as unknown as Parameters<Callback>,
			customLastNext
		});
	}
}
