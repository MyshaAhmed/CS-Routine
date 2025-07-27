import React from 'react';
import html2pdf from 'html2pdf.js';

const PrintControls = ({ onAddBatch, onPrint, onDownloadPDF, onAddTeacher,onManageTeachers }) => {
  return (
    <div className="add-batch-div" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <button 
        className="add-batch-btn" 
        onClick={onAddBatch}
        style={{ padding: '8px 16px' }}
      >
        Add Batch
      </button>
      
      <button 
        className="print-btn" 
        onClick={onPrint}
        style={{ padding: '8px 16px' }}
      >
        Print Routine
      </button>
      
      <button 
        className="print-btn" 
        onClick={onDownloadPDF}
        style={{ padding: '8px 16px' }}
      >
        Download PDF
      </button>
      
      <button 
        className="add-teacher-btn" 
        onClick={onAddTeacher}
        style={{ 
          padding: '8px 16px',
          backgroundColor: '#3a5f73',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Add Teacher
      </button>

      {/* <button 
        className="manage-teachers-btn" 
        onClick={onManageTeachers}
        style={{ 
          padding: '8px 16px',
          backgroundColor: '#5a3d5a',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Manage Teachers
      </button> */}
    </div>
  );
};

export default PrintControls;