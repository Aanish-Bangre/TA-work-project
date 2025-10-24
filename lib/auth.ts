// Predefined users for the system
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher';
  name: string;
  email: string;
}

export const users: User[] = [
  // Admins
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@spit.edu'
  },
  {
    id: 'admin2',
    username: 'principal',
    password: 'principal123',
    role: 'admin',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@spit.edu'
  },
  
  // Teachers
  {
    id: 'teacher1',
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    name: 'Prof. Amit Desai',
    email: 'amit.desai@spit.edu'
  },
  {
    id: 'teacher2',
    username: 'teacher2',
    password: 'teacher123',
    role: 'teacher',
    name: 'Prof. Sneha Patil',
    email: 'sneha.patil@spit.edu'
  },
  {
    id: 'teacher3',
    username: 'teacher3',
    password: 'teacher123',
    role: 'teacher',
    name: 'Prof. Arjun Mehta',
    email: 'arjun.mehta@spit.edu'
  }
];

export function authenticateUser(username: string, password: string): User | null {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
}

export function getUserById(id: string): User | null {
  return users.find(u => u.id === id) || null;
}
