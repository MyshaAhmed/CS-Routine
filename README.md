# 📅 RUET Routine Management System

A **full-stack MERN** (MongoDB, Express.js, React.js, Node.js) web application for automating and managing class schedules at **Rajshahi University of Engineering & Technology (RUET)**. This project modernizes the traditional, manual routine creation process by introducing an interactive, dynamic, and conflict-aware web-based platform.

![Reference Routine](./assets/ruet.png)  
*Official Routine Reference*

![Dynamic Routine](./assets/cs_routine.png)  
*Web-based Generated Routine*

---

## 🚀 Features

### 📚 Routine Structure & Constraints
- **Batches & Sections**: Supports all 4 academic years with Sections A, B, and C.
- **Room & Lab Management**:
  - 7 Classrooms: `101`, `102`, `103`, `104`, `201`, `202`, `203`
  - 8 Labs: `HPCL`, `PG Lab`, `OS Lab`, `NW Lab`, `SW Lab`, `HW Lab`, `ACL`, `Mobile Apps Lab`
  - Labs have a max capacity of **30 students**
- **Time Constraints**:
  - Weekends: **Thursday & Friday** off
  - Breaks: `10:30 AM – 10:50 AM` and `1:20 PM – 2:30 PM`
  - Courses: 5 theory + multiple lab sessions (1.5 or 0.75 credit)


### ⚙️ Dynamic Routine Management
- **Add Batch Button**:
   - Adding a batch auto-generates rows for its 3 sections. Means adding a single batch will create a row for 3 sections (A,B and C)
- **Delete Batch Button**:
   - Deletes that particular batch from all days (SAT-WED).
- **Edit Cell**:
   - When a single cell is clicked, an EditCell popup will show, where we can edit and add cell information like course code, teacher's name, room/lab and also add more teachers taking a single course.
   - "To clear information of a cell we need to manually clear the edit cell data and reenter new cell data, as delete cell feature is not yet implemented."
- **Real-time Conflict Detection**:
  - Duplicate teachers or rooms flagged in a **"Duplicates"** column
  - Duplicate input of a teacher or if the classes overlap at different rooms and sections, if such entry is given, it will show conflict
  - A teacher can have at most 2 classes a day and it has to be in adjacent periods, if not, it will show conflict
  - Lab classes(even code) must be taken at the 1st, 4th or 7th period. Lab classes will occupy 3 consecutive periods.  
- **Teacher Constraints**:
  - A single teacher can take max 2 classes a day per section, must be **adjacent periods**
  - A single teacher can't take classes at different sections at the same period [time]. If such entry is given, it will show conflict.
- **Room Constraints**:
  - Two different classes can not be taken in the same room at the same time. If such entry is given, it will show conflict.
- **Interactive Editing**:
  - Click on a routine cell to open a popup for editing
- **Routine Export (Download)**:
  - Export full routine as **PDF** upon clicking download button
- **Print Routine**:
  - Full Routine can be printed upon clicking Print Routine button
- **Seniority Sorting**:
  - Whenever a new batch entry is given, routine sorts in order: 4th year → 3rd year→ 2nd → 1st

---

## 🛠️ Tech Stack

| Layer       | Tech                     |
|-------------|--------------------------|
| Frontend    | React.js, JavaScript     |
| Backend     | Node.js, Express.js      |
| Database    | MongoDB (NoSQL)          |
| Deployment  | Microsoft Azure (Cloud)  |

---

## 🎯 Project Objectives
- Eliminate manual routine creation errors
- Minimize room/teacher conflicts
- Simplify schedule updates and modifications
- Enable efficient classroom/lab utilization
- Deploying a scalable and user-friendly application

---

## ✅ Outcomes
- 📉 Reduced manual routine creation errors
- 📈 Increased efficiency and room utilization
- 🧠 Smart conflict resolution
- 🎯 Flexible scheduling with minimal errors
- 🖱️ Seamless UI/UX for admins

---

## 📸 Screenshots

### 🗂 Reference Routine (Manual System)
> Screenshot of official RUET routine used for design reference.

![Reference Routine](./assets/ruet.png)

### 📊 Generated Routine (Web-Based System)
> Dynamically created routine with real-time editing, conflict management, and slot visualization.

![Dynamic Routine](./assets/cs_routine.png)

---

## ✍️ Created By

**Mysha Ahmed**
- CSE'20
- Department of Computer Science & Engineering
- **Rajshahi University of Engineering & Technology (RUET)**


