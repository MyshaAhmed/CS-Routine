import { useState, useEffect } from 'react';
import DayTable from './components/DayTable';
import BatchPopup from './components/BatchPopup';
import EditPopup from './components/EditPopup';
import PrintControls from './components/PrintControls';
import html2pdf from 'html2pdf.js';
import './styles/main.css';

function App() {
  const [days] = useState(['sat', 'sun', 'mon', 'tue', 'wed']);
  const [batches, setBatches] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showBatchPopup, setShowBatchPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  // Add batch handler
  const addBatch = (batchData) => {
    const newBatch = { 
      ...batchData, 
      id: Date.now(),
      color: getLightColor()
    };
    setBatches([...batches, newBatch]);
    setShowBatchPopup(false);
  };

  // Cell click handler
  const handleCellClick = (cellInfo) => {
    setSelectedCell(cellInfo);
    setShowEditPopup(true);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // PDF download handler
  const handleDownloadPDF = () => {
    const element = document.querySelector('.table-container');
    const opt = {
      margin: [5, 5, 5, 5],
      filename: 'class-routine.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Generate light color for batches
  const getLightColor = () => {
    return `rgb(255, 255, 255)`;
  };

  return (
    <div className="App">
      <PrintControls 
        onAddBatch={() => setShowBatchPopup(true)}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
      />

      <div className="header">
        <h3>Rajshahi University of Engineering & Technology</h3>
        <h4>Department of Computer Science & Engineering</h4>
      </div>

      <div className="table-container">
        {days.map(day => (
          <DayTable 
            key={day}
            day={day}
            batches={batches}
            onCellClick={handleCellClick}
          />
        ))}
      </div>

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
          onSave={() => {
            // Implement save logic
            setShowEditPopup(false);
          }}
        />
      )}
    </div>
  );
}

export default App;