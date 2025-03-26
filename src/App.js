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

  // Add new batch with conflict tracking
  const addBatch = (batchData) => {
    const newBatch = {
      ...batchData,
      id: Date.now(),
      color: '#ffffff',
      schedule: days.reduce((acc, day) => ({
        ...acc, 
        [day]: { 
          'A section': {}, 
          'B section': {}, 
          'C section': {} 
        }
      }), {}),
      conflicts: days.reduce((acc, day) => ({
        ...acc, 
        [day]: { 
          'A section': {}, 
          'B section': {}, 
          'C section': {} 
        }
      }), {})
    };
    setBatches(prev => [...prev, newBatch]);
    setShowBatchPopup(false);
  };

  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Delete this batch from all days?')) {
      setBatches(prev => prev.filter(batch => batch.id !== batchId));
    }
  };

  const handleCellClick = (cellInfo) => {
    const teacherSchedule = {};
    const occupiedRooms = {};

    batches.forEach(batch => {
      const daySchedule = batch.schedule?.[cellInfo.day] || {};
      Object.entries(daySchedule).forEach(([section, periods]) => {
        Object.entries(periods).forEach(([period, data]) => {
          data.teachers?.forEach(teacher => {
            teacherSchedule[teacher] = teacherSchedule[teacher] || {};
            teacherSchedule[teacher][section] = teacherSchedule[teacher][section] || [];
            teacherSchedule[teacher][section].push(parseInt(period));
          });
        });
      });
    });

    setSelectedCell({
      ...cellInfo,
      teacherSchedule,
      occupiedRooms
    });
    setShowEditPopup(true);
  };

  const handleSaveCell = (cellInfo, newData) => {
    setBatches(prev => prev.map(batch => {
      if (batch.id !== cellInfo.batchId) return batch;

      const codeValue = parseInt(newData.code.split(' ').pop());
      const isSessional = !isNaN(codeValue) && codeValue % 2 === 0;
      const validSessionalPeriods = [1, 4, 7];
      
      if (isSessional && !validSessionalPeriods.includes(cellInfo.period)) {
        alert('Sessional courses must be placed at 1st, 4th, or 7th period');
        return batch;
      }

      const periods = isSessional ? 
        [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9) : 
        [cellInfo.period];

      // Clear existing conflicts for this cell
      const cleanConflicts = JSON.parse(JSON.stringify(batch.conflicts));
      delete cleanConflicts[cellInfo.day][cellInfo.section][cellInfo.period];

      // Detect new conflicts
      const conflicts = {
        teachers: new Set(),
        rooms: new Set(),
        sections: new Set()
      };

      batches.forEach(b => {
        Object.entries(b.schedule[cellInfo.day]).forEach(([section, periods]) => {
          Object.entries(periods).forEach(([period, data]) => {
            if (period === cellInfo.period.toString() && data) {
              data.teachers?.forEach(t => {
                if (newData.teachers.includes(t)) conflicts.teachers.add(t);
              });
              data.rooms?.forEach(r => {
                if (newData.rooms.includes(r)) conflicts.rooms.add(r);
              });
              if (section !== cellInfo.section) conflicts.sections.add(section);
            }
          });
        });
      });

      // Handle conflicts or update schedule
      if (conflicts.teachers.size > 0 || conflicts.rooms.size > 0) {
        return handleConflicts(
          { ...batch, conflicts: cleanConflicts },
          cellInfo,
          newData,
          conflicts
        );
      }

      return updateSchedule(
        { ...batch, conflicts: cleanConflicts },
        cellInfo,
        newData,
        isSessional
      );
    }));
  };

  const updateSchedule = (batch, cellInfo, newData, isSessional) => {
    const periods = isSessional ? 
      [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9) : 
      [cellInfo.period];

    const newSchedule = JSON.parse(JSON.stringify(batch.schedule));
    periods.forEach(p => {
      newSchedule[cellInfo.day][cellInfo.section][p] = {
        ...newData,
        isSessional,
        startPeriod: isSessional ? cellInfo.period : null
      };
    });
    
    return { ...batch, schedule: newSchedule };
  };

  const handleConflicts = (batch, cellInfo, newData, conflicts) => {
    const newConflicts = JSON.parse(JSON.stringify(batch.conflicts));
    const conflictEntry = {
      ...newData,
      teachers: [...conflicts.teachers],
      rooms: [...conflicts.rooms],
      sections: [...conflicts.sections],
      originalPeriod: cellInfo.period
    };

    // Only store if actual conflicts exist
    if (conflictEntry.teachers.length > 0 || conflictEntry.rooms.length > 0) {
      newConflicts[cellInfo.day][cellInfo.section][cellInfo.period] = conflictEntry;
    }

    return { ...batch, conflicts: newConflicts };
  };

  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');
    window.print();
    elementsToHide.forEach(el => el.style.display = '');
  };

  const handleDownloadPDF = () => {
    const elements = document.querySelectorAll('.table-container');
    const opt = {
      margin: [5, 5, 5, 5],
      filename: 'class-routine.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(elements).save();
  };

  return (
    <div className="App">
      <div className="header" style={{ textAlign: 'center', margin: '20px 0' }}>
        <img 
          src="/RUET_logo.svg.png" 
          alt="RUET Logo" 
          style={{ 
            height: '80px',
            marginBottom: '1rem',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
          }}
        />
        <h4 style={{ margin: '8px 0', color: '#2b4d37' }}>
          Rajshahi University of Engineering & Technology
        </h4>
        <h5 style={{ margin: 0, color: '#3d6b4f' }}>
          Department of Computer Science & Engineering
        </h5>
      </div>

      <PrintControls 
        onAddBatch={() => setShowBatchPopup(true)}
        onPrint={handlePrint}
        onDownloadPDF={handleDownloadPDF}
      />

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
          onSave={(result) => {
            if (result.validData) {
              handleSaveCell(selectedCell, result.validData);
            }
            setShowEditPopup(false);
          }}
        />
      )}
    </div>
  );
}

export default App;