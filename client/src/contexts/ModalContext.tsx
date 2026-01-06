import { createContext } from 'react';

type myType = {
	show: boolean;
	setShow: ((s: boolean) => void) | null;
};

export const ModalContext = createContext<myType>({
	show: false,
	setShow: null,
});
