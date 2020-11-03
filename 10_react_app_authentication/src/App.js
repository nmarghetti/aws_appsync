import React from 'react';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <AmplifySignOut />
          My App
        </div>
      </header>
    </div>
  );
}

export default withAuthenticator(App);
