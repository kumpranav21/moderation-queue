# Moderation Queue App

A content moderation interface built using **React**, **Redux Toolkit**, and **Tailwind CSS**. The app allows moderators to view posts categorized by status: _Pending_, _Approved_, and _Rejected_. Pending posts can be previewed in a modal, and moderation actions can be performed with clear navigation and keyboard accessibility.

🌐 **Live Preview**: [https://moderation-queue-lovat.vercel.app](https://moderation-queue-lovat.vercel.app)

---

## 🔧 Tech Stack

- **React**
- **Redux Toolkit**
- **Tailwind CSS**
- **Vite**
- **Deployed on Vercel**

---

## 📦 Prerequisites

To run the project locally, ensure the following are installed:

- Node.js (v16 or above)
- npm or yarn
- Git
- [Vite](https://vitejs.dev/) (installed automatically via dependencies)
---

## 🚀 Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/kumpranav21/moderation-queue-app.git
cd moderation-queue-app

2.	Install dependencies:
npm install
npm install @reduxjs/toolkit react-redux react-hot-toast lucide-react

3.	Start the development server:
npm run dev
Open http://localhost:5173 in your browser.

##🧩 Features Overview

	| **Category**                | **Feature**                                                                 | **Implemented** | **Notes**                                                                 |
|----------------------------|------------------------------------------------------------------------------|------------------|---------------------------------------------------------------------------|
| **Post List View**         | Display posts in clean, scannable list format                               | ✅ Yes           | Title, username, reason, and timestamp shown                             |
|                            | Responsive design (desktop & tablet)                                        | ✅ Yes           | Fully responsive with Tailwind CSS                                       |

| **Individual Actions**     | Approve and Reject buttons for each post                                    | ✅ Yes           | Clear visual feedback and disabled state post-action                     |
|                            | Visual feedback and disabled state for processed posts                      | ✅ Yes           | Post buttons get disabled after action                                   |

| **Content Preview Modal**  | View post content in modal                                                  | ✅ Yes           | Opens on title click or "View" button; shows all metadata                |
|                            | Navigation between posts within modal                                       | ✅ Yes           | Next/Previous buttons enabled                                            |

| **Batch Operations**       | Checkbox selection, "Select All", batch approve/reject                      | ✅ Yes           | Batch actions fully functional                                           |
|                            | Show selected items count                                                   | ✅ Yes           | Clear indication on UI                                                   |

| **State Management**       | State via Redux Toolkit                                                     | ✅ Yes           | Moderation state managed globally                                        |
|                            | Persist decisions, handle loading/errors                                    | ✅ Yes           | Error handling and loading spinners included                             |

| **Status Filtering**       | Tab-based filtering (Pending, Approved, Rejected)                           | ✅ Yes           | Default is Pending; tabs with count badges                               |

| **Confirmation Dialogs**   | Confirm before rejection                                                    | ✅ Yes           | Dialog before rejecting post included                                    |
|                            | Option to add rejection notes                                               | ✅ Yes           | Rejection notes supported                                                |

| **Pagination/Scroll**      | Efficient data handling via pagination or infinite scroll                   | ✅ Yes           | Infinite scroll implemented                                              |

| **Keyboard Shortcuts**     | A (Approve), R (Reject), Space (Preview), Esc (Close modal)                 | ✅ Yes           | Fully functional with tooltip/hints                                      |

| **Undo Functionality**     | Toast/snackbar with Undo option                                             | ✅ Yes           | "Undo" implemented with success feedback      


## 📁 Folder Structure
src/
├── app/             # Redux store setup
├── components/      # UI components
├── features/        # Redux slices
├── pages/           # Main application pages
├── index.css        # Tailwind styles
└── main.jsx         # App entry point

---

## 👨‍💻 Developed By

**Pranav Kumbhar**  
📧 Email: [kumpranav21@gmail.com](mailto:kumpranav21@gmail.com)  
🔗 LinkedIn: [linkedin.com/in/pranavkumbhar](https://linkedin.com/in/pranavkumbhar)
