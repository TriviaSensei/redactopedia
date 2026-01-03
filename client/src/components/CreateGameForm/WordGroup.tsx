import type { ChangeEvent } from 'react';
import LabelCheckBox from './LabelCheckBox';
type WordGroup = {
	onChange?: (e: ChangeEvent) => void | null;
	words: Array<string>;
	groupId: number | null;
};
export default function WordGroup(props: WordGroup) {
	return (
		<div
			className="word-group"
			data-id={props.groupId !== null ? props.groupId : ''}
		>
			{props.words.map((w, i) => {
				if (props.groupId === null || props.groupId === 0)
					return <div key={i}>{w.toLowerCase()}</div>;
				return (
					<LabelCheckBox
						label={w.toLowerCase()}
						id={`ungroup-${w.toLowerCase()}`}
						value={w.toLowerCase()}
						onChange={props.onChange || (() => {})}
						key={i}
					/>
				);
			})}
		</div>
	);
}
