export type Message = {
	shown: boolean;
	status: 'info' | 'error' | 'warning' | '';
	message: string;
};
