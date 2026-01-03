import { useContext, useState, type ChangeEvent } from 'react';
import { CreatorStateContext } from '../contexts/CreatorStateContext';
import type { Token } from './types/Token';
import type { Round } from './types/Round';

// import type { RadioData } from './types/RadioData';
const defaultWords = [
	'a',
	'the',
	'an',
	'for',
	'and',
	'nor',
	'but',
	'so',
	'by',
	'is',
	'was',
	'it',
	"it's",
	'its',
	'their',
	'he',
	'she',
	'they',
	'their',
	"they're",
	'are',
	'or',
	'of',
	'on',
	'to',
	'as',
	'with',
	'without',
	'in',
	"'s",
];
import axios from 'axios';
import RadioGroup from './CreateGameForm/RadioGroup';
import LabelCheckBox from './CreateGameForm/LabelCheckBox';
import WordGroup from './CreateGameForm/WordGroup';
import WordToken from './WordToken';

/*
Round object: 
{
    title: "Tom Hanks",
    type: 'regular' or 'quick'
    text: [
        {
            word: 'Thomas', (not sent to clients if hidden)
            id: number,
            length: number
            groupId: number (not sent to clients),
            shown: false,
        },
    ],
    groups: [
        {
            groupId: uuidv4,
            type: 'title' or 'hidden' (whether one of the words in the group is contained in the title),
            words: [
                uuidv4
            ]    
        }
    ]

}
*/

export default function CreateGameForm() {
	const { creatorState } = useContext(CreatorStateContext);
	const [canMoveRight, setCanMoveRight] = useState<boolean>(false);
	const [canMoveLeft, setCanMoveLeft] = useState<boolean>(false);

	const handleBoxState = (e: ChangeEvent) => {
		const tgt: HTMLInputElement = e.currentTarget as HTMLInputElement;
		const side = tgt.closest('.side-panel');
		if (!side) return;
		//left side was changed
		if (side.getAttribute('id') === 'word-list') {
			if (!tgt.checked) {
				const checkedItems = side.querySelectorAll(
					'input[type="checkbox"]:checked'
				).length;
				if (checkedItems === 0) return setCanMoveRight(false);
			}
			setCanMoveRight(true);
		}
	};

	type Article = Round & { round: number | null };

	//
	const handleGroupState = (e: ChangeEvent) => {
		const tgt: HTMLInputElement = e.currentTarget as HTMLInputElement;
		const group = tgt.closest('.word-group');
		const side = tgt.closest('.side-panel');
		if (!group || !side) return;
		const allBoxes: Array<HTMLInputElement> = Array.from(
			side?.querySelectorAll('input[type="checkbox"]:checked'),
			(x) => x as HTMLInputElement
		);
		allBoxes.forEach((b: HTMLInputElement) => {
			const p = b.closest('.word-group');
			if (p !== group) b.checked = false;
		});
		if (side.getAttribute('id') === 'group-list') {
			if (!tgt.checked) {
				const checkedItems = side.querySelectorAll(
					'input[type="checkbox"]:checked'
				).length;
				if (checkedItems === 0) return setCanMoveLeft(false);
			}
			setCanMoveLeft(true);
		}
	};

	const handleGroupWords = () => {
		const selectedBoxes = Array.from(
			document.querySelectorAll('#word-list input[type="checkbox"]:checked'),
			(x) => x as HTMLInputElement
		);
		const selectedWords = selectedBoxes.map((el) => Number(el.value));
		const words = selectedWords.map((el) => {
			return article.tokens[el].word.toLowerCase();
		});
		const selectedGroup = document.querySelector(
			'.group-list .word-group:has(input[type="checkbox"]:checked)'
		);

		if (selectedWords.length === 0) return;
		else if (selectedWords.length === 1 && !selectedGroup) return;

		let groupId: number;
		const tfn = (t: Token) => {
			if (words.includes(t.word.toLowerCase()))
				return {
					...t,
					groupId,
				};
			return t;
		};

		//add words to an existing group
		if (selectedGroup) {
			groupId = Number(selectedGroup.getAttribute('data-id'));
			setArticle((prev: Article) => {
				return {
					...prev,
					tokens: prev.tokens.map(tfn),
					groups: prev.groups.map((g) => {
						if (g.id !== groupId) return g;
						return {
							...g,
							words: [...g.words, ...words],
						};
					}),
				};
			});
		}
		//create a new group (other than title words)
		else {
			groupId =
				article.groups.length === 0
					? 1
					: article.groups[article.groups.length - 1].id + 1;
			setArticle((prev: Article) => {
				return {
					...prev,
					tokens: prev.tokens.map(tfn),
					groups: [...prev.groups, { id: groupId, words }],
				};
			});
		}

		selectedBoxes.forEach((el) => (el.checked = false));
		setCanMoveRight(false);
	};
	const handleUngroupWords = () => {
		const selectedBoxes = Array.from(
			document.querySelectorAll('.group-list input[type="checkbox"]:checked'),
			(x) => x as HTMLInputElement
		);
		const words = selectedBoxes.map(
			(el) => el.getAttribute('value')?.toLowerCase() || ''
		);
		const selectedGroup = document.querySelector(
			'.group-list .word-group:has(input[type="checkbox"]:checked)'
		);

		if (words.length === 0 || !selectedGroup) return;

		console.log(selectedGroup);

		//actual group in the data
		const groupId = Number(selectedGroup.getAttribute('data-id'));
		const group = article.groups.find((g) => g.id === groupId);
		if (!group) return;

		setArticle((prev: Article) => {
			const newWordList = group.words.filter(
				(w) => !words.includes(w.toLowerCase())
			);
			return {
				...prev,
				tokens:
					newWordList.length > 1
						? prev.tokens.map((t) => {
								if (words.includes(t.word.toLowerCase()))
									return {
										...t,
										groupId: null,
									};
								return t;
						  })
						: prev.tokens.map((t) => {
								if (t.groupId === groupId)
									return {
										...t,
										groupId: null,
									};
								return t;
						  }),
				groups:
					newWordList.length > 1
						? prev.groups.map((g) => {
								if (g.id === groupId)
									return {
										...g,
										words: newWordList,
									};
								return g;
						  })
						: prev.groups.filter((g) => g.id !== groupId),
			};
		});
	};

	const [article, setArticle] = useState<Article>({
		title: '',
		type: 'regular',
		text: '',
		tokens: [],
		round: null,
		groups: [],
	});
	const maxArticleLength = 2000;

	const getTitle = () => {
		const t: HTMLInputElement | null = document.querySelector('#round-title');
		if (!t || !t.value) return null;
		return t.value;
	};

	const openWikipediaPage = () => {
		const title: string | null = getTitle();
		if (!title) return;
		window.open(`https://en.wikipedia.org/wiki/${title.split(' ').join('_')}`);
	};

	const populateSummary = async () => {
		const title: string | null = getTitle();
		if (!title) return;
		const result = await axios.get(
			`https://en.wikipedia.org/api/rest_v1/page/summary/${title
				.split(' ')
				.join('%20')}`
		);
		if (!result || !result.data?.extract) return;
		setArticle((prev: Article) => {
			return {
				...prev,
				text: result.data.extract,
				tokens: getPreview(result.data.extract),
			};
		});
	};

	// const re = /[A-Za-z\p{L}]+'s|[A-Za-z\p{L}]+|[0-9]+(th|st|nd|rd)?|\n/gu;
	const re = /[A-Za-z\p{L}]+|[0-9]+(th|st|nd|rd)?|'s|\n/gu;

	const getPreview = (str: string) => {
		const arr = Array.from(str.trim().matchAll(re), (x) => x);
		const tokens: Array<Token> = [];
		let currentIndex = 0;
		const title: string | null = getTitle();
		if (!title) return [];
		const titleWords = title.toLowerCase().split(' ');
		arr.forEach((el) => {
			//interstitial content between words (e.g. spaces) cannot be hidden or guessed
			if (el.index > currentIndex)
				tokens.push({
					word: str.substring(currentIndex, el.index),
					id: null,
					isHideable: false,
					isShowable: true,
					type: 'shown',
					groupId: null,
					placement: 'none',
					bold: false,
					italic: false,
				});

			//as long as it's not a new line, we should be able to hide a word otherwise (even a default shown word)
			const isHideable = el[0] !== '\n';
			const isShowable = !titleWords.includes(el[0].toLowerCase());
			const group = article.groups.find((grp) =>
				grp.words.includes(el[0].toLowerCase())
			);
			const groupId = group ? group.id : null;

			tokens.push({
				word: el[0],
				id: isHideable ? tokens.length : null,
				isHideable,
				isShowable,
				type: !isShowable
					? 'title'
					: defaultWords.includes(el[0].toLowerCase()) || !isHideable
					? 'shown'
					: 'hidden',
				groupId,
				placement: 'none',
				bold: false,
				italic: false,
			});
			currentIndex = el.index + el[0].length;
		});
		if (currentIndex < str.length)
			tokens.push({
				word: str.substring(currentIndex),
				id: null,
				isHideable: false,
				isShowable: true,
				type: 'shown',
				groupId: null,
				placement: 'none',
				bold: false,
				italic: false,
			});
		return tokens;
	};

	const checkGroupMatch = (a: Token | null, b: Token | null) => {
		if (!a || !b) return false;
		return a.word.toLowerCase() === b.word.toLowerCase();
	};

	const [loadedWord, setLoadedWord] = useState<Token | null>(null);

	const [selectedRound, setSelectedRound] = useState(0);
	const handleRoundSelect = (e: React.ChangeEvent) => {
		const tgt = e.currentTarget as HTMLSelectElement;
		if (!tgt) return;
		const val = Number(tgt.selectedIndex);
		if (isNaN(val)) return;
		setSelectedRound(val);
	};
	const handleChangeHidden = (e: React.ChangeEvent) => {
		if (!loadedWord) return;
		const tgt = e.currentTarget as HTMLInputElement;
		const type = tgt.value as 'hidden' | 'shown' | 'title';
		if ((type === 'hidden' || type === 'title') && !loadedWord.isHideable)
			return;
		setLoadedWord((prev) => {
			if (!prev) return null;
			return {
				...prev,
				type,
			};
		});
		setArticle((prev) => {
			return {
				...prev,
				tokens: prev.tokens.map((t, i) => {
					if (
						i === loadedWord.id ||
						t.word.toLowerCase() === loadedWord.word.toLowerCase()
					) {
						return {
							...t,
							type,
						};
					}
					return t;
				}),
			};
		});
	};
	const handleChangeFormatting = (e: React.ChangeEvent) => {
		const val = (e.currentTarget as HTMLInputElement).value;
		const bold = val === 'bold' || val === 'bold-italic';
		const italic = val === 'italic' || val === 'bold-italic';
		setLoadedWord((prev) => {
			if (!prev) return null;
			return {
				...prev,
				bold,
				italic,
			};
		});
		setArticle((prev) => {
			return {
				...prev,
				tokens: prev.tokens.map((t, i) => {
					if (i === loadedWord?.id)
						return {
							...t,
							bold,
							italic,
						};
					return t;
				}),
			};
		});
	};

	const handleChangePlacement = (e: React.ChangeEvent) => {
		const placement = (e.currentTarget as HTMLInputElement).value as
			| 'sub'
			| 'super'
			| 'none';
		if (!['none', 'super', 'sub'].includes(placement)) return;
		setLoadedWord((prev) => {
			if (!prev) return null;
			return {
				...prev,
				placement,
			};
		});
		setArticle((prev) => {
			return {
				...prev,
				tokens: prev.tokens.map((t, i) => {
					if (i === loadedWord?.id) {
						return {
							...t,
							placement,
						};
					}
					return t;
				}),
			};
		});
	};

	const applyFormattingToAll = () => {
		const placement = (
			document.querySelector('[name="placement"]:checked') as HTMLInputElement
		)?.value as 'sub' | 'super' | 'none';
		if (!placement || !['none', 'super', 'sub'].includes(placement)) return;
		const formatting = (
			document.querySelector('[name="formatting"]:checked') as HTMLInputElement
		)?.value;
		if (!formatting) return;
		const bold = formatting === 'bold' || formatting === 'bold-italic';
		const italic = formatting === 'italic' || formatting === 'bold-italic';

		setLoadedWord((prev) => {
			if (!prev) return null;
			return {
				...prev,
				bold,
				italic,
				placement,
			};
		});
		setArticle((prev) => {
			return {
				...prev,
				tokens: prev.tokens.map((t, i) => {
					if (
						i === loadedWord?.id ||
						loadedWord?.word.toLowerCase() === t.word.toLowerCase()
					) {
						return {
							...t,
							placement,
							bold,
							italic,
						};
					}
					return t;
				}),
			};
		});
	};

	return (
		<form
			id="create-game-form"
			className="m-auto w-75"
			onSubmit={(e) => e.preventDefault()}
		>
			{/* select round */}
			<div className="input-container">
				<div className="input-label">Select round</div>
				<select
					id="creator-round-select"
					className="w-100"
					onChange={handleRoundSelect}
				>
					<option value="0">[Add new]</option>
					{(creatorState || []).map((r: Round, i: number) => {
						return (
							<option key={i} value={i + 1} selected={selectedRound === i + 1}>
								{r.title}
							</option>
						);
					})}
				</select>
			</div>
			{/* Title of article */}
			<div className="input-container">
				<div className="input-label">Title</div>
				<input
					type="text"
					value={article.title}
					onChange={(e) =>
						setArticle((prev) => {
							return {
								...prev,
								title: e.target.value,
							};
						})
					}
					id={'round-title'}
					name={'round-title'}
					maxLength={50}
				></input>
			</div>
			{/* buttons to open Wikipedia or populate the summary */}
			<div className="d-flex flex-row w-100 mb-3">
				<button
					className={'btn btn-primary f-1 me-2'}
					type="button"
					onClick={openWikipediaPage}
				>
					Open Wikipedia
				</button>
				<button
					className={'btn btn-warning f-1'}
					type="button"
					onClick={populateSummary}
				>
					Populate Summary
				</button>
			</div>
			{/* Text area for article text */}
			<div className="input-container">
				<div className="input-label">
					Text{' '}
					<span>{`(${article.text.length}/${maxArticleLength}) chars used`}</span>
				</div>
				<textarea
					className="w-100"
					rows={10}
					maxLength={maxArticleLength}
					value={article.text}
					onChange={(e) =>
						setArticle((prev: Article) => {
							return {
								...prev,
								text: e.target.value,
								tokens: getPreview(e.target.value),
							};
						})
					}
				></textarea>
			</div>
			{/* article preview */}
			<div className="input-container">
				{/* Article title */}
				<div className="input-label">{`Preview: ${
					article.text.length > 0
						? `${
								article.title.length +
								article.tokens.reduce((p, c) => {
									if (c.type === 'hidden') return p + c.word.length;
									return p;
								}, 0)
						  } possible points`
						: ''
				}`}</div>
				<h2 className="text-preview title-preview fw-semibold">
					{getPreview(article.title).map((t, i) => {
						return (
							<WordToken
								token={t}
								loadedWord={
									loadedWord?.word.toLowerCase() === t.word.toLowerCase()
								}
								highlighted={checkGroupMatch(loadedWord, t)}
								onClick={() => {}}
								key={i}
							/>
						);
					})}
				</h2>
				{/* article text with highlighted words */}
				<div className="text-preview">
					{article.tokens.map((el, i) => {
						const clickFn = el.isHideable
							? () => {
									if (loadedWord?.id === el.id) setLoadedWord(null);
									else setLoadedWord(el);
							  }
							: () => {};
						const isLoaded = el.id === loadedWord?.id;
						const isHighlighted = checkGroupMatch(el, loadedWord);
						return (
							<WordToken
								token={el}
								loadedWord={isLoaded}
								highlighted={isHighlighted}
								onClick={clickFn}
								key={i}
							/>
						);
					})}
				</div>
			</div>
			{/* article text preview with hidden words highlighted */}
			<div className={`word-container align-items-start`}>
				<h3>{loadedWord ? loadedWord.word : `No word loaded`}</h3>
				<RadioGroup
					label={'State'}
					name={'hidden'}
					forceCheck={false}
					options={[
						{
							id: 'word-title',
							value: 'title',
							label: 'Title',
							checked: loadedWord ? loadedWord.type === 'title' : false,
							disabled: loadedWord === null || !loadedWord.isHideable,
						},

						{
							id: 'word-hidden',
							value: 'hidden',
							label: 'Hidden',
							checked: loadedWord ? loadedWord.type === 'hidden' : false,
							disabled:
								loadedWord === null ||
								!loadedWord.isHideable ||
								!loadedWord.isShowable,
						},
						{
							id: 'word-shown',
							value: 'shown',
							label: 'Shown',
							checked: loadedWord ? loadedWord.type === 'shown' : false,
							disabled:
								!loadedWord || !loadedWord.isHideable || !loadedWord.isShowable,
						},
					]}
					onChange={handleChangeHidden}
				/>
				<div className={'input-label'}>Formatting</div>
				<RadioGroup
					label={'Bold/Italic'}
					name={'formatting'}
					forceCheck={false}
					options={[
						{
							id: 'format-none',
							value: 'none',
							label: 'Neither',
							checked:
								loadedWord !== null && !loadedWord.bold && !loadedWord.italic,
							disabled: !loadedWord,
						},
						{
							id: 'format-bold',
							value: 'bold',
							label: 'Bold',
							className: 'fw-bold',
							checked:
								loadedWord !== null && loadedWord.bold && !loadedWord.italic,
							disabled: !loadedWord,
						},
						{
							id: 'format-italic',
							value: 'italic',
							label: 'Italic',
							className: 'fst-italic',
							checked:
								loadedWord !== null && !loadedWord.bold && loadedWord.italic,
							disabled: !loadedWord,
						},
						{
							id: 'format-both',
							value: 'bold-italic',
							label: 'Both',
							className: 'fw-bold fst-italic',
							checked:
								loadedWord !== null && loadedWord.bold && loadedWord.italic,
							disabled: !loadedWord,
						},
					]}
					onChange={handleChangeFormatting}
				/>
				<RadioGroup
					label={'Placement'}
					name="placement"
					options={[
						{
							id: 'loc-subscript',
							value: 'sub',
							label: 'Subscript',
							checked: loadedWord !== null && loadedWord.placement === 'sub',
							disabled: !loadedWord,
						},
						{
							id: 'loc-none',
							value: 'none',
							label: 'Normal',
							checked: loadedWord === null || loadedWord.placement === 'none',
							disabled: !loadedWord,
						},
						{
							id: 'loc-superscript',
							value: 'super',
							label: 'Superscript',
							checked: loadedWord !== null && loadedWord.placement === 'super',
							disabled: !loadedWord,
						},
					]}
					onChange={handleChangePlacement}
				/>
				{/* Format all occurrences button */}
				<div className="d-flex flex-row w-100">
					<button
						className="btn btn-primary m-auto mb-2"
						onClick={applyFormattingToAll}
						disabled={loadedWord === null}
					>
						Apply formatting to all occurrences
					</button>
				</div>
			</div>
			{/* word groupings */}
			<div className="fw-bold text-start">Groupings</div>
			<div className="group-container">
				<div className="d-flex flex-column f-1">
					<div className="fw-semibold">Ungrouped words</div>
					<div id="word-list" className="word-list side-panel">
						{article.tokens.length > 0
							? (() => {
									const tokens = article.tokens
										.map((t) => {
											return { ...t };
										})
										.filter((t) => !t.groupId)
										.sort((a, b) =>
											a.word.toLowerCase().localeCompare(b.word.toLowerCase())
										);
									const uniqueTokens = tokens.filter((t, i) => {
										return (
											t.type === 'hidden' &&
											(i === 0 ||
												t.word.toLowerCase() !==
													tokens[i - 1].word.toLowerCase())
										);
									});
									return uniqueTokens.map((t, i) => {
										return (
											<LabelCheckBox
												key={i}
												label={t.word}
												value={t.id?.toString() || ''}
												id={`check-${t.id || i}`}
												labelClass="token-label"
												onChange={handleBoxState}
											/>
										);
									});
							  })()
							: 'No words detected'}
					</div>
				</div>
				<div className="button-panel">
					<div className="d-flex flex-column m-auto mx-1">
						<button
							className="btn btn-primary my-1 move-right"
							disabled={!canMoveRight}
							onClick={handleGroupWords}
						>
							{'▶'}
						</button>
						<button
							className="btn btn-primary my-1 move-left"
							disabled={!canMoveLeft}
							onClick={handleUngroupWords}
						>
							{'◀'}
						</button>
					</div>
				</div>
				<div className="d-flex flex-column f-1">
					<div className="fw-semibold">Groups</div>
					<div id="group-list" className="group-list side-panel">
						<WordGroup
							words={(() => {
								const tokens = article.tokens
									.map((t) => {
										return { ...t };
									})
									.filter((t) => t.type === 'title')
									.sort((a, b) =>
										a.word.toLowerCase().localeCompare(b.word.toLowerCase())
									);

								return tokens
									.filter((t, i) => {
										return (
											i === 0 ||
											t.word.toLowerCase() !== tokens[i - 1].word.toLowerCase()
										);
									})
									.sort((a, b) =>
										a.word.toLowerCase().localeCompare(b.word.toLowerCase())
									)
									.map((t) => t.word.toLowerCase());
							})()}
							groupId={0}
						/>
						{article.groups.map((g, i) => {
							return (
								<WordGroup
									words={g.words}
									key={i}
									groupId={g.id}
									onChange={handleGroupState}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</form>
	);
}
