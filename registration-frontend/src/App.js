import React from 'react';
import PatientRegistration from './components/PatientRegistration';
import OwnerRegistration from './components/OwnerRegistration';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Patient & Owner Registration System</h1>
      </header>
      <main className="App-main">
        <div className="registration-container">
          <PatientRegistration />
          <OwnerRegistration />
        </div>
      </main>
    </div>
  );
}

export default App;