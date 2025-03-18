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

  const getLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 50%, 85%)`;
  };

  const addBatch = (batchData) => {
    const newBatch = {
      ...batchData,
      id: Date.now(),
      color: getLightColor()
    };
    setBatches(prev => [...prev, newBatch]);
    setShowBatchPopup(false);
  };

  const handleCellClick = (cellInfo) => {
    setSelectedCell(cellInfo);
    setShowEditPopup(true);
  };

  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');
    window.print();
    elementsToHide.forEach(el => el.style.display = '');
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector('.table-container');
    const opt = {
      margin: [5, 5, 5, 5],
      filename: 'class-routine.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
      },
      jsPDF: { 
        unit: 'mm',
        format: 'a3',
        orientation: 'landscape',
        compressPDF: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="App">
      <PrintControls 
        onAddBatch={() => setShowBatchPopup(true)}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
      />

      <div className="header" style={{ textAlign: 'center', margin: '20px 0' }}>
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
          onSave={(updatedData) => {
            // Implement cell save logic here
            setShowEditPopup(false);
          }}
        />
      )}
    </div>
  );
}

export default App;