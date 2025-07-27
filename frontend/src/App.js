import { useState, useRef, useEffect } from 'react';
import DayTable from './components/DayTable';
import BatchPopup from './components/BatchPopup';
import EditPopup from './components/EditPopup';
import TeacherManagerPopup from './components/TeacherManagerPopup';
import PrintControls from './components/PrintControls';
import html2pdf from 'html2pdf.js';
import api from './services/api';
import './styles/main.css';

function App() {
  const [days] = useState(['sat', 'sun', 'mon', 'tue', 'wed']);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showBatchPopup, setShowBatchPopup] = useState(false);
  const [showTeacherPopup, setShowTeacherPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const tableContainerRef = useRef(null);

  // Fetch batches and teachers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [batchData, teacherData] = await Promise.all([
          api.fetchBatches(),
          api.fetchTeachers()
        ]);
        setBatches(batchData);
        setTeachers(teacherData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add new batch
  const addBatch = async (batchData) => {
    try {
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
      
      const savedBatch = await api.createBatch(newBatch);
      setBatches(prev => [...prev, savedBatch]);
      setShowBatchPopup(false);
    } catch (error) {
      console.error('Error adding batch:', error);
      alert('Failed to add batch. Please try again.');
    }
  };

  // Delete batch
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

  // Handle cell click in timetable
  const handleCellClick = (cellInfo) => {
    const teacherSchedule = {};
    const occupiedRooms = {};

    batches.forEach(batch => {
      const daySchedule = batch.schedule?.[cellInfo.day] || {};
      Object.entries(daySchedule).forEach(([section, periods]) => {
        const periodsObj = periods instanceof Map ? Object.fromEntries(periods) : periods;
        
        Object.entries(periodsObj).forEach(([period, data]) => {
          if (!data) return;
          
          // Determine if it's a lecture or lab
          const codeValue = parseInt(data.code);
          const type = !isNaN(codeValue) && codeValue % 2 === 0 ? 'lab' : 'lecture';
          
          data.teachers?.forEach(teacher => {
            teacherSchedule[teacher] = teacherSchedule[teacher] || {};
            teacherSchedule[teacher][section] = teacherSchedule[teacher][section] || [];
            
            // Store period with type
            teacherSchedule[teacher][section].push({
              period: parseInt(period),
              type
            });
          });
        });
      });
    });

    // Find batch for year/semester info
    const batch = batches.find(b => b._id === cellInfo.batchId);
    
    setSelectedCell({
      ...cellInfo,
      teacherSchedule,
      occupiedRooms,
      batchYear: batch?.year,
      batchSemester: batch?.semester
    });
    setShowEditPopup(true);
  };

  // Save cell data
  const handleSaveCell = async (cellInfo, newData) => {
    const batchToUpdate = batches.find(batch => batch._id === cellInfo.batchId);
    
    if (!batchToUpdate) {
      console.error('Batch not found:', cellInfo.batchId);
      return;
    }

    const updatedBatch = JSON.parse(JSON.stringify(batchToUpdate));

    const codeValue = parseInt(newData.code);
    const isSessional = !isNaN(codeValue) && codeValue % 2 === 0;
    const validSessionalPeriods = [1, 4, 7];
    
    if (isSessional && !validSessionalPeriods.includes(cellInfo.period)) {
      alert('Sessional courses must be placed at 1st, 4th, or 7th period');
      return;
    }

    const periods = isSessional ? 
      [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9) : 
      [cellInfo.period];

    const cleanConflicts = JSON.parse(JSON.stringify(updatedBatch.conflicts));
    if (cleanConflicts[cellInfo.day] && 
        cleanConflicts[cellInfo.day][cellInfo.section]) {
      delete cleanConflicts[cellInfo.day][cellInfo.section][cellInfo.period];
    }

    const conflicts = {
      teachers: new Set(),
      rooms: new Set(),
      sections: new Set()
    };

    batches.forEach(b => {
      if (!b.schedule[cellInfo.day]) return;

      Object.entries(b.schedule[cellInfo.day]).forEach(([section, periods]) => {
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
      const savedBatch = await api.updateBatch(finalBatch._id, finalBatch);
      setBatches(prev => prev.map(batch => 
        batch._id === savedBatch._id ? savedBatch : batch
      ));
    } catch (error) {
      console.error('Error saving cell data:', error);
      alert('Failed to save changes. Please try again.');
    }
    
    setShowEditPopup(false);
  };

  // Update schedule data
  const updateSchedule = (batch, cellInfo, newData, isSessional) => {
    const periods = isSessional ? 
      [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9) : 
      [cellInfo.period];

    const newSchedule = JSON.parse(JSON.stringify(batch.schedule));
    periods.forEach(p => {
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

  // Handle conflicts
  const handleConflicts = (batch, cellInfo, newData, conflicts) => {
    const newConflicts = JSON.parse(JSON.stringify(batch.conflicts));
    const conflictEntry = {
      ...newData,
      teachers: [...conflicts.teachers],
      rooms: [...conflicts.rooms],
      sections: [...conflicts.sections],
      originalPeriod: cellInfo.period
    };

    if (!newConflicts[cellInfo.day]) {
      newConflicts[cellInfo.day] = {};
    }
    if (!newConflicts[cellInfo.day][cellInfo.section]) {
      newConflicts[cellInfo.day][cellInfo.section] = {};
    }

    if (conflictEntry.teachers.length > 0 || conflictEntry.rooms.length > 0) {
      newConflicts[cellInfo.day][cellInfo.section][cellInfo.period] = conflictEntry;
    }

    return { ...batch, conflicts: newConflicts };
  };

  // Delete cell data
  const handleDeleteCell = async (cellInfo) => {
    try {
      const batchToUpdate = batches.find(batch => batch._id === cellInfo.batchId);
      if (!batchToUpdate) return;

      const updatedBatch = JSON.parse(JSON.stringify(batchToUpdate));
      
      // Determine periods to delete (handles sessional courses)
      const currentData = updatedBatch.schedule[cellInfo.day]?.[cellInfo.section]?.[cellInfo.period];
      let periodsToDelete = [cellInfo.period];
      
      if (currentData?.isSessional && currentData.startPeriod === cellInfo.period) {
        periodsToDelete = [cellInfo.period, cellInfo.period + 1, cellInfo.period + 2].filter(p => p <= 9);
      }

      // Delete schedule data
      periodsToDelete.forEach(period => {
        if (updatedBatch.schedule[cellInfo.day]?.[cellInfo.section]?.[period]) {
          delete updatedBatch.schedule[cellInfo.day][cellInfo.section][period];
        }
      });

      // Delete conflict data
      if (updatedBatch.conflicts[cellInfo.day]?.[cellInfo.section]?.[cellInfo.period]) {
        delete updatedBatch.conflicts[cellInfo.day][cellInfo.section][cellInfo.period];
      }

      // Update database
      const savedBatch = await api.updateBatch(updatedBatch._id, updatedBatch);
      
      // Update state
      setBatches(prev => 
        prev.map(batch => batch._id === savedBatch._id ? savedBatch : batch
      ));
      
      return true;
    } catch (error) {
      console.error('Error deleting cell data:', error);
      alert('Failed to delete cell data. Please try again.');
      return false;
    }
  };

  // Print routine
  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');
    window.print();
    elementsToHide.forEach(el => el.style.display = '');
  };

  // Download PDF - A4 compatible version
  const handleDownloadPDF = () => {
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => { 
      el.style.display = 'none'; 
    });

    const opt = {
      margin: [5, 5, 5, 5],
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
        format: 'a3', 
        orientation: 'landscape' 
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
      }
    };

    html2pdf()
      .set(opt)
      .from(tableContainerRef.current)
      .save()
      .then(() => {
        elementsToHide.forEach(el => { 
          el.style.display = ''; 
        });
      });
  };

  // Add teacher
  const addTeacher = async (teacherData) => {
    try {
      const savedTeacher = await api.createTeacher(teacherData);
      setTeachers(prev => [...prev, savedTeacher]);
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher. Please try again.');
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    try {
      await api.deleteTeacher(id);
      setTeachers(prev => prev.filter(teacher => teacher._id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher. Please try again.');
      return false;
    }
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
        onAddTeacher={() => setShowTeacherPopup(true)}
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

      {showTeacherPopup && (
        <TeacherManagerPopup
          teachers={teachers}
          onAdd={addTeacher}
          onDelete={deleteTeacher}
          onClose={() => setShowTeacherPopup(false)}
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
          onDelete={async () => {
            const success = await handleDeleteCell(selectedCell);
            if (success) setShowEditPopup(false);
          }}
          teachers={teachers}
          batchYear={selectedCell?.batchYear}
          batchSemester={selectedCell?.batchSemester}
        />
      )}
    </div>
  );
}

export default App;