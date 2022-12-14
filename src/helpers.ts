import type {
	IFilterFn,
	IItemToStringFn,
	IUseComboBoxArgs,
} from "./use-combo-box";

export function slugify(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export const defaultFilterFn: IFilterFn<unknown> = async (
	keyword,
	items = []
) => {
	const rg = new RegExp(keyword, "i");
	// eslint-disable-next-line dot-notation
	return items.filter((item) => item && rg.test(String(item)));
};

export function getItemId<T>(item: T, args: IUseComboBoxArgs<T>) {
	const { id, itemToString } = args;
	let itemKey = "";
	if (itemToString) {
		itemKey = itemToString(item);
	}
	itemKey = slugify(itemKey || JSON.stringify(item));

	return `${id}-option-${itemKey}`;
}

export function getActiveItemId<T>(
	highlightedIndex: number,
	items: T[],
	args: IUseComboBoxArgs<T>
) {
	const activeItem = items[highlightedIndex];
	if (!activeItem) return undefined;
	return getItemId<T>(activeItem, args);
}

interface GetArgsReturns<T>
	extends Omit<IUseComboBoxArgs<T>, "itemToString" | "items" | "filterFn"> {
	itemToString: IItemToStringFn<T>;
	items: T[];
	filterFn: IFilterFn<T>;
}

export function getArgs<T>(userArgs: IUseComboBoxArgs<T>): GetArgsReturns<T> {
	const defaultItemToString: IItemToStringFn<T> = (item) =>
		item ? JSON.stringify(item) : "";

	const {
		itemToString = defaultItemToString,
		items = [],
		filterFn = defaultFilterFn as IFilterFn<T>,
	} = userArgs;

	return { ...userArgs, filterFn, items, itemToString };
}
