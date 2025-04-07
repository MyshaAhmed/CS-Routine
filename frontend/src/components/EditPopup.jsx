import React, { useState, useEffect } from 'react';

const EditPopup = ({ cellData, onClose, onSave }) => {
  const [inputs, setInputs] = useState({ code: '', teachers: [''], rooms: [''] });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (cellData?.content) {
      setInputs({
        code: cellData.content.code || '',
        teachers: cellData.content.teachers || [''],
        rooms: cellData.content.rooms || ['']
      });
    }
  }, [cellData]);

  const validateInputs = () => {
    const newErrors = [];
    const currentPeriod = cellData?.period;
    const currentSection = cellData?.section;
    const codeValue = parseInt(inputs.code.split(' ').pop());
    const isEvenCode = !isNaN(codeValue) && codeValue % 2 === 0;

    // Sessional Course Validation
    if (isEvenCode) {
      const validSessionalPeriods = [1, 4, 7];
      if (!validSessionalPeriods.includes(currentPeriod)) {
        newErrors.push('Sessional courses must start at 1st, 4th, or 7th period');
      }
    }

    // Course Code Validation
    if (!inputs.code.trim()) {
      newErrors.push('Course code is required');
    } else if (isNaN(codeValue)) {
      newErrors.push('Course code must contain a numeric value');
    }

    // Teacher Validation
    const validTeachers = inputs.teachers
      .map(t => t.trim())
      .filter(t => t !== '');

    if (validTeachers.length === 0) {
      newErrors.push('At least one teacher is required');
    }

    // Teacher Constraints
    validTeachers.forEach(teacher => {
      const teacherSchedule = cellData.teacherSchedule[teacher] || {};
      
      // Current Section Constraints
      const currentSectionPeriods = teacherSchedule[currentSection] || [];
      const proposedCurrentPeriods = [...currentSectionPeriods, currentPeriod];
      
      // Max 2 classes in current section
      if (proposedCurrentPeriods.length > 2) {
        newErrors.push(`${teacher} can't have more than 2 classes in ${currentSection}`);
      }
      
      // Consecutive periods if 2 classes in same section
      if (proposedCurrentPeriods.length === 2) {
        const sorted = proposedCurrentPeriods.sort((a, b) => a - b);
        if (Math.abs(sorted[0] - sorted[1]) !== 1) {
          newErrors.push(`${teacher}'s classes in ${currentSection} must be consecutive`);
        }
      }

      // Check other sections for same period
      Object.entries(teacherSchedule).forEach(([section, periods]) => {
        if (section !== currentSection && periods.includes(currentPeriod)) {
          //newErrors.push(`${teacher} is already teaching in ${section} at this time`);
          alert(`${teacher} is already teaching in ${section} at this time`);
        }
      });
    });

    // Room Validation
    const validRooms = inputs.rooms
      .map(r => r.trim())
      .filter(r => r !== '');

    if (validRooms.length === 0) {
      newErrors.push('At least one room is required');
    }

    // Room Availability Check
    validRooms.forEach(room => {
      if (cellData.occupiedRooms[currentPeriod]?.includes(room)) {
        newErrors.push(`${room} is already occupied in period ${currentPeriod}`);
      }
    });

    // Sessional Course Validation
    if (!isNaN(codeValue)) {
      const isEven = codeValue % 2 === 0;
      const validSessionalPeriods = [1, 4, 7];
      
      if (isEven && !validSessionalPeriods.includes(currentPeriod)) {
        alert('Sessional courses must be placed at 1st, 4th, or 7th period');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleChange = (type, index, value) => {
    setInputs(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const addField = (type) => {
    setInputs(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removeField = (type, index) => {
    if (inputs[type].length > 1) {
      setInputs(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      onSave({
        validData: {
          code: inputs.code.trim(),
          teachers: inputs.teachers.map(t => t.trim()).filter(t => t),
          rooms: inputs.rooms.map(r => r.trim()).filter(r => r)
        }
      });
    }
  };

  return (
    <div className="popup" style={{ 
      padding: '20px',
      border: '2px solid #2b4d37',
      borderRadius: '8px',
      backgroundColor: 'white',
      maxWidth: '400px'
    }}>
      <h3>Edit Period {cellData?.period}</h3>
      
      {errors.length > 0 && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {errors.map((error, i) => (
            <div key={i} style={{ margin: '5px 0' }}>• {error}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Course Code:
            <input
              type="text"
              value={inputs.code}
              onChange={(e) => setInputs(prev => ({ ...prev, code: e.target.value }))}
              style={{
                width: '100%',
                marginTop: '5px',
                padding: '8px',
                border: errors.some(e => e.includes('Course code')) 
                  ? '2px solid red' 
                  : '1px solid #ccc'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4>Teachers</h4>
          {inputs.teachers.map((teacher, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={teacher}
                onChange={(e) => handleChange('teachers', index, e.target.value)}
                placeholder={`Teacher ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: errors.some(e => e.includes(teacher.trim())) 
                    ? '2px solid red' 
                    : '1px solid #ccc'
                }}
              />
              {inputs.teachers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('teachers', index)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('teachers')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#2b4d37',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Add Teacher
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>Rooms/Labs</h4>
          {inputs.rooms.map((room, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={room}
                onChange={(e) => handleChange('rooms', index, e.target.value)}
                placeholder={`Room ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: errors.some(e => e.includes(room.trim())) 
                    ? '2px solid red' 
                    : '1px solid #ccc'
                }}
              />
              {inputs.rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('rooms', index)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('rooms')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#2b4d37',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Add Room
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2b4d37',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPopup;