import logo from './logo.svg';
import './App.css';
import '../node_modules/electron-tabs/dist/electron-tabs'
import {TabGroup} from 'electron-tabs'

// const tabGroup = document.getElementById("my-tab");
// tabGroup.addTab({
//   title: "wikipedia",
//   src: "https://www.wikipedia.org/",
//   active: true
// })

function App() {
  return (
    <div className="App">
      {/* <TabGroup new-tab-button = "true" sortable = "true" id="my-tab"></TabGroup> */}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload Hello world and more and again!.
        </p>
        <button id = 'btn-send' onClick = {async () => {
          let msgText = "5173"
          window.electronAPI.onPortOccupied(msgText)
        }}>Open Window</button>
        <button id = 'btn-send' onClick = {async () => {
          let msgText = "3000"
          window.electronAPI.onPortOpen(msgText)
        }}>Close Window</button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      
    </div>
  );
}

export default App;
