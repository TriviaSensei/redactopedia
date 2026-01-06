import { createContext } from 'react';

export const PopUpMessageContext = createContext<
	(
		status: 'info' | 'error' | 'warning' | '',
		message: string,
		duration?: number | null
	) => void
>(
	(
		status: 'info' | 'error' | 'warning' | '',
		message: string,
		duration?: number | null
	) => {
		console.log(status, message, duration);
	}
);
