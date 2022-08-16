import type { ChangeEvent, KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';

import type {
	FilterFn,
	GetComboBoxProps,
	GetInputProps,
	GetItemProps,
	GetLabelProps,
	GetMenuProps,
	GetToggleButtonProps,
	UseComboBoxArgs,
	UseComboBoxReturns,
} from './combhook.d';
import { getActiveItemId, getArgs, getItemId } from './helpers';

export type {
	FilterFn,
	GetComboBoxProps,
	GetInputProps,
	GetItemProps,
	GetLabelProps,
	GetMenuProps,
	GetToggleButtonProps,
	UseComboBoxArgs,
	UseComboBoxReturns,
};

export function useComboBox<T>(
	userArgs: UseComboBoxArgs<T>
): UseComboBoxReturns<T> {
	const args = getArgs(userArgs);
	const {
		items: initialItems,
		placeholder,
		onInputValueChange: customOnInputValueChange,
		onSelectedItemChange,
		filterFn,
	} = args;
	const [keyword, setKeyword] = useState<string>();
	const [items, setItems] = useState<T[]>(initialItems);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

	useEffect(() => {
		if (!keyword) return;

		filterFn(keyword, initialItems)
			.then((r) => setItems(r))
			.then(() => setIsOpen(true));
	}, [keyword]);

	const closeMenu = () => {
		setIsOpen(false);
		setKeyword(undefined);
		setItems(initialItems);
		setHighlightedIndex(-1);

		if (customOnInputValueChange) {
			customOnInputValueChange(undefined);
		}
	};

	const onInputValueChange = (ev: ChangeEvent<HTMLInputElement>) => {
		const { value } = ev.target;
		setKeyword(value);

		if (!value) {
			closeMenu();
		}

		if (customOnInputValueChange) {
			customOnInputValueChange(value);
		}
	};

	const getLabelProps: GetLabelProps = () => ({
		id: `${args.id}-label`,
		htmlFor: `${args.id}-input`,
	});

	const getComboBoxProps: GetComboBoxProps = () => ({
		'aria-expanded': isOpen,
		'aria-haspopup': 'listbox',
		'aria-owns': `${args.id}-menu`,
		role: 'combobox',
	});

	const getToggleButtonProps: GetToggleButtonProps = () => ({
		id: `${args.id}-toggle-button`,
		tabIndex: -1,
		type: 'button',
	});

	const getInputProps: GetInputProps = () => ({
		'aria-activedescendant': getActiveItemId(highlightedIndex, items, args),
		'aria-autocomplete': 'list',
		'aria-controls': `${args.id}-menu`,
		'aria-labelledby': `${args.id}-label`,
		autoComplete: 'off',
		id: `${args.id}-input`,
		onChange: onInputValueChange,
		onKeyDown: (ev: KeyboardEvent<HTMLInputElement>) => {
			if (/ArrowDown|ArrowUp/.test(ev.key)) {
				ev.preventDefault();
				const delta = ev.key === 'ArrowDown' ? 1 : -1;
				const newIndex = (highlightedIndex + delta) % items.length;
				setHighlightedIndex(newIndex);
			}

			if (ev.key === 'Enter') {
				const selectedIndex = highlightedIndex === -1 ? 0 : highlightedIndex;
				onSelectedItemChange(items[selectedIndex]);
				closeMenu();
			}

			if (ev.key === 'Escape') {
				closeMenu();
			}
		},
		placeholder,
		role: 'textbox',
		value: keyword || '',
	});

	const getMenuProps: GetMenuProps = () => ({
		'aria-labelledby': `${args.id}-label`,
		id: `${args.id}-menu`,
		role: 'listbox',
	});

	const getItemProps: GetItemProps<T> = ({ item, index }) => ({
		'aria-selected': index === highlightedIndex,
		id: getItemId(item, args),
		onClick: () => {
			closeMenu();
			onSelectedItemChange(item);
		},
		role: 'option',
	});

	return {
		closeMenu,
		getComboBoxProps,
		getInputProps,
		getItemProps,
		getLabelProps,
		getMenuProps,
		getToggleButtonProps,
		highlightedIndex,
		isOpen,
		items,
	};
}