import React, { useState } from 'react';

const TeacherPopup = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    designation: '',
    department: '',
    university: 'RUET'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.shortName) {
      alert('Full Name and Short Name are required');
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
      border: '3px solid #2b4d37',
      width: '400px',
      maxWidth: '90%'
    }}>
      <h3>Add Teacher Information</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Full Name:
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required
              style={{ width: '50%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            Short Name (for display):
            <input
              type="text"
              value={formData.shortName}
              onChange={e => setFormData({...formData, shortName: e.target.value})}
              required
              style={{ width: '96%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            Designation:
            <input
              type="text"
              value={formData.designation}
              onChange={e => setFormData({...formData, designation: e.target.value})}
              required
              style={{ width: '96%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            Department:
            <input
              type="text"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
              required
              style={{ width: '96%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            University:
            <input
              type="text"
              value={formData.university}
              onChange={e => setFormData({...formData, university: e.target.value})}
              required
              style={{ width: '96%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '8px 20px',
              backgroundColor: '#2b4d37',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherPopup;