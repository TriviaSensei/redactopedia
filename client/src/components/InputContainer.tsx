type Params = {
	inputLabel: string;
	id: string;
	name: string;
	maxLength: number | null;
};

import { useState } from 'react';

export default function InputContainer(props: Params) {
	const [value, setValue] = useState('');
	return (
		<div className="input-container">
			<div className="input-label">{`${props.inputLabel}:`}</div>
			<input
				type="text"
				name={props.name}
				id={props.id}
				maxLength={props.maxLength || 1000}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			></input>
		</div>
	);
}
