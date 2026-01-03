import type { Token } from './types/Token';
export default function WordToken(props: {
	token: Token;
	onClick: () => void | null;
	loadedWord: boolean;
	highlighted: boolean;
}) {
	const { token } = props;
	if (token.word === '\n') return <br />;
	let className = 'preview-word';
	className += ` ${token.type}`;
	if (token.isHideable) className += ' hideable';
	if (props.loadedWord) className += ' loaded-word';
	else if (props.highlighted) className += ' highlighted';
	if (token.bold) className += ' bold';
	if (token.italic) className += ' italic';
	if (token.placement !== 'none') className += ` ${token.placement}`;

	return (
		<span className={className} onClick={props.onClick || (() => {})}>
			{token.word}
		</span>
	);
}
