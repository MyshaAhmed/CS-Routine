import React from 'react';

const BatchPopup = ({ onClose, onAdd }) => {
  const [batchData, setBatchData] = React.useState({
    year: '1st',
    semester: 'Odd',
    name: ''
  });

  const handleSubmit = () => {
    onAdd(batchData);
    onClose();
  };

  return (
    <div className="popup">
      <h3>Enter Batch Details</h3>
      <label>Year: 
        <select 
          value={batchData.year} 
          onChange={(e) => setBatchData({...batchData, year: e.target.value})}
        >
          <option>1st</option>
          <option>2nd</option>
          <option>3rd</option>
          <option>4th</option>
        </select>
      </label><br />
      <label>Semester: 
        <select 
          value={batchData.semester}
          onChange={(e) => setBatchData({...batchData, semester: e.target.value})}
        >
          <option>Odd</option>
          <option>Even</option>
        </select>
      </label><br />
      <label>Batch Name: 
        <input 
          type="text" 
          value={batchData.name}
          onChange={(e) => setBatchData({...batchData, name: e.target.value})}
        />
      </label><br />
      <button onClick={handleSubmit}>Add</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default BatchPopup;  // Add this line