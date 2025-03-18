import React, { useState } from 'react';

const BatchPopup = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    year: '1st',
    semester: 'Odd',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a batch name');
      return;
    }
    onAdd(formData);
  };

  return (
    <div className="popup" style={{ 
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      border: '2px solid #2b4d37'
    }}>
      <h3>Enter Batch Details</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Year: 
          <select 
            value={formData.year}
            onChange={e => setFormData({...formData, year: e.target.value})}
          >
            {['1st', '2nd', '3rd', '4th'].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <br />
        
        <label>
          Semester: 
          <select 
            value={formData.semester}
            onChange={e => setFormData({...formData, semester: e.target.value})}
          >
            {['Odd', 'Even'].map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </label>
        <br />
        
        <label>
          Batch Name: 
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
        </label>
        <br />
        
        <div style={{ marginTop: '15px' }}>
          <button type="submit">Add</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchPopup;