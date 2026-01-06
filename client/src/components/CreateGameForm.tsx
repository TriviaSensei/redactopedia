import {
	useContext,
	useState,
	type ChangeEvent,
	type Dispatch,
	type MouseEventHandler,
	type SetStateAction,
} from 'react';
// import { CreatorStateContext } from '../contexts/CreatorStateContext';
import type { Token } from './types/Token';
import type { Round, Article } from './types/Round';
import { categories } from './util/categories';
// import type { RadioData } from './types/RadioData';
import { defaultWords } from './util/defaultWords';
import RadioGroup from './CreateGameForm/RadioGroup';
import LabelCheckBox from './CreateGameForm/LabelCheckBox';
import WordGroup from './CreateGameForm/WordGroup';
import WordToken from './WordToken';
import { PopUpMessageContext } from '../contexts/PopUpMessageContext';
import { CreatorStateContext } from '../contexts/CreatorStateContext';

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

export default function CreateGameForm(props: {
	setShow: Dispatch<SetStateAction<boolean>>;
}) {
	const { setShow } = props;
	const {
		creatorState,
		setCreatorState,
		selectedRound,
		setSelectedRound,
		article,
		setArticle,
	} = useContext(CreatorStateContext);
	const [canMoveRight, setCanMoveRight] = useState<boolean>(false);
	const [canMoveLeft, setCanMoveLeft] = useState<boolean>(false);
	const showMessage = useContext(PopUpMessageContext);

	const clearRound = () => {
		//clear the category
		const cs = document.querySelector('#category-select') as HTMLSelectElement;
		if (cs) cs.selectedIndex = 0;
		//clear the article
		if (setArticle)
			setArticle({
				title: '',
				type: 'regular',
				category: '',
				text: '',
				tokens: [],
				round: null,
				groups: [],
			});
	};
	const handleRoundSelect = (e: React.ChangeEvent) => {
		const tgt = e.currentTarget as HTMLSelectElement;
		if (!tgt) return;
		const val = Number(tgt.selectedIndex);
		if (isNaN(val)) return;
		setSelectedRound(val);
		if (val === 0) return clearRound();

		console.log(creatorState[val - 1]);
		setArticle({
			...creatorState[val - 1],
			round: val - 1,
		});
	};

	//handle the selected words in the word list area
	const handleBoxState = (e: ChangeEvent) => {
		const tgt: HTMLInputElement = e.currentTarget as HTMLInputElement;
		const side = tgt.closest('.side-panel');
		if (!side) return;
		//left side was changed
		if (side.getAttribute('id') === 'word-list') {
			//if we unchecked something, see if anything is still checked
			if (!tgt.checked) {
				const checkedItems = side.querySelectorAll(
					'input[type="checkbox"]:checked'
				).length;
				//if not, disable the >> button and return
				if (checkedItems === 0) return setCanMoveRight(false);
			}
			//enable the >> button if anything was checked (or if we checked something on the left)
			setCanMoveRight(true);
		}
	};

	//handle the selected boxes in existing groups
	const handleGroupState = (e: ChangeEvent) => {
		const tgt: HTMLInputElement = e.currentTarget as HTMLInputElement;
		const group = tgt.closest('.word-group');
		const side = tgt.closest('.side-panel');
		if (!group || !side) return;
		//get all checked boxes on the right side
		const allBoxes: Array<HTMLInputElement> = Array.from(
			side?.querySelectorAll('input[type="checkbox"]:checked'),
			(x) => x as HTMLInputElement
		);
		//if they're not part of the same group as the one we just checked, uncheck them
		//(i.e. only one group may have checked boxes at any time)
		allBoxes.forEach((b: HTMLInputElement) => {
			const p = b.closest('.word-group');
			if (p !== group) b.checked = false;
		});
		//if something on the right was checked/unchecked
		if (side.getAttribute('id') === 'group-list') {
			//if we unchecked something, see if anything is still checked
			if (!tgt.checked) {
				const checkedItems = side.querySelectorAll(
					'input[type="checkbox"]:checked'
				).length;
				//and if not, we disable the << button
				if (checkedItems === 0) return setCanMoveLeft(false);
			}
			//endable the << button otherwise
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

	const maxArticleLength = 2000;

	const openWikipediaPage = () => {
		const title: string | null = article.title;
		if (!title) return;
		window.open(`https://en.wikipedia.org/wiki/${title.split(' ').join('_')}`);
	};

	const populateSummary = async () => {
		const title: string | null = article.title;
		if (!title) return;
		const mode = import.meta.env.MODE;
		const url = mode === 'development' ? 'http://localhost:3000' : '';
		const req = new XMLHttpRequest();
		if (req.readyState === 0 || req.readyState === 4) {
			req.open('GET', `${url}/api/v1/${title.split(' ').join('%20')}`, true);
			req.onreadystatechange = () => {
				if (req.readyState == 4) {
					if (req.status === 200) {
						const result = JSON.parse(req.response);
						if (result && result.extract) {
							setArticle((prev: Article) => {
								return {
									...prev,
									text: result.extract,
									tokens: getPreview(result.extract),
								};
							});
						} else {
							console.log(result);
						}
					} else {
						console.log(req.response);
					}
				}
			};
			// req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
			try {
				req.send(null);
			} catch (err) {
				console.log(err);
			}
		}
	};

	// const re = /[A-Za-z\p{L}]+'s|[A-Za-z\p{L}]+|[0-9]+(th|st|nd|rd)?|\n/gu;
	const re = /[A-Za-z\p{L}]+|[0-9]+(th|st|nd|rd)?|'s|\n/gu;

	const getPreview = (str: string) => {
		if (!str) return [];
		const arr = Array.from(str.trim().matchAll(re), (x) => x);
		const tokens: Array<Token> = [];
		let currentIndex = 0;
		const title: string | null = article.title;
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

	const handleRoundType = (e: React.ChangeEvent) => {
		if (!article) return;
		const tgt = e.currentTarget as HTMLInputElement;
		const type = tgt.value as 'regular' | 'quick';
		if (type !== 'regular' && type !== 'quick') return;
		setArticle((prev) => {
			return {
				...prev,
				type,
			};
		});
	};

	const handleSaveRound = () => {
		if (!setCreatorState) return;
		//if we are adding a new round
		if (selectedRound === 0) {
			console.log('creating new round');
			setCreatorState((prev) => {
				return [...prev, article];
			});
			setSelectedRound(creatorState.length + 1);
		}
		//saving a previous round
		else {
			console.log('saving round');

			setCreatorState((prev) => {
				return prev.map((rd, i) => {
					if (selectedRound === i + 1) return article;
					return rd;
				});
			});
		}
		showMessage('info', 'Round saved!', 1500);
	};

	const handleChangeCategory = (e: React.ChangeEvent) => {
		const tgt = e.currentTarget as HTMLSelectElement;
		const val = tgt.value;
		if (val !== '' && !categories.includes(val)) return;
		setArticle((prev) => {
			return {
				...prev,
				category: val,
			};
		});
	};

	const handleMoveRound: MouseEventHandler<HTMLButtonElement> = (e) => {
		const tgt = e.currentTarget as HTMLButtonElement;
		if (!tgt) return;
		if (tgt.id === 'move-round-down') {
			if (selectedRound === creatorState.length || selectedRound === 0)
				return showMessage('error', 'Cannot move round', 1500);
			setCreatorState((prev) => {
				const newState = [...prev];
				[newState[selectedRound - 1], newState[selectedRound]] = [
					newState[selectedRound],
					newState[selectedRound - 1],
				];
				return newState;
			});
			setSelectedRound((prev) => prev + 1);
			setArticle({ ...creatorState[selectedRound], round: selectedRound });
		} else if (tgt.id === 'move-round-up') {
			if (selectedRound <= 1)
				return showMessage('error', 'Cannot move round', 1500);
			setCreatorState((prev) => {
				const newState = [...prev];
				[newState[selectedRound - 2], newState[selectedRound - 1]] = [
					newState[selectedRound - 1],
					newState[selectedRound - 2],
				];
				return newState;
			});
			setSelectedRound((prev) => prev - 1);
			setArticle({ ...creatorState[selectedRound], round: selectedRound });
			console.log(article);
		}
	};

	return (
		<div
			id="create-game-form"
			className="d-flex flex-column align-items-stretch m-auto w-75 position-relative"
		>
			<div className="form-top">
				{/* select round */}

				<div className="input-container">
					<div className="input-label">Select round</div>
					<select
						id="creator-round-select"
						className="w-100"
						onChange={handleRoundSelect}
						value={`${selectedRound || 0}`}
					>
						<option value="0">[Add new]</option>
						{(creatorState || []).map((r: Round, i: number) => {
							return (
								<option key={i} value={i + 1}>
									{`${i + 1}. ${r.title}${r.type === 'quick' ? ' 🏃💨' : ''}`}
								</option>
							);
						})}
					</select>
				</div>
				<div className="d-flex flex-row mb-2">
					<button
						role="button"
						className="btn btn-primary w-100 mb-4 me-2"
						id="move-round-up"
						disabled={selectedRound <= 1}
						onClick={handleMoveRound}
					>
						Move Round ▲
					</button>
					<button
						role="button"
						className="btn btn-primary w-100 mb-4"
						id="move-round-down"
						disabled={
							selectedRound === 0 || selectedRound === creatorState.length
						}
						onClick={handleMoveRound}
					>
						Move Round ▼
					</button>
				</div>
				<div className="d-flex flex-row mb-2">
					<button
						role="button"
						className="btn btn-primary w-100 mb-4 me-2"
						disabled={
							!article?.title ||
							article.title.trim() === '' ||
							article.text.trim() === ''
						}
						onClick={handleSaveRound}
					>
						Save Round
					</button>
					<button
						role="button"
						className="btn btn-danger w-100 mb-4"
						onClick={() => {
							setShow(true);
						}}
					>
						{selectedRound === 0 ? 'Clear Round' : 'Delete Round'}
					</button>
				</div>
			</div>

			<div className="input-container">
				<div className="input-label">Category</div>
				<select
					name="category"
					id="category-select"
					className="w-100"
					onChange={handleChangeCategory}
					value={article.category}
				>
					<option value="0">[Select a category]</option>
					{categories.map((c, i) => {
						return (
							<option key={i} value={c}>
								{c}
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
			{/* round type */}
			<div className="input-container">
				<div className="input-label">Round Type</div>
				<RadioGroup
					label=""
					name={'round-type'}
					forceCheck={true}
					options={[
						{
							id: 'round-regular',
							value: 'regular',
							label: 'Regular',
							checked: article.type === 'regular',
							disabled: article === null,
						},
						{
							id: 'round-quick',
							value: 'quick',
							label: 'Quick',
							checked: article.type === 'quick',
							disabled: article === null,
						},
					]}
					onChange={handleRoundType}
				/>
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
					<span>
						{article?.text
							? `(${article.text.length}/${maxArticleLength}) chars used`
							: ''}
					</span>
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
				<div className="input-label">
					{article?.text
						? `Preview: ${
								article.text.length > 0
									? `${
											article.title.length +
											article.tokens.reduce((p, c) => {
												if (c.type === 'hidden') return p + c.word.length;
												return p;
											}, 0)
									  } possible points`
									: ''
						  }`
						: ''}
				</div>
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
					{article?.tokens
						? article.tokens.map((el, i) => {
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
						  })
						: ''}
				</div>
			</div>
			{/* word formatting */}
			<div
				className={`word-container align-items-start${
					!article?.text || article.text.trim().length === 0 ? ' d-none' : ''
				}`}
			>
				<h3>{loadedWord ? loadedWord.word : `No word selected`}</h3>
				<div className="input-container">
					<div className="input-label">State</div>
					<RadioGroup
						label={''}
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
									!loadedWord ||
									!loadedWord.isHideable ||
									!loadedWord.isShowable,
							},
						]}
						onChange={handleChangeHidden}
					/>
				</div>

				<div className="input-container">
					<div className="input-label">Format: Bold/Italic</div>
					<RadioGroup
						label={''}
						name={'formatting'}
						forceCheck={false}
						options={[
							{
								id: 'format-none',
								value: 'none',
								label: 'N/A',
								checked:
									loadedWord !== null && !loadedWord.bold && !loadedWord.italic,
								disabled: !loadedWord,
							},
							{
								id: 'format-bold',
								value: 'bold',
								label: 'B',
								className: 'fw-bold',
								checked:
									loadedWord !== null && loadedWord.bold && !loadedWord.italic,
								disabled: !loadedWord,
							},
							{
								id: 'format-italic',
								value: 'italic',
								label: 'I',
								className: 'fst-italic',
								checked:
									loadedWord !== null && !loadedWord.bold && loadedWord.italic,
								disabled: !loadedWord,
							},
							{
								id: 'format-both',
								value: 'bold-italic',
								label: 'BI',
								className: 'fw-bold fst-italic',
								checked:
									loadedWord !== null && loadedWord.bold && loadedWord.italic,
								disabled: !loadedWord,
							},
						]}
						onChange={handleChangeFormatting}
					/>
				</div>

				<div className="input-container">
					<div className="input-label">Format: Placement</div>
					<RadioGroup
						label={''}
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
								checked:
									loadedWord !== null && loadedWord.placement === 'super',
								disabled: !loadedWord,
							},
						]}
						onChange={handleChangePlacement}
					/>
				</div>

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
			<div
				className={`d-flex flex-column${
					!article?.text || article.text.trim().length === 0 ? ' d-none' : ''
				}`}
			>
				<div className="fw-bold text-start">Groupings</div>
				<div className="group-container">
					<div className="d-flex flex-column f-1">
						<div className="fw-semibold">Ungrouped words</div>
						<div id="word-list" className="word-list side-panel">
							{article?.tokens?.length > 0
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
									const tokens = article?.tokens
										? article.tokens
												.map((t) => {
													return { ...t };
												})
												.filter((t) => t.type === 'title')
												.sort((a, b) =>
													a.word
														.toLowerCase()
														.localeCompare(b.word.toLowerCase())
												)
										: [];

									return tokens
										.filter((t, i) => {
											return (
												i === 0 ||
												t.word.toLowerCase() !==
													tokens[i - 1].word.toLowerCase()
											);
										})
										.sort((a, b) =>
											a.word.toLowerCase().localeCompare(b.word.toLowerCase())
										)
										.map((t) => t.word.toLowerCase());
								})()}
								groupId={0}
							/>
							{article?.groups
								? article.groups.map((g, i) => {
										return (
											<WordGroup
												words={g.words}
												key={i}
												groupId={g.id}
												onChange={handleGroupState}
											/>
										);
								  })
								: ''}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
