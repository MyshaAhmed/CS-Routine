import React from 'react';
import html2pdf from 'html2pdf.js';

const PrintControls = ({ onAddBatch, onPrint, onDownloadPDF }) => {
  return (
    <div className="add-batch-div">
      <button 
        className="add-batch-btn" 
        onClick={onAddBatch}
      >
        Add Batch
      </button>
      
      <button 
        className="print-btn" 
        onClick={onPrint}
      >
        Print Routine
      </button>
      
      <button 
        className="print-btn" 
        onClick={onDownloadPDF}
      >
        Download PDF
      </button>
    </div>
  );
};

export default PrintControls;