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
  const [inputs, setInputs] = useState({ 
    courses: [{ code: '', teachers: [''], rooms: [''] }] 
  });
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
      // Handle both string and object formats
      if (typeof cellData.content === 'string') {
        // Parse string format
        const lines = cellData.content.split('\n');
        const codeLine = lines[0] || '';
        const teacherLine = lines[1] || '';
        const roomLine = lines[2] || '';
        
        const codes = codeLine.split('/');
        const teacherGroups = teacherLine.split('/').map(group => 
          group.replace(/[()]/g, '').split('/').filter(t => t)
        );
        const rooms = roomLine.split('/');
        
        const courses = codes.map((code, i) => ({
          code: code.trim(),
          teachers: teacherGroups[i] || [''],
          rooms: rooms[i] ? [rooms[i].trim()] : ['']
        }));
        
        setInputs({ courses });
      } else {
        // Handle object format
        setInputs({
          courses: [{
            code: cellData.content.code || '',
            teachers: cellData.content.teachers || [''],
            rooms: cellData.content.rooms || ['']
          }]
        });
      }
    } else {
      setInputs({ courses: [{ code: '', teachers: [''], rooms: [''] }] });
    }
  }, [cellData]);

  const validateInputs = () => {
    const newErrors = [];
    const currentPeriod = cellData?.period;
    const currentSection = cellData?.section;
    const isLabPeriod = [1, 4, 7].includes(currentPeriod);

    // Course Validation
    inputs.courses.forEach((course, index) => {
      const codeValue = parseInt(course.code);
      const isLabCourse = !isNaN(codeValue) && codeValue % 2 === 0;
      
      // Course Code Validation
      if (!course.code.trim()) {
        newErrors.push(`Course ${index+1}: Code is required`);
      } else if (isNaN(codeValue)) {
        newErrors.push(`Course ${index+1}: Code must be numeric`);
      } else if (!courseCodes.includes(course.code)) {
        newErrors.push(`Course ${index+1}: Invalid course code`);
      }
      
      // Lab Course Validation: only sessional courses must be in lab periods
      if (isLabCourse && !isLabPeriod) {
        newErrors.push(`Course ${index+1}: Sessional courses (even codes) must be placed in lab periods (1,4,7)`);
      }

      // Teacher Validation
      const validTeachers = course.teachers
        .map(t => t.trim())
        .filter(t => t !== '');

      if (validTeachers.length === 0) {
        newErrors.push(`Course ${index+1}: At least one teacher required`);
      }

      // Teacher Constraints
      validTeachers.forEach(teacher => {
        const teacherSchedule = cellData.contentObject?.teacherSchedule?.[teacher] || {};
        const currentSectionSchedule = teacherSchedule[currentSection] || [];
        
        // Filter lectures and get periods
        const lecturePeriods = currentSectionSchedule
          .filter(item => item.type === 'lecture')
          .map(item => item.period);
        
        // For lectures: apply max 2 classes and adjacency constraints
        if (!isLabCourse) {
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
        
        // Period conflicts across sections
        Object.entries(teacherSchedule).forEach(([section, scheduleItems]) => {
          if (section !== currentSection) {
            const hasConflict = scheduleItems.some(item => item.period === currentPeriod);
            if (hasConflict) {
              alert(`${teacher} is already teaching in ${section} at this time`);
            }
          }
        });
      });

      // Room Validation
      const validRooms = course.rooms
        .map(r => r.trim())
        .filter(r => r !== '');

      if (validRooms.length === 0) {
        newErrors.push(`Course ${index+1}: At least one room required`);
      } else if (validRooms.some(room => !roomOptions.includes(room))) {
        newErrors.push(`Course ${index+1}: Invalid room selected`);
      }

      // Room Availability Check
      validRooms.forEach(room => {
        if (cellData.contentObject?.occupiedRooms?.[currentPeriod]?.includes(room)) {
          newErrors.push(`${room} is occupied in period ${currentPeriod}`);
        }
      });
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCourseChange = (courseIndex, field, value) => {
    setInputs(prev => ({
      courses: prev.courses.map((course, i) => 
        i === courseIndex ? { ...course, [field]: value } : course
      )
    }));
  };

  const handleFieldChange = (courseIndex, field, fieldIndex, value) => {
    setInputs(prev => ({
      courses: prev.courses.map((course, i) => 
        i === courseIndex ? {
          ...course, 
          [field]: course[field].map((item, j) => 
            j === fieldIndex ? value : item
          )
        } : course
      )
    }));
  };

  const addCourse = () => {
    setInputs(prev => ({
      courses: [...prev.courses, { code: '', teachers: [''], rooms: [''] }]
    }));
  };

  const removeCourse = (index) => {
    if (inputs.courses.length > 1) {
      setInputs(prev => ({
        courses: prev.courses.filter((_, i) => i !== index)
      }));
    }
  };

  const addField = (courseIndex, field) => {
    setInputs(prev => ({
      courses: prev.courses.map((course, i) => 
        i === courseIndex ? {
          ...course, 
          [field]: [...course[field], '']
        } : course
      )
    }));
  };

  const removeField = (courseIndex, field, fieldIndex) => {
    setInputs(prev => ({
      courses: prev.courses.map((course, i) => 
        i === courseIndex ? {
          ...course, 
          [field]: course[field].filter((_, j) => j !== fieldIndex)
        } : course
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      // Format data for saving
      const codeLine = inputs.courses.map(c => c.code).join('/');
      
      const teacherLine = inputs.courses.map(course => {
        const teachers = course.teachers.filter(t => t.trim());
        return teachers.length > 1 ? `(${teachers.join('/')})` : teachers[0] || '';
      }).join('/');
      
      const roomLine = inputs.courses.map(course => 
        course.rooms.filter(r => r.trim()).join('/')
      ).join('/');
      
      onSave({
        validData: {
          code: codeLine,
          teachers: inputs.courses.flatMap(c => c.teachers.filter(t => t.trim())),
          rooms: inputs.courses.flatMap(c => c.rooms.filter(r => r.trim()))
        }
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Do you want to delete this cell data?')) {
      onDelete();
    }
  };

  const isLabPeriod = [1, 4, 7].includes(cellData?.period);

  return (
    <div className="popup" style={{ 
      padding: '20px',
      border: '2px solid #2b4d37',
      borderRadius: '8px',
      backgroundColor: 'white',
      maxWidth: '500px',
      zIndex: 1000,
      maxHeight: '90vh',
      overflowY: 'auto'
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
        {inputs.courses.map((course, courseIndex) => (
          <div key={courseIndex} style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            border: '1px solid #ddd',
            borderRadius: '5px',
            position: 'relative'
          }}>
            <h4>Course {courseIndex + 1}</h4>
            
            {inputs.courses.length > 1 && (
              <button
                type="button"
                onClick={() => removeCourse(courseIndex)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Remove Course
              </button>
            )}
            
            <div style={{ marginBottom: '15px' }}>
              <label>
                Course Code:
                <select
                  value={course.code}
                  onChange={e => handleCourseChange(courseIndex, 'code', e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '5px',
                    padding: '10px',
                    border: errors.some(e => e.includes(`Course ${courseIndex + 1}`)) 
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
              {course.teachers.map((teacher, teacherIndex) => (
                <div key={teacherIndex} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={teacher}
                    onChange={e => handleFieldChange(courseIndex, 'teachers', teacherIndex, e.target.value)}
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
                  {course.teachers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(courseIndex, 'teachers', teacherIndex)}
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
                onClick={() => addField(courseIndex, 'teachers')}
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

            <div style={{ marginBottom: '15px' }}>
              <h4>Rooms/Labs</h4>
              {course.rooms.map((room, roomIndex) => (
                <div key={roomIndex} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={room}
                    onChange={e => handleFieldChange(courseIndex, 'rooms', roomIndex, e.target.value)}
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
                  {course.rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(courseIndex, 'rooms', roomIndex)}
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
                onClick={() => addField(courseIndex, 'rooms')}
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
          </div>
        ))}

        {isLabPeriod && (
          <button
            type="button"
            onClick={addCourse}
            style={{
              padding: '12px 20px',
              backgroundColor: '#3a5f73',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '20px'
            }}
          >
            + Add Course
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {cellData?.content && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '12px 14px',
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
                padding: '12px 27px',
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
                padding: '12px 27px',
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