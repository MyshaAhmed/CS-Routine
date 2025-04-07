import { useState, useRef, useEffect } from 'react';
import DayTable from './components/DayTable';
import BatchPopup from './components/BatchPopup';
import EditPopup from './components/EditPopup';
import PrintControls from './components/PrintControls';
import html2pdf from 'html2pdf.js';
import api from './services/api'; // Import the API service
import './styles/main.css';

function App() {
  const [days] = useState(['sat', 'sun', 'mon', 'tue', 'wed']);
  const [batches, setBatches] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showBatchPopup, setShowBatchPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const tableContainerRef = useRef(null);

  // Fetch batches from the database when the component mounts
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const data = await api.fetchBatches();
        setBatches(data);
      } catch (error) {
        console.error('Failed to fetch batches:', error);
        // Handle error - maybe show a notification to the user
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Add new batch with conflict tracking
  const addBatch = async (batchData) => {
    try {
      const newBatch = {
        ...batchData,
        id: Date.now(), // This will be replaced by MongoDB's _id
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
      
      // Save to database
      const savedBatch = await api.createBatch(newBatch);
      setBatches(prev => [...prev, savedBatch]);
      setShowBatchPopup(false);
    } catch (error) {
      console.error('Error adding batch:', error);
      alert('Failed to add batch. Please try again.');
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Delete this batch from all days?')) {
      try {
        await api.deleteBatch(batchId);
        setBatches(prev => prev.filter(batch => batch._id !== batchId));
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Failed to delete batch. Please try again.');
      }
    }
  };

  const handleCellClick = (cellInfo) => {
    const teacherSchedule = {};
    const occupiedRooms = {};

    batches.forEach(batch => {
      const daySchedule = batch.schedule?.[cellInfo.day] || {};
      Object.entries(daySchedule).forEach(([section, periods]) => {
        // Handle MongoDB Map object conversion
        const periodsObj = periods instanceof Map ? Object.fromEntries(periods) : periods;
        
        Object.entries(periodsObj).forEach(([period, data]) => {
          if (!data) return;
          
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

  const handleSaveCell = async (cellInfo, newData) => {
    // Find the batch to update
    const batchToUpdate = batches.find(batch => batch._id === cellInfo.batchId);
    
    if (!batchToUpdate) {
      console.error('Batch not found:', cellInfo.batchId);
      return;
    }

    // Clone the batch for manipulation
    const updatedBatch = JSON.parse(JSON.stringify(batchToUpdate));

    const codeValue = parseInt(newData.code.split(' ').pop());
    const isSessional = !isNaN(codeValue) && codeValue % 2 === 0;
    const validSessionalPeriods = [1, 4, 7];
    
    if (isSessional && !validSessionalPeriods.includes(cellInfo.period)) {
      alert('Sessional courses must be placed at 1st, 4th, or 7th period');
      return;
    }

    const periods = isSessional ? 
      [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9) : 
      [cellInfo.period];

    // Clear existing conflicts for this cell
    const cleanConflicts = JSON.parse(JSON.stringify(updatedBatch.conflicts));
    if (cleanConflicts[cellInfo.day] && 
        cleanConflicts[cellInfo.day][cellInfo.section]) {
      delete cleanConflicts[cellInfo.day][cellInfo.section][cellInfo.period];
    }

    // Detect new conflicts
    const conflicts = {
      teachers: new Set(),
      rooms: new Set(),
      sections: new Set()
    };

    batches.forEach(b => {
      if (!b.schedule[cellInfo.day]) return;

      Object.entries(b.schedule[cellInfo.day]).forEach(([section, periods]) => {
        // Convert Map to Object if needed
        const periodsObj = periods instanceof Map ? Object.fromEntries(periods) : periods;
        
        Object.entries(periodsObj).forEach(([period, data]) => {
          if (!data) return;
          
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

    let finalBatch;

    // Handle conflicts or update schedule
    if (conflicts.teachers.size > 0 || conflicts.rooms.size > 0) {
      finalBatch = handleConflicts(
        { ...updatedBatch, conflicts: cleanConflicts },
        cellInfo,
        newData,
        conflicts
      );
    } else {
      finalBatch = updateSchedule(
        { ...updatedBatch, conflicts: cleanConflicts },
        cellInfo,
        newData,
        isSessional
      );
    }

    try {
      // Save to database
      const savedBatch = await api.updateBatch(finalBatch._id, finalBatch);
      
      // Update state
      setBatches(prev => prev.map(batch => 
        batch._id === savedBatch._id ? savedBatch : batch
      ));
    } catch (error) {
      console.error('Error saving cell data:', error);
      alert('Failed to save changes. Please try again.');
    }
    
    setShowEditPopup(false);
  };

  const updateSchedule = (batch, cellInfo, newData, isSessional) => {
    const periods = isSessional ? 
      [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9) : 
      [cellInfo.period];

    const newSchedule = JSON.parse(JSON.stringify(batch.schedule));
    periods.forEach(p => {
      // Ensure the structure exists
      if (!newSchedule[cellInfo.day]) {
        newSchedule[cellInfo.day] = {};
      }
      if (!newSchedule[cellInfo.day][cellInfo.section]) {
        newSchedule[cellInfo.day][cellInfo.section] = {};
      }
      
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

    // Ensure the structure exists
    if (!newConflicts[cellInfo.day]) {
      newConflicts[cellInfo.day] = {};
    }
    if (!newConflicts[cellInfo.day][cellInfo.section]) {
      newConflicts[cellInfo.day][cellInfo.section] = {};
    }

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
    // Hide elements we don't want in the PDF
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => { 
      el.style.display = 'none'; 
    });

    // Configure PDF options
    const opt = {
      margin: [5, 5, 5, 5], // [top, right, bottom, left] in mm
      filename: 'class-routine.pdf',
      image: { 
        type: 'jpeg', 
        quality: 0.95 
      },
      html2canvas: { 
        scale: 2, 
        letterRendering: true, 
        useCORS: true 
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a2', 
        orientation: 'landscape' 
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
      }
    };

    // Generate and download PDF
    html2pdf()
      .set(opt)
      .from(tableContainerRef.current)
      .save()
      .then(() => {
        // Restore visibility of hidden elements after PDF generation
        elementsToHide.forEach(el => { 
          el.style.display = ''; 
        });
      });
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

      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <p>Loading routine data...</p>
        </div>
      ) : (
        <div ref={tableContainerRef} className="table-container-wrapper">
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
      )}

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
          }}
        />
      )}
    </div>
  );
}

export default App;