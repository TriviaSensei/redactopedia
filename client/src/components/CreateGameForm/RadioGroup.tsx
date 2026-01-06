import type { RadioData } from '../types/RadioData';
type RadioInputGroup = {
	label: string | null;
	labelClass?: string | null;
	name: string;
	forceCheck?: boolean | null;
	options: Array<RadioData>;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
};
export default function RadioGroup(props: RadioInputGroup) {
	return (
		<div className="d-flex flex-row w-100 mb-2">
			{props.label ? (
				<div
					className={`m-auto me-2 f-1 text-start ${props.labelClass || ''}`}
				>{`${props.label}: `}</div>
			) : (
				''
			)}

			{props.options.map((el, i) => {
				return (
					<div key={i}>
						<input
							type="radio"
							name={props.name}
							id={el.id}
							value={el.value}
							checked={!el.disabled && el.checked}
							disabled={el.disabled}
							onChange={props.onChange}
						></input>
						<label htmlFor={el.id} className={el.className || ''}>
							{el.label}
						</label>
					</div>
				);
			})}
		</div>
	);
}
