# Sprint 13: THE BLUEPRINT

**---------------------------**

1. I am building an enterprise EHR called VitalSync. How should I structure my Next.js and MERN stack repository for a scalable capstone project?
2. Help me design a robust Role-Based Access Control (RBAC) database schema for Patients, Doctors, and Admins using DBML.
3. Provide step-by-step guidance on designing a mobile-first, pixel-perfect Figma wireframe for a Doctor Dashboard and Patient EHR view.

---

# Sprint 14: THE WALKING SKELETON

**----------------------------------**

4. How do I architect the Mongoose User schema for VitalSync with strict role-based access control and secure password constraints?
5. How do I implement asynchronous password hashing using bcryptjs before saving a user to MongoDB?
6. How do I engineer the /api/auth/register and /api/auth/login endpoints to return a signed JSON Web Token (JWT)?
7. How do I structure the React frontend auth service to handle POST requests and store tokens securely in localStorage?
8. How do I write an Express middleware function to parse and cryptographically verify JWT bearer tokens on protected endpoints?
9. How do I test protected backend endpoints like /api/tasks using Thunder Client in VS Code?
10. Do we need to list the frontend URL in the backend CORS configuration?
11. How should we handle duplicate README files and .gitignore configurations in a monorepo structure?

---

# Sprint 15: CORE CRUD, STATE MANAGEMENT & ADVANCED UI

**--------------------------------------------------------**
**Backend: Authentication & Security Architecture**

12. How do I securely inject an Authorization Secret Key (`VITALSYNC_SECRET_KEY`) to restrict Doctor and Admin registrations?
13. How do I dynamically generate unique System IDs (e.g., PAT-001, DOC-002) based on user roles during registration?
14. How do I configure the JWT token expiration to exactly 24 hours (`1d`) to implement automatic session logout?
15. How do I prevent the Mongoose `pre('save')` password hashing hook from being bypassed when an Admin uses `findByIdAndUpdate`?
16. How to correctly structure a PUT endpoint that uses `Object.keys(req.body).forEach` and `.save()` for secure admin updates?
17. How do I configure Express CORS dynamically to allow requests from both local development ports and Vercel production URLs?

**Backend: Appointment Engine Logic**

18. How do I write backend validation to block users from booking appointments in past dates?
19. How do I structure an appointment creation endpoint that allows Admins to book on behalf of patients, but restricts patients to themselves?
20. How do I write a MongoDB query to automatically mark 'pending' appointments as 'cancelled' if they are older than 1 hour?
21. How do I build a PATCH endpoint to update appointment status, schedule_date, and reason in a single controller function?
22. How do I enforce strict data ownership so patients can only delete their own appointments, while admins can delete any?

**Backend: EHR & Monetization**

23. How do I create a medical records endpoint that strictly blocks Patients from authoring clinical notes?
24. How do I properly populate referenced Doctor data (name, email) in Mongoose when saving a new medical record?
25. How do I ensure patients can only fetch their own digital prescriptions and medical history?
26. How do I integrate a Stripe Checkout Session in Node.js for a "Pro Upgrade" monetization flow?
27. How do I engineer a mock payment verification fallback in Express if the `STRIPE_SECRET_KEY` is missing in the `.env` file?

**Frontend: State Management (Zustand) & Services**

28. How do I manage global authentication state in React and protect dashboard routes using React Router `Navigate`?
29. How do I gracefully handle invalid or expired JWT tokens on initial app load in `App.jsx`?
30. How to create a Zustand store for Dark/Light mode toggling that manipulates the HTML root class and persists in `localStorage`?
31. How do I use `Promise.all` in a Zustand store to fetch patient medical records and prescriptions concurrently for faster loading?
32. How do I implement Optimistic UI updates in Zustand when cancelling an appointment to ensure the UI feels instant?
33. How do I dynamically configure `import.meta.env.VITE_API_URL` in frontend services for local and Vercel environments?
34. How do I safely write logic to strip accidental trailing `/auth` strings from API base URLs in frontend service files?

**Frontend: UI Components & Authentication Flow**

35. How do I design a multi-role Registration form with dynamic fields based on the selected `role` dropdown?
36. How do I display a professional warning banner with a clickable `mailto:` link when a user selects staff roles during registration?
37. Why does my clickable `mailto:` link not open an email app, and how do default mail handlers work in browsers?
38. How to toggle password visibility using Eye/EyeOff icons in a React authentication form?
39. How to resolve Vite module resolution errors (e.g., `Failed to resolve import "../../services"`) by correcting relative file paths?

**Frontend: Dashboard Layout & Navigation**

40. How to build a responsive Sidebar component that conditionally renders navigation tabs (like "System Appointments") based on RBAC?
41. How to display a "VitalSync Pro" upgrade widget with a Stripe checkout loading state exclusively for Patient roles?
42. How to build a dynamic Header component that changes its title based on the currently active sidebar tab and user role?
43. How to extract a user's initials and display them inside a Tailwind-styled circular avatar badge?

**Frontend: Modals & Forms**

44. How to build a Booking Modal that fetches and displays a list of available doctors dynamically from the backend?
45. How to conditionally render a Patient selection dropdown in the Booking Modal specifically for Administrators?
46. How to write a helper function `getMinDateTime()` to disable past dates and times in an HTML5 `datetime-local` input?
47. How to build an Edit Appointment modal that allows admins to reschedule dates and update reasons for existing bookings?

**Frontend: Complex Data Grids & Rendering Logic**

48. How do I categorize a single array of appointments into Active, History, and Premature lists using JavaScript Date comparisons?
49. How to identify and highlight 'Live' appointments (within a 1-hour active window) with a pulsating Tailwind badge in a data table?
50. How to visually flag 'Overdue' appointments with red styling when the current time exceeds the scheduled time?
51. How to calculate doctor-specific dashboard statistics (unique patients, pending requests) efficiently using React `useMemo`?
52. How to conditionally render "Accept", "Reject", and "Complete" action buttons for Doctors based on the appointment's workflow status?
53. How to format MongoDB ISO timestamps into readable localized time formats (`toLocaleTimeString` with 2-digit hours/minutes)?

**Frontend: Admin Control & EHR Management**

54. How to design an EHR Tab that provides Admins a dropdown to select any patient and view their clinical history?
55. How to build an inline modal for Doctors to author clinical notes and append them instantly to the UI using Zustand?
56. How to build a digital Prescription issuance form capturing medication name and dosage instructions?
57. How to build a centralized Doctor Records directory tab exclusively accessible to Administrators?
58. How to build an Admin Edit Modal pre-filled with user data to update demographic details like phone, age, and blood group?
59. How to implement a native browser confirmation dialog (`window.confirm`) before an Admin deletes a user profile?

**Frontend: UX Polish & Bug Fixes**

60. How to update a React frontend state and trigger a slide-in success notification toast without forcing a full page reload (`window.location.reload`)?
61. How to dynamically overwrite the `localStorage` user object after a successful profile update to keep the session in sync?
62. How to refine UI placeholders and error messages to use enterprise terminology (e.g., changing "Staff Key" to "Platform Access Key")?
