# 🎓 Student Information Management System

A Next.js-based web application for managing student academic records with role-based access control for teachers and administrators.

## ✨ Features

### 🔐 Authentication System
- Role-based login (Admin & Teacher)
- Pre-defined user accounts
- Secure session management

### 👨‍💼 Admin Dashboard
- Search and view student records
- Direct edit capabilities
- Review and approve/reject teacher requests
- Add comments to requests
- Permanent database updates

### 👨‍🏫 Teacher Dashboard
- Search student by seat number
- View complete student details
- Submit edit requests to admin
- Track request status (Pending/Approved/Rejected)
- Receive notifications on request updates

### 📊 Student Data Management
- Display complete student information
- Semester-wise performance tracking
- Subject-wise marks (Theory & Internal)
- CGPA and credit management
- Excel-based data storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/buildingform.git
cd buildingform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 👥 Demo Accounts

### Admins
- Username: `admin` | Password: `admin123` - Dr. Rajesh Kumar
- Username: `principal` | Password: `principal123` - Dr. Priya Sharma

### Teachers
- Username: `teacher1` | Password: `teacher123` - Prof. Amit Desai
- Username: `teacher2` | Password: `teacher123` - Prof. Sneha Patil
- Username: `teacher3` | Password: `teacher123` - Prof. Arjun Mehta

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Storage:** Excel (xlsx)
- **Libraries:** 
  - xlsx - Excel file manipulation
  - dbfread - DBF file reading

## 📁 Project Structure

```
buildingform/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── students/
│   │   └── requests/
│   ├── page.tsx
│   └── layout.tsx
├── public/
│   └── BMS6T.xlsx
├── datasets/
│   └── code.py
└── package.json
```

## 🔄 Workflow

### Teacher Workflow:
1. Login with teacher credentials
2. Search student by seat number
3. Edit marks and submit request
4. Track request status in "My Requests"

### Admin Workflow:
1. Login with admin credentials
2. View pending requests notification
3. Review changes (old vs new values)
4. Add comments and approve/reject
5. Changes automatically applied to database

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

Built as part of TA Work Project at SPIT