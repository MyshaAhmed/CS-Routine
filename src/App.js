import { useState, useEffect } from 'react';
import DayTable from './components/DayTable';
import BatchPopup from './components/BatchPopup';
import EditPopup from './components/EditPopup';
import PrintControls from './components/PrintControls';
import html2pdf from 'html2pdf.js';
import './styles/main.css';

function App() {
  // State management for core functionality
  const [days] = useState(['sat', 'sun', 'mon', 'tue', 'wed']); // List of days to display
  const [batches, setBatches] = useState([]); // Stores all batch data
  const [selectedCell, setSelectedCell] = useState(null); // Currently selected table cell
  const [showBatchPopup, setShowBatchPopup] = useState(false); // Batch popup visibility
  const [showEditPopup, setShowEditPopup] = useState(false); // Edit popup visibility

  // Generates pastel colors for batch rows
  const getLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${255}, 255, 255)`; // making it white coz pastel is not looking good
  };

  // Handles batch creation
  const addBatch = (batchData) => {
    const newBatch = {
      ...batchData,
      id: Date.now(), // Unique ID based on timestamp
      color: getLightColor()
    };
    setBatches(prev => [...prev, newBatch]); // Immutable state update
    setShowBatchPopup(false);
  };

  // Deletes batch across all days
  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch from all days?')) {
      setBatches(prev => prev.filter(batch => batch.id !== batchId));
    }
  };

  // Handles cell click for editing
  const handleCellClick = (cellInfo) => {
    setSelectedCell(cellInfo);
    setShowEditPopup(true);
  };

  // Print functionality
  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');
    window.print();
    elementsToHide.forEach(el => el.style.display = '');
  };

  // PDF export functionality
  const handleDownloadPDF = () => {
    const elements = document.querySelectorAll('.table-container');
    const opt = {
      margin: [5, 5, 5, 5],
      filename: 'class-routine.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' }
    };
    
    const worker = html2pdf().set(opt);
    elements.forEach(element => {
      worker.from(element).save();
    });
  };

  return (
    <div className="App">
      {/* Control buttons component */}
      <PrintControls 
        onAddBatch={() => setShowBatchPopup(true)}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Institution header */}
      <div className="header" style={{ textAlign: 'center', margin: '20px 0' }}>
        <h4>Rajshahi University of Engineering & Technology</h4>
        <h5>Department of Computer Science & Engineering</h5>
      </div>

      {/* Main table container */}
      <div className="table-container-wrapper">
        {days.map(day => (
          <div key={day} className="table-container">
            <DayTable 
              day={day}
              batches={batches}
              onCellClick={handleCellClick}
              onDeleteBatch={handleDeleteBatch}
            />
          </div>
        ))}
      </div>

      {/* Popup modals */}
      {showBatchPopup && (
        <BatchPopup
          onClose={() => setShowBatchPopup(false)}
          onAdd={addBatch}
        />
      )}

      {showEditPopup && (
        <EditPopup
          cellData={selectedCell}
          onClose={() => setShowEditPopup(false)}
          onSave={() => setShowEditPopup(false)}
        />
      )}
    </div>
  );
}

export default App;