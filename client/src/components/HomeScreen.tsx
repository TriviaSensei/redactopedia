import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import JoinTab from './JoinTab';
import EditTab from './EditTab';
import HostTab from './HostTab';
export default function HomeScreen() {
	return (
		<>
			<h1 className="fw-semibold mb-3">RedactoPedia</h1>
			<Tab.Container id="home-tab-container" defaultActiveKey="create">
				<Nav className="mb-3" id="home-tabs" fill justify>
					<Nav.Item>
						<Nav.Link eventKey="join">Join</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="host">Host</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="create">Create</Nav.Link>
					</Nav.Item>
				</Nav>
				<Tab.Content>
					<div className="tab-inner w-100 mh-100">
						<Tab.Pane eventKey="join">
							<JoinTab />
						</Tab.Pane>
						<Tab.Pane eventKey="host">
							<HostTab />
						</Tab.Pane>
						<Tab.Pane eventKey="create">
							<EditTab />
						</Tab.Pane>
					</div>
				</Tab.Content>
			</Tab.Container>
			{/* <Tabs
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
			</Tabs> */}
		</>
	);
}
