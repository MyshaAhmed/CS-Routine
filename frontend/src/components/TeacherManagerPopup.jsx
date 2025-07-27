import React, { useState } from 'react';

const TeacherManagerPopup = ({ teachers, onAdd, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    designation: '',
    department: '',
    university: 'RUET'
  });
  
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.shortName) {
      alert('Full Name and Short Name are required');
      return;
    }
    onAdd(formData);
    setFormData({
      fullName: '',
      shortName: '',
      designation: '',
      department: '',
      university: 'RUET'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await onDelete(id);
      } catch (error) {
        alert('Failed to delete teacher. Please try again.');
      }
    }
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
      width: '600px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3>Teacher Management</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
          &times;
        </button>
      </div>
      
      <div style={{ display: 'flex',justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'add' ? '#2b4d37' : '#f0f0f0',
            color: activeTab === 'add' ? 'white' : '#333',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Teacher
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'manage' ? '#2b4d37' : '#f0f0f0',
            color: activeTab === 'manage' ? 'white' : '#333',
            border: 'none',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Manage Teachers
        </button>
      </div>
      
      {activeTab === 'add' ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>
              Full Name:
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                required
                style={{ width: '100%', padding: '8px' }}
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
                style={{ width: '100%', padding: '8px' }}
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
                style={{ width: '100%', padding: '8px' }}
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
                style={{ width: '100%', padding: '8px' }}
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
                style={{ width: '100%', padding: '8px' }}
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
              Add Teacher
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h4>Teacher List</h4>
          {teachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Short Name</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Full Name</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Designation</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(teacher => (
                    <tr key={teacher._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{teacher.shortName}</td>
                      <td style={{ padding: '10px' }}>{teacher.fullName}</td>
                      <td style={{ padding: '10px' }}>{teacher.designation}</td>
                      <td style={{ padding: '10px' }}>{teacher.department}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherManagerPopup;