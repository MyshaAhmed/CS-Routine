import React, { useState, useEffect } from 'react';

const EditPopup = ({ cellData, onClose, onSave }) => {
  const [courseData, setCourseData] = useState({
    code: '',
    teachers: [''],
    rooms: ['']
  });

  useEffect(() => {
    if (cellData?.content) {
      setCourseData(cellData.content);
    }
  }, [cellData]);

  const handleSave = () => {
    onSave(courseData);
    onClose();
  };

  const addTeacher = () => {
    setCourseData({...courseData, teachers: [...courseData.teachers, '']});
  };

  const addRoom = () => {
    setCourseData({...courseData, rooms: [...courseData.rooms, '']});
  };

  return (
    <div className="popup">
      <h3>Edit Cell</h3>
      <label>Course Code: 
        <input 
          type="text" 
          value={courseData.code}
          onChange={(e) => setCourseData({...courseData, code: e.target.value})}
        />
      </label>
      {/* Add teacher/room inputs */}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default EditPopup;  // Add this line