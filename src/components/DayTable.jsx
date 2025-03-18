import React, { useEffect } from 'react';

const DayTable = ({ day, batches, onCellClick }) => {
  useEffect(() => {
    // Add any initialization logic here
  }, [batches]);

  return (
    <div className={`table-${day}`}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>CLASS ROUTINE - {day.toUpperCase()}</h1>
      </div>
      
      <table id={`dynamicTable-${day}`} className="dynamicTable">
        <thead>
          <tr>
            <th>Period →</th>
            {[...Array(9)].map((_, i) => <th key={i}>{i+1}th</th>)}
            <th className="no-print">Duplicate Classes</th>
            <th className="no-print">Action</th>
          </tr>
          <tr>
            <td id="highlight">Time →</td>
            {/* Add time slots here */}
          </tr>
          <tr>
            <td id="highlight">Day →</td>
            <td style={{ justifyContent: 'center' }} colSpan="11">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </td>
          </tr>
        </thead>
        
        <tbody>
          {batches.map((batch, index) => (
            <React.Fragment key={batch.id}>
              {['A section', 'B section', 'C section'].map((section, i) => (
                <tr key={`${batch.id}-${i}`} style={{ backgroundColor: batch.color }}>
                  <td>
                    {batch.year} Year<br/>
                    {batch.semester} Semester<br/>
                    {section}<br/>
                    ({batch.name})
                  </td>
                  {[...Array(9)].map((_, period) => (
                    <td 
                      key={period}
                      onClick={() => onCellClick({
                        day,
                        period: period + 1,
                        batchId: batch.id,
                        section
                      })}
                    >
                      {/* Cell content */}
                    </td>
                  ))}
                  {i === 0 && (
                    <td className="no-print">
                      <button 
                        onClick={() => {/* Add delete logic */}}
                        style={{ margin: '5px 0' }}
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