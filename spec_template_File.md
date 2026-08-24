# Comment System Specification

## Overview

**Problem**: Users need a way to discuss and provide feedback on blog posts, but we currently have no interaction mechanism beyond reading content.

**Goal**: Implement a threaded comment system that encourages quality discussion while preventing spam and abuse.

**Target Users**: 
- Blog readers (casual and registered)
- Content creators (blog authors)
- Moderators

**Timeline**: 3 weeks
**Priority**: High (top feature request from users)

---

## Business Requirements

### Use Cases

1. **Anonymous Reading**: Anyone can read comments without logging in
2. **Registered Commenting**: Logged-in users can post comments and replies
3. **Author Interaction**: Blog authors can reply to comments and mark helpful ones
4. **Moderation**: Moderators can hide/delete inappropriate comments
5. **Notifications**: Users get notified when someone replies to their comment

### Success Metrics

- 30% of blog visitors read comments
- 10% of registered users post at least one comment per month
- <5% spam rate after moderation
- Average response time from authors <24 hours

### Must Have (MVP)

- Post top-level comments
- Reply to comments (one level of nesting)
- Edit own comments within 15 minutes
- Delete own comments
- Basic moderation (hide/delete)

### Nice to Have (Future)

- Unlimited nesting depth
- Upvote/downvote system
- Rich text formatting
- @mentions
- Comment reactions (emoji)

### Constraints

- Must work on mobile browsers
- Must be accessible (WCAG 2.1 AA)
- Should not slow down page load by >500ms
- Keep hosting costs low (no third-party comment service)

---

## Functional Requirements

### FR-1: Viewing Comments

- Comments display below blog post in chronological order (oldest first)
- Each comment shows:
  - Author name/username
  - Avatar (or default icon)
  - Timestamp (relative: "2 hours ago", absolute on hover)
  - Comment text
  - Reply count
- Replies are indented and nested under parent comment
- "Load more" pagination after 20 comments
- Deleted comments show "[deleted]" placeholder if they have replies

### FR-2: Posting Comments

- Only logged-in users can post
- Text input with "Post Comment" button
- Character limit: 5,000 characters
- Real-time character counter
- Preview button to see formatted output
- "Cancel" clears the form
- Success message after posting: "Comment posted successfully"

### FR-3: Replying to Comments

- "Reply" button on each comment
- Opens reply form inline under that comment
- Reply form identical to main comment form
- Quoted parent comment (first 100 chars) shown for context
- One level of nesting only (replies to replies become sibling replies)

### FR-4: Editing Comments

- "Edit" button visible only to comment author
- Available for 15 minutes after posting
- Edit form replaces comment text
- "Save" updates comment, "Cancel" reverts
- Edit indicator: "(edited)" timestamp shown

### FR-5: Deleting Comments

- "Delete" button visible only to comment author and moderators
- Confirmation prompt: "Are you sure? This cannot be undone."
- If comment has no replies: hard delete (removed from DB)
- If comment has replies: soft delete (text replaced with "[deleted]", author hidden)

### FR-6: Moderation

- Moderators see "Hide" and "Delete" on all comments
- Hidden comments invisible to regular users, visible to mods with "[hidden]" tag
- "Unhide" button for moderators to restore
- Moderators can delete any comment with same rules as FR-5

### FR-7: Notifications

- User receives notification when someone replies to their comment
- Notification shows in header bell icon (unread count badge)
- Clicking notification takes user to the specific comment
- Mark as read on click

---

## Technical Specification

### Architecture

- **Frontend**: React components
- **Backend**: Node.js/Express REST API
- **Database**: PostgreSQL
- **Real-time**: Optional WebSocket for live comment updates (future)

### Data Model

#### Table: `comments`

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  is_deleted BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  
  INDEX idx_post_id (post_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at)
);
```

#### Table: `comment_notifications`

```sql
CREATE TABLE comment_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_unread (user_id, is_read)
);
```

### API Endpoints

#### `GET /api/posts/:postId/comments`

**Query params**: 
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response**:
```json
{
  "comments": [
    {
      "id": 123,
      "postId": 456,
      "userId": 789,
      "username": "john_doe",
      "avatarUrl": "https://...",
      "content": "Great post!",
      "parentId": null,
      "isEdited": false,
      "isDeleted": false,
      "createdAt": "2026-08-23T10:30:00Z",
      "editedAt": null,
      "replies": [...]
    }
  ],
  "total": 145,
  "page": 1,
  "hasMore": true
}
```

#### `POST /api/posts/:postId/comments`

**Auth**: Required (JWT)

**Body**:
```json
{
  "content": "This is my comment",
  "parentId": 123  // optional, null for top-level
}
```

**Response**: `201 Created` with created comment object

**Errors**:
- `401 Unauthorized` - not logged in
- `400 Bad Request` - content empty or >5000 chars
- `404 Not Found` - post or parent comment doesn't exist
- `429 Too Many Requests` - rate limit exceeded

#### `PATCH /api/comments/:id`

**Auth**: Required (must be comment author)

**Body**:
```json
{
  "content": "Updated comment text"
}
```

**Response**: `200 OK` with updated comment

**Errors**:
- `403 Forbidden` - not comment author or edit window expired
- `400 Bad Request` - validation errors

#### `DELETE /api/comments/:id`

**Auth**: Required (comment author or moderator)

**Response**: `204 No Content`

**Errors**:
- `403 Forbidden` - not authorized

#### `POST /api/comments/:id/hide`

**Auth**: Required (moderator only)

**Response**: `200 OK`

#### `GET /api/notifications/comments`

**Auth**: Required

**Response**: Array of unread comment notifications

---

## Non-Functional Requirements

### Performance

- API response time: <200ms (p95)
- Page load with 20 comments: <500ms additional
- Database query optimization: use indexes on post_id, parent_id
- Cache comment counts per post (Redis)

### Security

- Sanitize HTML in comment content (XSS prevention)
- Rate limiting: 10 comments per user per hour
- CSRF protection on POST/PATCH/DELETE
- SQL injection prevention via parameterized queries
- Moderator actions logged for audit

### Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support (tab through comments, Enter to expand)
- Screen reader friendly (proper ARIA labels)
- Color contrast ratios meet standards
- Focus indicators visible

### Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari/Chrome

---

## Edge Cases & Validations

### Input Validation

- **Empty content**: Show error "Comment cannot be empty"
- **Content >5000 chars**: Disable submit, show "Character limit exceeded"
- **Whitespace only**: Treat as empty
- **HTML/Scripts**: Strip all tags except whitelisted (basic markdown)

### Concurrent Actions

- **User edits while someone replies**: Both succeed independently
- **User deletes while someone replies**: Reply fails with error "Parent comment no longer exists"
- **Multiple edits in quick succession**: Last write wins, updated_at reflects final edit

### Network Issues

- **Post fails**: Show error message, preserve user's text in form
- **Slow connection**: Show loading spinner, disable submit during POST
- **Offline**: Show "You appear to be offline" message

### Race Conditions

- **Comment deleted before reply loads**: Reply form shows error "This comment has been deleted"
- **User loses auth mid-session**: Redirect to login, preserve comment draft in localStorage

### Spam Prevention

- **Rate limiting**: Show "You're posting too quickly. Please wait X minutes."
- **Duplicate detection**: If identical content posted <1 hour ago, reject with "This looks like a duplicate"
- **New account throttling**: Accounts <1 day old limited to 3 comments/day

---

## Out of Scope

These are explicitly NOT included in this version:

- Rich text editor (bold, italic, images)
- Comment voting/ranking system
- User reputation scores
- Email notifications (only in-app for now)
- Comment search
- Nested threading beyond 1 level
- Sorting options (only chronological for now)
- Direct messages between users

---

## Open Questions

1. **Markdown support**: Should we allow basic markdown (links, bold, italic)?
   - **Decision needed by**: Week 1
   - **Impact**: Affects editor component choice

2. **Avatar service**: Use Gravatar or build custom avatar upload?
   - **Decision needed by**: Week 1
   - **Impact**: Affects user profile schema

3. **Edit history**: Should we track edit history or just show "(edited)"?
   - **Decision needed by**: Week 2
   - **Impact**: Database schema change

---

## Acceptance Criteria

**This feature is complete when:**

- [ ] User can view comments on any blog post without logging in
- [ ] Logged-in user can post a top-level comment
- [ ] Logged-in user can reply to any comment
- [ ] Comments are nested one level deep visually
- [ ] User can edit their own comment within 15 minutes
- [ ] User can delete their own comment
- [ ] Deleted comments with replies show "[deleted]" placeholder
- [ ] Moderators can hide/unhide any comment
- [ ] Moderators can delete any comment
- [ ] Users receive notification when someone replies to their comment
- [ ] All API endpoints return correct status codes and error messages
- [ ] Rate limiting prevents spam (tested)
- [ ] XSS protection verified (security audit)
- [ ] WCAG 2.1 AA compliance verified (accessibility audit)
- [ ] Works on mobile browsers (tested on iOS Safari, Android Chrome)
- [ ] Page load performance <500ms additional (measured)
- [ ] All edge cases handled gracefully (test coverage >90%)

---

## Implementation Notes

### Phase 1 (Week 1): Core Functionality
- Database schema and migrations
- API endpoints for CRUD operations
- Basic React components (CommentList, CommentItem, CommentForm)
- Authentication integration

### Phase 2 (Week 2): Moderation & Polish
- Moderation features
- Edit functionality with time limit
- Notifications system
- Error handling and loading states

### Phase 3 (Week 3): Testing & Launch
- Security audit
- Accessibility audit
- Performance optimization
- Documentation
- Deploy to staging, then production

---

**Spec Version**: 1.0  
**Last Updated**: 2026-08-23  
**Author**: Product Team  
**Stakeholders**: Engineering, Design, Content Team
