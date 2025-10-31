
# Overview

The core software I developed, **Lynk**, is a to-do list application that leverages the power of the **Next.js** framework for the frontend and **Supabase** for the backend database and authentication. A key feature I implemented is the **drag-and-drop reordering** of tasks, which was a significant learning objective for me regarding client-side state management and database synchronization.

---

My primary purpose for writing Lynk was to gain a deeper, practical understanding of working with **full-stack JavaScript/TypeScript technologies**. Specifically, I wanted to master the integration between a server-rendered React framework (Next.js) and a Backend-as-a-Service (Supabase). The drag-and-drop functionality successfully challenged me to learn about **complex UI interactions**, efficient state updates, and how to persist those changes back to the database in a performant manner.

[4-Minute Lynk Demo & Code Walkthrough](http://youtube.link.goes.here)

# Development Environment

The application was built using the following tools and technologies:

* **Code Editor:** **VS Code (Visual Studio Code)** was my primary integrated development environment.
* **Programming Language:** The entire application is written using **JavaScript**.
* **Frontend Framework:** **Next.js** (based on React) was used for building the user interface, routing, and handling server-side logic.
* **Backend & Database:** **Supabase** provided the PostgreSQL database, **User Authentication (via Supabase Auth)**, and real-time capabilities. I primarily interacted with it using the official Supabase client libraries.
* **Libraries:** For the critical drag-and-drop feature, I utilized a specialized React library, likely **dnd-kit** or a similar solution, to manage the complex drag logic, giving me a strong grasp of how these libraries abstract away the native HTML Drag and Drop API.

---

# Useful Websites

The following websites were instrumental in researching implementation details and understanding specific technical concepts for this project:

- [Supabase Docs](http://supabase.com/)
- [Next.js Documentation](https://nextjs.org/)
- [dnd-kit Documentation](https://dndkit.com/)
- [Gemini](https://gemini.google.com/)

---

# Future Work

I have identified several areas for improvement and expansion in future iterations of Lynk:

-   **Introduce task categories or lists** (e.g., "Work," "Personal," "Shopping") to allow users to organize to-dos beyond a single list, requiring new database schemas and UI filtering logic.
-   **Improve accessibility** of the drag-and-drop interface for keyboard-only users, ensuring compliance with ARIA standards for interactive elements.
-   **Add filtering and sorting functionality** (e.g., sort by creation date, due date, or priority) to the main list interface.


