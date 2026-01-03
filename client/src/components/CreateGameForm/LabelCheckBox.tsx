type LabelCheckBoxData = {
	label: string;
	labelClass?: string | null;
	id: string;
	value: string;
	onChange?: (e: ChangeEvent) => void;
};

import { type ChangeEvent } from 'react';
export default function LabelCheckBox(props: LabelCheckBoxData) {
	return (
		<div className="label-check-box">
			<input
				data-test={JSON.stringify(props)}
				type="checkbox"
				id={props.id}
				value={props.value}
				onChange={props.onChange ? props.onChange : () => {}}
			></input>
			<label htmlFor={props.id} className={props.labelClass || ''}>
				{props.label}
			</label>
		</div>
	);
}
