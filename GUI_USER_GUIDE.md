# Todo App GUI - User Guide

## 🚀 Getting Started

The Todo App GUI is now running! Here's how to use it:

### Access the App
- **File Location**: `todo-app.html`
- **Open**: Double-click the file or navigate to: `file:///F:/PIAIC Artificial Intelligence course/Quater_6/Claude code/spec_driven_dev/todo-app.html`
- **Server**: Must be running on `http://localhost:3000`

---

## 📋 Features

### 1. **Authentication**

#### Register New Account
1. Click the **Register** tab
2. Enter your email address
3. Create a password (minimum 8 characters)
4. Click **Register**
5. You'll be automatically logged in

#### Login
1. Enter your registered email
2. Enter your password
3. Click **Login**

**Note**: Your login session is saved, so you'll stay logged in even if you close the browser.

---

### 2. **Managing Todos**

#### Add a New Todo
1. Fill in the **Title** (required)
2. Add a **Description** (optional)
3. Select **Priority**: Low, Medium, or High
4. Click **Add Todo**

#### View Your Todos
- All your todos are displayed in a list
- Each todo shows:
  - ✓ Title and description
  - ✓ Priority badge (color-coded)
  - ✓ Creation date
  - ✓ Completion status

#### Toggle Completion
- Click the **✓** button to mark a todo as complete
- Click the **↩️** button to mark it as incomplete
- Completed todos appear with a strikethrough

#### Delete a Todo
- Click the **🗑️** button
- Confirm the deletion
- The todo will be permanently removed

---

### 3. **Filtering**

#### Filter by Status
- **All**: Show all todos
- **Active**: Show only incomplete todos
- **Completed**: Show only completed todos

#### Filter by Priority
- **All**: Show all priorities
- **High**: Show only high-priority todos
- **Medium**: Show only medium-priority todos
- **Low**: Show only low-priority todos

**Filters are combined**, so you can show "Active High-Priority" todos, for example.

---

### 4. **User Management**

#### View Current User
- Your email is displayed in the top-right corner

#### Logout
- Click the **Logout** button
- You'll be returned to the login screen
- Your session will be cleared

---

## 🎨 Visual Features

### Color-Coded Priorities
- 🔴 **High**: Red badge
- 🟡 **Medium**: Yellow badge
- 🔵 **Low**: Blue badge

### Todo States
- **Active**: Full color, solid border
- **Completed**: Faded, strikethrough text
- **Hover**: Purple border with shadow

---

## 💡 Tips

1. **Quick Add**: Press Tab to move between form fields quickly
2. **Filters**: Use filters to focus on what matters
3. **Descriptions**: Add details to remember context later
4. **Priorities**: Use high priority for urgent tasks
5. **Toggle**: Quickly mark tasks complete without editing

---

## ⚠️ Troubleshooting

### "Network error. Please try again"
- **Cause**: Server not running
- **Fix**: Run `npm start` in the project directory

### "Service temporarily unavailable"
- **Cause**: Database connection issue
- **Fix**: Check if `dev.db` exists and restart the server

### Page doesn't load todos
- **Cause**: Token expired or invalid
- **Fix**: Logout and login again

### CORS errors in browser console
- **Cause**: CORS is configured for development
- **Fix**: Already configured, should work fine

---

## 🔒 Security

- Passwords are hashed with bcrypt
- JWT tokens are stored in localStorage
- Tokens expire after 7 days
- Rate limiting protects against abuse
- Each user can only see their own todos

---

## 🌐 Browser Compatibility

Works best in modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## 📱 Mobile Responsive

The interface adapts to smaller screens:
- Stacked layout on mobile
- Touch-friendly buttons
- Responsive forms

---

## 🎯 Example Workflow

1. **Morning Planning**
   - Login to your account
   - Add todos for the day
   - Set priorities (high for urgent tasks)

2. **During the Day**
   - Filter by "Active" to see pending tasks
   - Toggle completed as you finish
   - Add new tasks as they come up

3. **End of Day**
   - Filter by "Completed" to see progress
   - Plan tomorrow's high-priority items
   - Delete obsolete todos

---

## 🚀 Next Steps

Try these workflows:
1. Create 5 different todos with varying priorities
2. Mark 2 as completed
3. Filter to see only active high-priority tasks
4. Delete completed tasks you no longer need

Enjoy organizing your tasks! 📝✨
