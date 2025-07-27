import React, { useState, useEffect } from 'react';

const EditPopup = ({ 
  cellData, 
  onClose, 
  onSave, 
  onDelete,
  teachers,
  batchYear,
  batchSemester
}) => {
  const [inputs, setInputs] = useState({ code: '', teachers: [''], rooms: [''] });
  const [errors, setErrors] = useState([]);
  const [courseCodes, setCourseCodes] = useState([]);

  // Fixed room options
  const roomOptions = ['101', '102', '103', '104', '201', '202', '203','HPCL Lab','PG Lab','OS Lab','NW Lab','SW Lab','HW Lab','ACL Lab','Mobile Apps Lab'];
  
  // Generate course codes based on year and semester
  useEffect(() => {
    if (!batchYear || !batchSemester) return;
    
    const yearDigit = batchYear.charAt(0);
    const semesterDigit = batchSemester === 'Odd' ? '1' : '2';
    const baseCode = parseInt(`${yearDigit}${semesterDigit}00`);
    
    const codes = Array.from({ length: 21 }, (_, i) => 
      (baseCode + i).toString()
    );
    
    setCourseCodes(codes);
  }, [batchYear, batchSemester]);

  useEffect(() => {
    if (cellData?.content) {
      setInputs({
        code: cellData.content.code || '',
        teachers: cellData.content.teachers || [''],
        rooms: cellData.content.rooms || ['']
      });
    } else {
      setInputs({ code: '', teachers: [''], rooms: [''] });
    }
  }, [cellData]);

  const validateInputs = () => {
    const newErrors = [];
    const currentPeriod = cellData?.period;
    const currentSection = cellData?.section;
    const codeValue = parseInt(inputs.code);
    const isEvenCode = !isNaN(codeValue) && codeValue % 2 === 0;
    const isLab = isEvenCode;
    const isLecture = !isLab;

    // Sessional Course Validation
    if (isLab) {
      const validSessionalPeriods = [1, 4, 7];
      if (!validSessionalPeriods.includes(currentPeriod)) {
        newErrors.push('Sessional courses (labs) must start at 1st, 4th, or 7th period');
      }
    }

    // Course Code Validation
    if (!inputs.code.trim()) {
      newErrors.push('Course code is required');
    } else if (isNaN(codeValue)) {
      newErrors.push('Course code must be a numeric value');
    } else if (!courseCodes.includes(inputs.code)) {
      newErrors.push('Invalid course code for this batch');
    }

    // Teacher Validation
    const validTeachers = inputs.teachers
      .map(t => t.trim())
      .filter(t => t !== '');

    if (validTeachers.length === 0) {
      newErrors.push(`A teacher can't have more than 2 lectures in ${currentSection}`);
    }

    // Teacher Constraints
    validTeachers.forEach(teacher => {
      const teacherSchedule = cellData.teacherSchedule[teacher] || {};
      
      // Current Section Constraints
      const currentSectionSchedule = teacherSchedule[currentSection] || [];
      
      // Filter lectures and get periods
      const lecturePeriods = currentSectionSchedule
        .filter(item => item.type === 'lecture')
        .map(item => item.period);
      
      // For lectures (odd codes): apply max 2 classes and adjacency constraints
      if (isLecture) {
        const proposedLecturePeriods = [...lecturePeriods, currentPeriod];
        
        // Max 2 lectures in current section
        if (proposedLecturePeriods.length > 2) {
          newErrors.push(`${teacher} can't have more than 2 lectures in ${currentSection}`);
        }
        
        // Consecutive periods if 2 lectures in same section
        if (proposedLecturePeriods.length === 2) {
          const sorted = proposedLecturePeriods.sort((a, b) => a - b);
          if (Math.abs(sorted[0] - sorted[1]) !== 1) {
            newErrors.push(`${teacher}'s lectures in ${currentSection} must be consecutive`);
          }
        }
      }
      
      // For all types: check period conflicts across sections
      Object.entries(teacherSchedule).forEach(([section, scheduleItems]) => {
        if (section !== currentSection) {
          const hasConflict = scheduleItems.some(item => item.period === currentPeriod);
          if (hasConflict) {
            // Using alert as before
            alert(`${teacher} is already teaching in ${section} at this time`);
          }
        }
      });
    });

    // Room Validation
    const validRooms = inputs.rooms
      .map(r => r.trim())
      .filter(r => r !== '');

    if (validRooms.length === 0) {
      newErrors.push('At least one room is required');
    } else if (validRooms.some(room => !roomOptions.includes(room))) {
      newErrors.push('Invalid room selected');
    }

    // Room Availability Check
    validRooms.forEach(room => {
      if (cellData.occupiedRooms[currentPeriod]?.includes(room)) {
        newErrors.push(`${room} is already occupied in period ${currentPeriod}`);
      }
    });

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

  const handleDelete = () => {
    if (window.confirm('Do you want to delete this cell data?')) {
      onDelete();
    }
  };

  return (
    <div className="popup" style={{ 
      padding: '20px',
      border: '2px solid #2b4d37',
      borderRadius: '8px',
      backgroundColor: 'white',
      maxWidth: '500px',
      zIndex: 1000
    }}>
      <h3>Edit Period {cellData?.period}</h3>
      
      {errors.length > 0 && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px',
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ffcccc',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <strong>Validation Errors:</strong>
          {errors.map((error, i) => (
            <div key={i} style={{ margin: '5px 0' }}>• {error}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Course Code:
            <select
              value={inputs.code}
              onChange={e => setInputs(prev => ({ ...prev, code: e.target.value }))}
              style={{
                width: '100%',
                marginTop: '5px',
                padding: '10px',
                border: errors.some(e => e.includes('Course code')) 
                  ? '2px solid red' 
                  : '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <option value="">Select a course code</option>
              {courseCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4>Teachers</h4>
          {inputs.teachers.map((teacher, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={teacher}
                onChange={e => handleChange('teachers', index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: errors.some(e => e.includes(teacher.trim())) 
                    ? '2px solid red' 
                    : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <option value="">Select a teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t.shortName}>
                    {t.shortName} - {t.fullName}
                  </option>
                ))}
              </select>
              {inputs.teachers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('teachers', index)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('teachers')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#2b4d37',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              marginTop: '5px'
            }}
          >
            + Add Teacher
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>Rooms/Labs</h4>
          {inputs.rooms.map((room, index) => (
            <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={room}
                onChange={e => handleChange('rooms', index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: errors.some(e => e.includes(room.trim())) 
                    ? '2px solid red' 
                    : '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <option value="">Select a room</option>
                {roomOptions.map(rm => (
                  <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
              {inputs.rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('rooms', index)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('rooms')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#2b4d37',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              marginTop: '5px'
            }}
          >
            + Add Room
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {cellData?.content && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '12px 20px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Delete Cell
            </button>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 20px',
                backgroundColor: '#2b4d37',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPopup;