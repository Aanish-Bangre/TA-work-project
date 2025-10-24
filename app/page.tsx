'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher';
  name: string;
  email: string;
}

interface StudentData {
  [key: string]: any;
}

interface ChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
}

interface ChangeRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  studentSeatNo: string;
  studentName: string;
  changes: ChangeLog[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminComment?: string;
}

export default function Home() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Student search state
  const [seatNo, setSeatNo] = useState('');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [originalStudent, setOriginalStudent] = useState<StudentData | null>(null);
  const [editedStudent, setEditedStudent] = useState<StudentData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [showChanges, setShowChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Request management state
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [view, setView] = useState<'search' | 'requests'>('search');

  // Fetch requests when user logs in or when switching views
  useEffect(() => {
    if (isLoggedIn && user && view === 'requests') {
      fetchRequests();
    }
  }, [isLoggedIn, user, view]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const url = user.role === 'admin' 
        ? '/api/requests'
        : `/api/requests?teacherId=${user.id}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setStudent(null);
    setRequests([]);
    setShowNotifications(false);
    setView('search');
  };

  const searchStudent = async () => {
    if (!seatNo.trim()) {
      setError('Please enter a seat number');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setIsEditing(false);
    setShowChanges(false);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/student?seatNo=${seatNo}`);
      const data = await response.json();

      if (response.ok) {
        setStudent(data);
        setOriginalStudent(JSON.parse(JSON.stringify(data)));
        setEditedStudent(JSON.parse(JSON.stringify(data)));
      } else {
        setError(data.error || 'Student not found');
      }
    } catch (err) {
      setError('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowChanges(false);
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStudent(JSON.parse(JSON.stringify(originalStudent)));
    setChanges([]);
  };

  const handleFieldChange = (field: string, value: any) => {
    if (editedStudent) {
      setEditedStudent({
        ...editedStudent,
        [field]: value === '' ? null : value
      });
    }
  };

  const calculateChanges = () => {
    if (!originalStudent || !editedStudent) return [];
    
    const changesList: ChangeLog[] = [];
    const editableFields = [
      'P1_T', 'P1_I', 'P2_T', 'P2_I', 'P3_T', 'P3_I',
      'P4_T', 'P4_I', 'P5_T', 'P5_I', 'P6_T', 'P6_I',
      'SGP1', 'SGP2', 'SGP3', 'SGP4', 'SGP5', 'SGP6',
      'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
      'CGPA', 'GCGPA'
    ];

    editableFields.forEach(field => {
      if (originalStudent[field] !== editedStudent[field]) {
        changesList.push({
          field,
          oldValue: originalStudent[field],
          newValue: editedStudent[field]
        });
      }
    });

    return changesList;
  };

  const handleSubmitChanges = async () => {
    const changesList = calculateChanges();
    if (changesList.length === 0) {
      setError('No changes detected');
      return;
    }

    if (user?.role === 'teacher') {
      // Teachers submit request to admin
      setLoading(true);
      try {
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: user.id,
            teacherName: user.name,
            studentSeatNo: student?.SEAT_NO,
            studentName: student?.NAME,
            changes: changesList
          })
        });

        if (response.ok) {
          setSuccessMessage('✓ Change request submitted successfully! Waiting for admin approval.');
          setIsEditing(false);
          setChanges([]);
          setTimeout(() => {
            setSuccessMessage('');
            setStudent(null);
            setSeatNo('');
          }, 3000);
        } else {
          setError('Failed to submit request');
        }
      } catch (err) {
        setError('Failed to submit request');
      } finally {
        setLoading(false);
      }
    } else {
      // Admins can directly approve
      setChanges(changesList);
      setShowChanges(true);
      setIsEditing(false);
    }
  };

  const handleApproveChanges = async () => {
    if (user?.role !== 'admin') return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/student', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seatNo: editedStudent?.SEAT_NO,
          updates: editedStudent
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('✓ Changes approved and saved successfully!');
        setStudent(editedStudent);
        setOriginalStudent(JSON.parse(JSON.stringify(editedStudent)));
        setShowChanges(false);
        setChanges([]);
        
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to save changes');
      }
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectChanges = () => {
    setShowChanges(false);
    setChanges([]);
    setEditedStudent(JSON.parse(JSON.stringify(originalStudent)));
  };

  const handleAdminApprove = async (request: ChangeRequest) => {
    setLoading(true);
    try {
      // First, update the request status
      const requestResponse = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          status: 'approved',
          reviewedBy: user?.name,
          adminComment: adminComment
        })
      });

      if (!requestResponse.ok) {
        setError('Failed to update request status');
        setLoading(false);
        return;
      }

      // Then, apply the changes to the student record
      const studentResponse = await fetch(`/api/student?seatNo=${request.studentSeatNo}`);
      const studentData = await studentResponse.json();

      if (studentResponse.ok) {
        // Apply all changes
        const updatedStudent = { ...studentData };
        request.changes.forEach(change => {
          updatedStudent[change.field] = change.newValue;
        });

        // Save updated student data
        await fetch('/api/student', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seatNo: request.studentSeatNo,
            updates: updatedStudent
          })
        });
      }

      setSuccessMessage('✓ Request approved and changes applied!');
      setSelectedRequest(null);
      setAdminComment('');
      fetchRequests();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReject = async (request: ChangeRequest) => {
    setLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          status: 'rejected',
          reviewedBy: user?.name,
          adminComment: adminComment
        })
      });

      if (response.ok) {
        setSuccessMessage('✓ Request rejected!');
        setSelectedRequest(null);
        setAdminComment('');
        fetchRequests();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError('Failed to reject request');
      }
    } catch (err) {
      setError('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStudent();
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">N/A</span>;
    }
    return value;
  };

  const getPendingCount = () => {
    return requests.filter(r => r.status === 'pending').length;
  };

  const getNotificationCount = () => {
    if (user?.role === 'teacher') {
      return requests.filter(r => r.status !== 'pending').length;
    }
    return getPendingCount();
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              🎓 Student Management System
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Login to continue
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Demo Accounts:</p>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Teacher:</strong> teacher1 / teacher123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Student Management System
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user?.name} ({user?.role === 'admin' ? 'Admin' : 'Teacher'})
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setView('search')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  view === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                🔍 Search Student
              </button>
              <button
                onClick={() => setView('requests')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors relative ${
                  view === 'requests'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                📋 {user?.role === 'admin' ? 'Pending Requests' : 'My Requests'}
                {getNotificationCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {getNotificationCount()}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 font-semibold">
            {successMessage}
          </div>
        )}

        {/* Search Student View */}
        {view === 'search' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Search Student Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Enter a seat number to view and {user?.role === 'admin' ? 'edit' : 'request changes to'} student details
              </p>
            </div>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={seatNo}
                    onChange={(e) => setSeatNo(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter Seat Number (e.g., 8103472)"
                    className="flex-1 px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                  />
                  <button
                    onClick={searchStudent}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Student Details - Rest of the student display code stays the same */}
            {student && !showChanges && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Student Header */}
                <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{student.NAME}</h2>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="bg-white/20 px-4 py-2 rounded-lg">
                          Seat No: {student.SEAT_NO}
                        </span>
                        <span className="bg-white/20 px-4 py-2 rounded-lg">
                          College No: {student.COLL_NO}
                        </span>
                        <span className="bg-white/20 px-4 py-2 rounded-lg">
                          Gender: {student.SEX === 1 ? 'Male' : 'Female'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!isEditing ? (
                        <button
                          onClick={handleEdit}
                          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                          ✏️ Edit Marks
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleSubmitChanges}
                            disabled={loading}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400"
                          >
                            📝 Submit {user?.role === 'teacher' ? 'Request' : 'Changes'}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                          >
                            ✖️ Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-3xl">📊</span>
                    Academic Performance
                  </h3>
                  
                  {/* CGPA Section */}
                  {(student.CGPA || student.GCGPA || isEditing) && (
                    <div className="mb-6 p-4 bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(student.CGPA || isEditing) && (
                          <div className="text-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">CGPA</div>
                            {isEditing && editedStudent ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editedStudent.CGPA || ''}
                                onChange={(e) => handleFieldChange('CGPA', parseFloat(e.target.value))}
                                className="text-3xl font-bold text-green-600 dark:text-green-400 bg-white dark:bg-gray-700 border-2 border-green-300 rounded-lg px-4 py-2 w-full text-center"
                              />
                            ) : (
                              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{student.CGPA}</div>
                            )}
                          </div>
                        )}
                        {(student.GCGPA || isEditing) && (
                          <div className="text-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">GCGPA</div>
                            {isEditing && editedStudent ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editedStudent.GCGPA || ''}
                                onChange={(e) => handleFieldChange('GCGPA', parseFloat(e.target.value))}
                                className="text-3xl font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border-2 border-blue-300 rounded-lg px-4 py-2 w-full text-center"
                              />
                            ) : (
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{student.GCGPA}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Semester-wise Grades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((sem) => {
                      const sgp = isEditing ? editedStudent?.[`SGP${sem}`] : student[`SGP${sem}`];
                      const credits = isEditing ? editedStudent?.[`C${sem}`] : student[`C${sem}`];
                      if (sgp || credits || isEditing) {
                        return (
                          <div key={sem} className={`p-4 rounded-xl border ${isEditing ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">Semester {sem}</div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">SGP:</span>
                              {isEditing && editedStudent ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editedStudent[`SGP${sem}`] || ''}
                                  onChange={(e) => handleFieldChange(`SGP${sem}`, parseFloat(e.target.value))}
                                  className="text-lg font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-blue-300 rounded px-2 py-1 w-20 text-right"
                                />
                              ) : (
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{renderValue(sgp)}</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Credits:</span>
                              {isEditing && editedStudent ? (
                                <input
                                  type="number"
                                  value={editedStudent[`C${sem}`] || ''}
                                  onChange={(e) => handleFieldChange(`C${sem}`, parseFloat(e.target.value))}
                                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 rounded px-2 py-1 w-20 text-right"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{renderValue(credits)}</span>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Subject-wise Marks */}
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 mt-8">
                    <span className="text-3xl">📚</span>
                    Subject-wise Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((paper) => {
                      const paperCode = student[`P${paper}_CD`];
                      const theory = isEditing ? editedStudent?.[`P${paper}_T`] : student[`P${paper}_T`];
                      const internal = isEditing ? editedStudent?.[`P${paper}_I`] : student[`P${paper}_I`];
                      
                      if (paperCode || theory || internal || isEditing) {
                        return (
                          <div key={paper} className={`p-4 rounded-xl border shadow-sm ${isEditing ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' : 'bg-linear-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-gray-200 dark:border-gray-600'}`}>
                            <div className="font-semibold text-gray-800 dark:text-white mb-2">
                              Paper {paper} {paperCode && `(Code: ${paperCode})`}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Theory:</span>
                                {isEditing && editedStudent ? (
                                  <input
                                    type="number"
                                    value={editedStudent[`P${paper}_T`] || ''}
                                    onChange={(e) => handleFieldChange(`P${paper}_T`, parseInt(e.target.value))}
                                    className="ml-2 font-semibold text-gray-800 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 rounded px-2 py-1 w-16"
                                  />
                                ) : (
                                  <span className="ml-2 font-semibold text-gray-800 dark:text-white">{renderValue(theory)}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Internal:</span>
                                {isEditing && editedStudent ? (
                                  <input
                                    type="number"
                                    value={editedStudent[`P${paper}_I`] || ''}
                                    onChange={(e) => handleFieldChange(`P${paper}_I`, parseInt(e.target.value))}
                                    className="ml-2 font-semibold text-gray-800 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 rounded px-2 py-1 w-16"
                                  />
                                ) : (
                                  <span className="ml-2 font-semibold text-gray-800 dark:text-white">{renderValue(internal)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Result Status */}
                  {(student.RSLT || student.RES || student.FREM) && (
                    <div className="mt-6 p-4 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Result Status</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        {student.RSLT && (
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Result</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{student.RSLT}</div>
                          </div>
                        )}
                        {student.RES && (
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">RES</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{student.RES}</div>
                          </div>
                        )}
                        {student.FREM && (
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">FREM</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{student.FREM}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Changes Review Modal (for admins only) */}
            {showChanges && changes.length > 0 && user?.role === 'admin' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-linear-to-r from-orange-600 to-red-600 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">⚠️ Review Changes</h2>
                  <p className="text-sm">Please review the following changes before approving</p>
                </div>

                <div className="p-6">
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-semibold mb-2">
                      <span className="text-2xl">ℹ️</span>
                      <span>Student: {student?.NAME} (Seat No: {student?.SEAT_NO})</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Total changes detected: <span className="font-bold">{changes.length}</span>
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {changes.map((change, index) => (
                      <div key={index} className="p-4 bg-linear-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border-l-4 border-orange-500">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {formatFieldName(change.field)}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Database Value</div>
                              <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-semibold line-through">
                                {renderValue(change.oldValue)}
                              </div>
                            </div>
                            <div className="text-2xl">→</div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">New Value</div>
                              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-semibold">
                                {renderValue(change.newValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={handleApproveChanges}
                      disabled={loading}
                      className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <span className="text-2xl">✓</span>
                      {loading ? 'Saving...' : 'Approve & Save Changes'}
                    </button>
                    <button
                      onClick={handleRejectChanges}
                      disabled={loading}
                      className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <span className="text-2xl">✖</span>
                      Reject Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Requests View */}
        {view === 'requests' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {user?.role === 'admin' ? 'Change Requests from Teachers' : 'My Change Requests'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {user?.role === 'admin' 
                  ? 'Review and approve/reject change requests' 
                  : 'Track the status of your submitted requests'}
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  No Requests Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {user?.role === 'admin' 
                    ? 'No pending requests from teachers at the moment.' 
                    : 'You haven\'t submitted any change requests yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className={`p-6 ${
                      request.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      request.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                      'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {request.studentName} (Seat: {request.studentSeatNo})
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg">
                              Teacher: {request.teacherName}
                            </span>
                            <span className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg">
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </span>
                            <span className={`px-3 py-1 rounded-lg font-semibold ${
                              request.status === 'pending' ? 'bg-yellow-500 text-white' :
                              request.status === 'approved' ? 'bg-green-500 text-white' :
                              'bg-red-500 text-white'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        {user?.role === 'admin' && request.status === 'pending' && (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                          >
                            Review Request
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-3">Changes ({request.changes.length}):</h4>
                      <div className="space-y-2">
                        {request.changes.map((change, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {formatFieldName(change.field)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 dark:text-red-400 line-through">{renderValue(change.oldValue)}</span>
                              <span>→</span>
                              <span className="text-green-600 dark:text-green-400 font-bold">{renderValue(change.newValue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {request.status !== 'pending' && request.adminComment && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Admin Comment:</p>
                          <p className="text-gray-600 dark:text-gray-400">{request.adminComment}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Reviewed by {request.reviewedBy} on {request.reviewedAt && new Date(request.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Admin Review Modal */}
            {selectedRequest && user?.role === 'admin' && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Review Change Request</h2>
                    <p className="text-sm">{selectedRequest.studentName} - {selectedRequest.studentSeatNo}</p>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-3">Requested Changes:</h3>
                      <div className="space-y-2">
                        {selectedRequest.changes.map((change, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{formatFieldName(change.field)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-red-600 line-through">{renderValue(change.oldValue)}</span>
                                <span>→</span>
                                <span className="text-green-600 font-bold">{renderValue(change.newValue)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Admin Comment (Optional)
                      </label>
                      <textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        placeholder="Add a comment..."
                      />
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleAdminApprove(selectedRequest)}
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:bg-gray-400"
                      >
                        ✓ Approve & Apply Changes
                      </button>
                      <button
                        onClick={() => handleAdminReject(selectedRequest)}
                        disabled={loading}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:bg-gray-400"
                      >
                        ✖ Reject Request
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(null);
                          setAdminComment('');
                        }}
                        className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
