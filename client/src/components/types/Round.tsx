import type { Token } from './Token';
import type { Group } from './Group';
export type Round = {
	title: string;
	type: 'regular' | 'quick';
	tokens: Array<Token>;
	text: string;
	groups: Array<Group>;
};
