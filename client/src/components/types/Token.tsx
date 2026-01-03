/**
 * shown: whether the token is shown at the start
 * word: the word (or string) represented by this token
 * id: the id of the token
 * isHideable: whether the word can be hidden (e.g. "is", "the", etc.). Spaces and interstitials cannnot
 * 	be hidden
 * type:
 * 		"shown" (shown by default, and not hideable - used for interstitials)
 * 		"title" (word is in the title and cannot be force-revealed)
 * 		"regular" (any other word)
 * groupId: words with the same groupId will be revealed together, however they are discovered
 * placement: whether the word should be super or subscript (or neither)
 * bold: whether the word should be bolded
 * italic: whether the word should be in italics
 */

export type Token = {
	word: string;
	id: number | null;
	isHideable: boolean;
	isShowable: boolean;
	type: 'hidden' | 'title' | 'shown';
	groupId: number | null;
	placement: 'sub' | 'super' | 'none';
	bold: boolean;
	italic: boolean;
};
