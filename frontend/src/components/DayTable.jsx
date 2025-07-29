import React from 'react';

const timeSlots = [
  '8:00 - 8:50 AM',
  '8:50 - 9:40 AM',
  '9:40 - 10:30 AM',
  '10:50 - 11:40 AM',
  '11:40 - 12:30 PM',
  '12:30 - 1:20 PM',
  '2:30 - 3:20 PM',
  '3:20 - 4:10 PM',
  '4:10 - 5:00 PM'
];

// Format teachers with parentheses for multiple instructors
const formatTeachers = (teachers) => {
  return teachers
    .filter(t => t)
    .map(t => t.includes('/') ? `(${t})` : t)
    .join('/');
};

const DayTable = ({ day, batches, onCellClick, onDeleteBatch }) => {
  // Sort batches by year and semester
  const sortedBatches = [...batches].sort((a, b) => {
    const yearOrder = { '4th': 4, '3rd': 3, '2nd': 2, '1st': 1 };
    const semOrder = { 'Even': 1, 'Odd': 0 };
    return yearOrder[b.year] - yearOrder[a.year] || semOrder[b.semester] - semOrder[a.semester];
  });

  // Get cell content with conflict detection
  const getCellContent = (batch, section, period) => {
    // Handle potential MongoDB Map objects
    const getMapOrObject = (obj, day, section, period) => {
      if (!obj || !obj[day] || !obj[day][section]) return null;
      
      const sectionData = obj[day][section];
      // Check if it's a MongoDB Map object or regular object
      return sectionData instanceof Map ? 
        sectionData.get(period.toString()) : 
        sectionData[period];
    };

    const schedule = getMapOrObject(batch.schedule, day, section, period);
    const conflict = getMapOrObject(batch.conflicts, day, section, period);

    // Handle conflict cells
    if (conflict) {
      return {
        content: `${conflict.code}\n${formatTeachers(conflict.teachers)}\n${conflict.rooms.join('/')}`,
        className: 'conflict-cell',
        colSpan: 1,
        conflictData: conflict
      };
    }

    // Handle empty cells
    if (!schedule) return { content: '', className: '', colSpan: 1 };

    // Handle sessional courses
    const isSessionalStart = schedule.isSessional && schedule.startPeriod === period;
    return {
      content: `${schedule.code}\n${formatTeachers(schedule.teachers)}\n${schedule.rooms.join('/')}`,
      className: isSessionalStart ? 'sessional-cell' : '',
      colSpan: isSessionalStart ? 3 : 1
    };
  };

  return (
    <div className={`table-${day}`}>
      <div style={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center' }}>
        <h5 style={{ color: '#2b4d37', marginTop: 15, marginBottom:2 }}>Rajshahi University of Engineering & Technology</h5>
        <h6 style={{ color: '#2b4d37', margin: 2 }}>Department of Computer Science & Engineering</h6>
        <h6 style={{ color: '#2b4d37', margin: 2 }}>Class Routine( Effective form 21 June, 2025) (Start with Saturday)</h6>
      </div>

      <table className="dynamicTable">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>PERIOD →</th>
            {[...Array(9)].map((_, i) => (
              <th key={i} style={{ width: '8%' }}>{i+1}</th>
            ))}
            <th className="no-print" style={{ width: '8%' }}>DUPLICATES</th>
            <th className="no-print" style={{ width: '4%' }}>ACTION</th>
          </tr>
          
          <tr>
            <td id="highlight">TIME →</td>
            {timeSlots.map((time, i) => (
              <td key={i} style={{ width: '8%' }}>{time}</td>
            ))}
            <td className="no-print" rowSpan="2"></td>
            <td className="no-print" rowSpan="2"></td>
          </tr>
          
          <tr>
            <td id="highlight">DAY →</td>
            <td colSpan="9" style={{ textAlign: 'center' }}>
              {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
            </td>
          </tr>
          
        </thead>

        <tbody>
          {sortedBatches.map((batch) => (
            <React.Fragment key={batch._id || batch.id}>
              {['A section', 'B section', 'C section'].map((section, i) => (
                <tr key={`${batch._id || batch.id}-${i}`} style={{ backgroundColor: batch.color }}>
                  {/* Batch Info Column */}
                  <td style={{ width: '15%' }}>
                    {batch.year} Year {batch.semester} Semester<br/>
                    {section}<br/>
                    ({batch.name})
                  </td>

                  {/* Period Cells */}
                  {(function() {
                    const cells = [];
                    let skip = 0;
                    for (let periodIdx = 0; periodIdx < 9; periodIdx++) {
                      if (skip > 0) {
                        skip--;
                        continue;
                      }

                      const currentPeriod = periodIdx + 1;
                      const cell = getCellContent(batch, section, currentPeriod);

                      if (cell.colSpan === 1 && cell.className.includes('sessional-cell')) {
                        continue;
                      }

                      cells.push(
                        <td
                          key={periodIdx}
                          colSpan={cell.colSpan}
                          className={cell.className}
                          onClick={() => {
                            const content = cell.conflictData || 
                                          (batch.schedule?.[day]?.[section]?.[currentPeriod] || null);
                            
                            // Create string representation for EditPopup
                            const contentString = content ? 
                              `${content.code}\n${content.teachers.join('/')}\n${content.rooms.join('/')}` : 
                              '';
                            
                            onCellClick({
                              day,
                              period: currentPeriod,
                              batchId: batch._id || batch.id,
                              section,
                              content: contentString,
                              isConflict: !!cell.conflictData,
                              // Pass original object for validation
                              contentObject: content
                            });
                          }}
                        >
                          {cell.content.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </td>
                      );

                      if (cell.colSpan > 1) {
                        skip = cell.colSpan - 1;
                      }
                    }
                    return cells;
                  })()}
                  
                  {/* Conflict Report Cell */}
                  <td className="conflict-report no-print">
                    {batch.conflicts && batch.conflicts[day] && batch.conflicts[day][section] ? 
                      Object.entries(batch.conflicts[day][section]).map(([periodKey, conflict], i) => (
                        <div key={i} style={{ fontSize: '0.8em', lineHeight: '1.2' }}>
                          Code:{conflict.code}, Period: {conflict.originalPeriod}<br/>
                          Teacher Conflict: {formatTeachers(conflict.teachers)}<br/>
                          Room Conflict: {conflict.rooms?.join(', ') || 'None'}
                        </div>
                      )) : null
                    }
                  </td>

                  {/* Delete Button (only on first row) */}
                  {i === 0 && (
                    <td className="no-print" rowSpan="3">
                      <button 
                        onClick={() => onDeleteBatch(batch._id || batch.id)}
                        style={{ 
                          padding: '4px 0px',
                          backgroundColor: '#ff4444',
                          color: 'white',
                          border: '1px solid black',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DayTable;