import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import JoinTab from './JoinTab';
import EditTab from './EditTab';
import HostTab from './HostTab';
export default function HomeScreen() {
	return (
		<>
			<h1 className="fw-semibold mb-3">RedactoPedia</h1>
			<Tabs
				defaultActiveKey="create"
				id="home-tabs"
				className="mb-3"
				fill
				justify
			>
				<Tab eventKey={'join'} title="Join">
					<JoinTab />
				</Tab>
				<Tab eventKey={'host'} title="Host">
					<HostTab />
				</Tab>
				<Tab eventKey={'create'} title=" Game Editor">
					<EditTab />
				</Tab>
			</Tabs>
		</>
	);
}
