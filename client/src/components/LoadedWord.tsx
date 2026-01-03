import { Component } from 'react';
import type { Token } from './types/Token';
import RadioGroup from './CreateGameForm/RadioGroup';
type lw = {
	loadedWord: Token;
};
export default class LoadedWord extends Component {
	render(props: lw) {
		const token: Token = props.loadedWord;
		if (!token) return <div></div>;
		return (
			<div className={`group-container d-flex flex-column align-items-start`}>
				<h3>{token.word || `No word loaded`}</h3>
				<RadioGroup
					label={'State'}
					name={'hidden'}
					options={[
						{
							id: 'hidden-true',
							value: 'hidden',
							label: 'Hidden',
							default: !token.shown || false,
							disabled: false,
						},
						{
							id: 'hidden-false',
							value: 'shown',
							label: 'Shown',
							default: token.shown || false,
							disabled: token.type === 'title',
						},
					]}
				/>
				<div className={'input-label'}>Formatting</div>
				<RadioGroup
					label={'Bold/Italic'}
					name={'formatting'}
					options={[
						{
							id: 'format-none',
							value: 'none',
							label: 'Neither',
							default: !token.bold && !token.italic,
							disabled: false,
						},
						{
							id: 'format-bold',
							value: 'bold',
							label: 'Bold',
							className: 'fw-bold',
							default: token.bold && !token.italic,
							disabled: false,
						},
						{
							id: 'format-italic',
							value: 'italic',
							label: 'Italic',
							className: 'fst-italic',
							default: !token.bold && token.italic,
							disabled: false,
						},
						{
							id: 'format-both',
							value: 'bold-italic',
							label: 'Both',
							className: 'fw-bold fst-italic',
							default: token.bold && token.italic,
							disabled: false,
						},
					]}
				/>
				<RadioGroup
					label={'Placement'}
					name="placement"
					options={[
						{
							id: 'loc-subscript',
							value: 'sub',
							label: 'Subscript',
							default: props !== null && token.placement === 'sub',
							disabled: false,
						},
						{
							id: 'loc-none',
							value: 'none',
							label: 'Normal',
							default: props === null || token.placement === 'none',
							disabled: false,
						},
						{
							id: 'loc-superscript',
							value: 'super',
							label: 'Superscript',
							default: props !== null && token.placement === 'super',
							disabled: false,
						},
					]}
				/>
				<div id="loaded-word-bottom"></div>
			</div>
		);
	}
}
