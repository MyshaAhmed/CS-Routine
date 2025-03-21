import React from 'react';

// Time slots configuration for table headers
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

const DayTable = ({ day, batches, onCellClick, onDeleteBatch }) => {
  // Sort batches by seniority: 4th > 3rd > 2nd > 1st > Even > Odd
  const sortedBatches = [...batches].sort((a, b) => {
    const yearValue = { '4th': 4, '3rd': 3, '2nd': 2, '1st': 1 };
    const yearDiff = yearValue[b.year] - yearValue[a.year];
    if (yearDiff !== 0) return yearDiff;
    const semesterValue = { 'Even': 1, 'Odd': 0 };
    return semesterValue[b.semester] - semesterValue[a.semester];
  });

  // Handle batch deletion confirmation
  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Delete this batch from all days?')) {
      onDeleteBatch(batchId);
    }
  };

  // Format cell content for display
  const getCellContent = (batch, section, period) => {
    const schedule = batch.schedule?.[day]?.[section]?.[period] || {};
    return [
      schedule.courseCode,
      schedule.teachers?.join('/'),
      schedule.rooms?.join('/')
    ].filter(Boolean).join('\n');
  };

  return (
    <div className={`table-${day}`}>
      {/* Day header */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{color:'#2b4d37'}}>CLASS ROUTINE - {day.toUpperCase()}</h1>
      </div>

      {/* Main table structure */}
      <table id={`dynamicTable-${day}`} className="dynamicTable">
        <thead>
          {/* Column headers */}
          <tr>
            <th style={{ width: '15%' }}>Period →</th>
            {[...Array(9)].map((_, i) => (
              <th key={i} style={{ width: '8%' }}>{i+1}th</th>
            ))}
            <th className="no-print" style={{ width: '8%' }}>Duplicates</th>
            <th className="no-print" style={{ width: '4%' }}>Action</th>
          </tr>
          
          {/* Time slots row */}
          <tr>
            <td id="highlight">Time →</td>
            {timeSlots.map((time, i) => (
              <td key={i} style={{ width: '8%' }}>{time}</td>
            ))}
            <td className="no-print" rowSpan="2"></td>
            <td className="no-print" rowSpan="2"></td>
          </tr>
          
          {/* Day identification row */}
          <tr>
            <td id="highlight">Day →</td>
            <td colSpan="9" style={{ textAlign: 'center' }}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </td>
          </tr>
        </thead>

        {/* Batch rows - 3 sections per batch */}
        <tbody>
          {sortedBatches.map((batch) => (
            <React.Fragment key={batch.id}>
              {['A section', 'B section', 'C section'].map((section, i) => (
                <tr key={`${batch.id}-${i}`} style={{ backgroundColor: batch.color }}>
                  {/* Batch info column */}
                  <td style={{ width: '15%' }}>
                    {batch.year} Year<br/>
                    {batch.semester} Semester<br/>
                    {section}<br/>
                    ({batch.name})
                  </td>
                  
                  {/* Period columns */}
                  {[...Array(9)].map((_, period) => (
                    <td
                      key={period}
                      style={{ width: '8%' }}
                      onClick={() => onCellClick({ day, period: period+1, batchId: batch.id, section })}
                      dangerouslySetInnerHTML={{
                        __html: getCellContent(batch, section, period+1).replace(/\n/g, '<br/>')
                      }}
                    />
                  ))}
                  
                  {/* Report cell and delete button */}
                  <td className="report-cell" style={{ width: '8%' }}></td>
                  {i === 0 && (
                    <td className="no-print" style={{ width: '4%' }}>
                      <button 
                        onClick={() => handleDeleteBatch(batch.id)}
                        style={{ 
                          margin: '5px 0',
                          backgroundColor: '#ff4444',
                          color: 'white',
                          padding: '6px 0px',
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