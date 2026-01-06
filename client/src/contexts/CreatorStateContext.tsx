import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { Round, Article } from '../components/types/Round';

type myType = {
	creatorState: Array<Round>;
	// setCreatorState: ((prev: Array<Round>) => Array<Round>) | null;
	setCreatorState: Dispatch<SetStateAction<Array<Round>>> | (() => void);
	selectedRound: number;
	setSelectedRound: Dispatch<SetStateAction<number>> | (() => void);
	article: Article;
	setArticle: Dispatch<SetStateAction<Article>> | (() => void);
};

export const CreatorStateContext = createContext<myType>({
	creatorState: [],
	setCreatorState: () => {},
	selectedRound: 0,
	setSelectedRound: () => {},
	article: {
		title: '',
		type: 'regular',
		category: '',
		text: '',
		tokens: [],
		round: null,
		groups: [],
	},
	setArticle: () => {},
});
