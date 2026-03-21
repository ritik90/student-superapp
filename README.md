# 🎓 Student Hub — Student Marketplace

> One place for student deals, notes & rentals.

A student-to-student marketplace exclusively for verified Irish college students. Buy and sell laptops, bikes, rooms, study notes, and more — with security built in from the start through college email verification.

🔗 **Live App:** [student-superapp.vercel.app](https://student-superapp.vercel.app/login)

---

## ✨ Features

- **Verified college emails only** — no spam accounts, no anonymous users
- **Multi-category listings** — laptops, bikes, rooms, study notes, and more
- **Student-first UI** — fast, clean, and built for campus life
- **Secure authentication** — powered by Supabase Auth
- **Ireland-focused** — supports TCD, UCD, DCU, NCI, UL, MU, and more

---

## 🏫 Supported Colleges

| College | Domain |
|---|---|
| Trinity College Dublin | `@tcd.ie` |
| University College Dublin | `@ucd.ie` |
| Dublin City University | `@dcu.ie` |
| National College of Ireland | `@student.ncirl.ie` / `@ncirl.ie` |
| University of Limerick | `@ul.ie` |
| Maynooth University | `@mu.ie` |
| + more | — |

> Only students with a valid college email domain can create an account.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth & Database | [Supabase](https://supabase.com/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project with Auth enabled

### 1. Clone the repository

```bash
git clone https://github.com/ritik90/student-superapp.git
cd student-superapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
student-superapp/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
├── lib/              # Supabase client & utility functions
├── public/           # Static assets
├── next.config.ts
├── tailwind.config   # (via postcss.config.mjs)
└── tsconfig.json
```

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔐 Authentication

Sign-up is restricted to verified college email domains. Only emails matching a recognised Irish college domain (e.g. `@tcd.ie`, `@ucd.ie`) are accepted at registration. This is enforced at the Supabase Auth layer.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## 📄 License

This project is private. All rights reserved.
