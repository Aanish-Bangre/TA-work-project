# Form Builder App

A comprehensive student data management system with role-based authentication, change request workflow, and document generation capabilities.

## 🚀 Features

### Authentication System
- **Role-based access control** (Admin & Coordinator)
- **Department-based login** for Admins (Science & Technology, Commerce & Management, Interdisciplinary, Humanities)
- **JWT authentication** with HTTP-only cookies
- **Protected routes** with middleware

### Coordinator Features
- 🔍 **Search students** by session and seat number
- 📝 **Edit student records** (RLE/RPV status, semester credits & SGPs)
- 📤 **Submit change requests** for admin approval
- 👀 **Track submission status** (pending/approved/rejected)
- 📄 **Generate documents** for approved records
- 🖨️ **Print preview** with editable fields

### Admin Features
- ✅ **Review change requests** by department
- ✔️ **Approve/Reject** with optional comments
- 📊 **Auto-update student records** on approval
- 🔍 **View detailed changes** in human-readable format

### Document Generation
- 📄 **DOCX template** support with dynamic placeholders
- 🖊️ **Editable preview** before printing
- 🖨️ **Print functionality** with optimized layout
- 💾 **Download as Word document**

## 🛠️ Tech Stack

- **Framework:** Next.js 16.0.3 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT with HTTP-only cookies
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **Styling:** Tailwind CSS
- **Document Generation:** docxtemplater + pizzip
- **Theme:** next-themes (Dark/Light mode)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd formbuilder2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Set up the database

Run the SQL scripts in your Supabase SQL Editor:

1. **Users Table:** `database/users_table.sql`
2. **Students Table:** (Your existing table structure)
3. **Change Requests Table:** (Create using the columns shown in project)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗂️ Project Structure

```
formbuilder2/
├── app/
│   ├── admin/
│   │   ├── approvals/         # Admin approval page
│   │   └── dashboard/         # Admin dashboard
│   ├── coordinator/
│   │   ├── students/          # Student search & edit
│   │   ├── submissions/       # Track change requests
│   │   ├── preview-document/  # Document preview & print
│   │   └── dashboard/         # Coordinator dashboard
│   ├── api/
│   │   ├── auth/             # Login, logout, verify endpoints
│   │   ├── students/         # Student data API
│   │   ├── change-requests/  # Change request management
│   │   ├── generate-result/  # DOCX generation
│   │   └── preview-document/ # Preview data API
│   ├── login/                # Login page
│   └── layout.tsx            # Root layout with theme provider
├── components/
│   ├── ui/                   # shadcn components
│   ├── navbar.tsx            # Main navigation
│   └── theme-toggle.tsx      # Dark/Light mode toggle
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── jwt.ts               # JWT utilities
│   └── utils.ts             # Helper functions
├── templates/
│   └── result_template.docx  # Document template
├── database/
│   ├── users_table.sql       # User schema & demo data
│   └── README.md             # Database setup guide
├── middleware.ts             # Route protection
└── README.md                 # This file
```

## 👥 Default Users

### Admin Accounts
- **Science & Technology:** `admin_science` / `science123`
- **Commerce & Management:** `admin_commerce` / `commerce123`
- **Interdisciplinary:** `admin_interdisciplinary` / `interdisciplinary123`
- **Humanities:** `admin_humanities` / `humanities123`

### Coordinator Accounts
- **Science Coordinator 1:** `coord_science_1` / `coord123`
- **Science Coordinator 2:** `coord_science_2` / `coord123`
- **Commerce Coordinator:** `coord_commerce` / `coord123`
- (See `database/users_table.sql` for complete list)

## 🔄 Workflow

1. **Coordinator logs in** → Searches for student → Edits data → Submits for approval
2. **System creates** change request with status "pending"
3. **Admin logs in** → Reviews pending requests → Approves/Rejects
4. **On approval:** Student record automatically updated
5. **Coordinator** can then generate document for approved records
6. **Document preview** allows manual edits before printing/downloading

## 📄 Document Template

Place your Word template at `templates/result_template.docx` with these placeholders:

```
{candidate_name}, {candidate_no}, {session}, {sex}
{p1_cd}, {p1_t}, {p1_i} (for all 6 papers)
{c1}, {sgp1} (for all 6 semesters)
{cgpa}, {gcgpa}, {percentage}, {rslt}, {res}
```

**Note:** Use single curly braces `{placeholder}`, NOT `${placeholder}`

## 🎨 UI/UX Features

- ✅ Clean black & white design (no gradients)
- ✅ Dark/Light mode support
- ✅ Responsive layout (mobile-friendly)
- ✅ shadcn/ui components throughout
- ✅ Print-optimized document preview
- ✅ Loading states and error handling
- ✅ Toast notifications (ready to implement)

## 🔐 Security Features

- ✅ JWT authentication with 7-day expiration
- ✅ HTTP-only secure cookies
- ✅ Protected API routes with middleware
- ✅ Role-based access control
- ✅ Password hashing (implement bcrypt for production)
- ✅ Environment variable protection

## 📦 Main Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "next": "16.0.3",
  "react": "19.x",
  "tailwindcss": "^3.4.1",
  "docxtemplater": "^3.x",
  "pizzip": "^3.x",
  "jsonwebtoken": "^9.x",
  "next-themes": "^0.x",
  "lucide-react": "^0.x"
}
```

## 🚧 Future Enhancements

- [ ] Add bulk upload for student data
- [ ] Email notifications for approvals
- [ ] Audit log for all changes
- [ ] Advanced search filters
- [ ] Export to Excel/CSV
- [ ] Multi-language support
- [ ] Password reset functionality

## 📝 License

MIT

## 👨‍💻 Author

Aanish Bangre

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note:** Remember to keep your `.env.local` file secure and never commit it to version control!