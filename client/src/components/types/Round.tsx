import type { Token } from './Token';
import type { Group } from './Group';
import { categories } from '../util/categories';

type Category = (typeof categories)[number];
export type Round = {
	title: string;
	type: 'regular' | 'quick';
	category: Category;
	tokens: Array<Token>;
	text: string;
	groups: Array<Group>;
};

export type Article = Round & { round: number | null };
