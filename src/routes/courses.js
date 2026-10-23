const express = require('express');
const store = require('../services/store');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// List all courses (supports 1-to-1 course info)
router.get('/', (req, res) => {
  const { difficulty } = req.query;
  let result = store.courses;
  if (difficulty && difficulty.toLowerCase() !== 'all') {
    result = result.filter(c => (c.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }

  const mapped = result.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    thumbnail_url: c.thumbnail_url,
    is_one_on_one: c.is_one_on_one !== false, // Default to true for 1-to-1 courses
    instructor: c.instructor || 'Certified Scholar & Qari',
    session_duration: c.session_duration || '30 - 45 mins',
    frequency: c.frequency || '2 - 3 sessions/week',
    has_free_trial: true,
    total_lessons: (c.lessons || []).length
  }));

  // Return mapped array; also assign as property so data['data'] in client succeeds
  res.json(mapped);
});

// User enrollments
router.get('/enrollments/me', requireAuth, (req, res) => {
  const userEnrollments = store.userEnrollments.get(req.user.id) || [];
  res.json(userEnrollments);
});

// Course detail
router.get('/:course_id', (req, res) => {
  if (req.params.course_id === 'inquiries') {
    return res.status(400).json({ detail: 'Use GET /courses/inquiries instead' });
  }

  const course = store.courses.find(c => c.id === req.params.course_id);
  if (!course) {
    return res.status(404).json({ detail: 'Course not found' });
  }

  res.json({
    id: course.id,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    thumbnail_url: course.thumbnail_url,
    is_one_on_one: course.is_one_on_one !== false,
    instructor: course.instructor || 'Certified Scholar & Qari',
    session_duration: course.session_duration || '30 - 45 mins',
    frequency: course.frequency || '2 - 3 sessions/week',
    has_free_trial: true,
    features: [
      'Personal 1-on-1 live sessions',
      'Male & Female certified teachers',
      'Flexible schedule (pick your time)',
      'Free 30-min evaluation class',
      'Weekly progress monitoring'
    ],
    lessons: (course.lessons || []).map(l => ({
      id: l.id,
      title: l.title,
      content_type: l.content_type || 'text',
      content_url: l.content_url || null,
      duration_minutes: l.duration_minutes || 10,
      order: l.order || 1
    }))
  });
});

// ── 1-to-1 Course Inquiries / Lead Capture ──

// Submit interest / request 1-on-1 trial for a course
router.post('/:course_id/inquiry', optionalAuth, (req, res) => {
  const courseId = req.params.course_id;
  const course = store.courses.find(c => c.id === courseId);
  const body = req.body || {};

  const studentName = body.student_name || (req.user && req.user.display_name) || 'Interested Student';
  const email = body.email || (req.user && req.user.email) || '';
  const phone = body.phone_or_whatsapp || body.phone || body.whatsapp || '';

  if (!phone && !email) {
    return res.status(422).json({ detail: 'Please provide either a WhatsApp/Phone number or Email so the teacher can reach you.' });
  }

  const inquiry = store.addCourseInquiry({
    course_id: courseId,
    course_title: course ? course.title : (body.course_title || '1-on-1 Islamic Course'),
    student_name: studentName,
    email,
    phone_or_whatsapp: phone,
    preferred_days: body.preferred_days || 'Flexible',
    preferred_time: body.preferred_time || 'Flexible',
    student_level: body.student_level || 'Beginner',
    notes: body.notes || ''
  });

  res.status(201).json({
    message: 'Your 1-on-1 course inquiry has been received! Our tutor will reach out to you via WhatsApp shortly to schedule your free trial session.',
    inquiry
  });
});

// Generic inquiry endpoint (without course ID in URL)
router.post('/inquiries', optionalAuth, (req, res) => {
  const body = req.body || {};
  const course = store.courses.find(c => c.id === body.course_id);

  const phone = body.phone_or_whatsapp || body.phone || body.whatsapp || '';
  const email = body.email || (req.user && req.user.email) || '';

  if (!phone && !email) {
    return res.status(422).json({ detail: 'Please provide either a WhatsApp/Phone number or Email.' });
  }

  const inquiry = store.addCourseInquiry({
    course_id: body.course_id || 'general-inquiry',
    course_title: course ? course.title : (body.course_title || '1-on-1 Islamic Course'),
    student_name: body.student_name || (req.user && req.user.display_name) || 'Interested Student',
    email,
    phone_or_whatsapp: phone,
    preferred_days: body.preferred_days || 'Flexible',
    preferred_time: body.preferred_time || 'Flexible',
    student_level: body.student_level || 'Beginner',
    notes: body.notes || ''
  });

  res.status(201).json({
    message: 'Your inquiry has been received! We will contact you soon.',
    inquiry
  });
});

// Admin: View all course inquiries
router.get('/admin/inquiries', (req, res) => {
  const { status, course_id } = req.query;
  const inquiries = store.getCourseInquiries({ status, course_id });
  res.json({
    total: inquiries.length,
    inquiries
  });
});

// Admin: Update inquiry status (e.g., mark as 'contacted', 'trial_scheduled', 'enrolled')
router.patch('/admin/inquiries/:id', (req, res) => {
  const updated = store.updateCourseInquiry(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({ detail: 'Inquiry not found' });
  }
  res.json({ message: 'Inquiry updated successfully', inquiry: updated });
});

// Admin: Web Dashboard for 1-to-1 Inquiries
router.get('/admin/dashboard', (req, res) => {
  const inquiries = store.getCourseInquiries();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Noor — 1-on-1 Course Inquiries Dashboard</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <style>
    body { background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card { background-color: #161b22; border-color: #30363d; border-radius: 12px; }
    .table { color: #c9d1d9; border-color: #30363d; }
    .table th { background-color: #21262d; color: #58a6ff; }
    .badge-new { background-color: #238636; }
    .badge-contacted { background-color: #1f6feb; }
    .badge-enrolled { background-color: #8957e5; }
    .btn-wa { background-color: #25D366; color: #fff; font-weight: 600; border: none; }
    .btn-wa:hover { background-color: #1eb956; color: #fff; }
  </style>
</head>
<body class="p-4">
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-white fw-bold">🌙 Noor 1-on-1 Course Leads</h2>
        <p class="text-secondary mb-0">Total Interested Students: <strong>${inquiries.length}</strong></p>
      </div>
      <a href="/courses/" class="btn btn-outline-secondary">View Courses API</a>
    </div>

    <div class="card p-3 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Course Requested</th>
              <th>WhatsApp / Phone</th>
              <th>Preferred Time</th>
              <th>Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${inquiries.length === 0 ? '<tr><td colspan="8" class="text-center py-4 text-secondary">No course inquiries received yet. Submit one from the app or API!</td></tr>' : inquiries.map(inq => {
              const cleanPhone = (inq.phone_or_whatsapp || '').replace(/[^0-9]/g, '');
              const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Assalamu Alaikum ${inq.student_name}, thank you for your interest in the Noor 1-on-1 ${inq.course_title} course!`)}` : '#';
              return `
              <tr>
                <td><small class="text-secondary">${new Date(inq.created_at).toLocaleDateString()} ${new Date(inq.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small></td>
                <td class="fw-bold text-white">${escapeHtml(inq.student_name)}</td>
                <td><span class="text-info">${escapeHtml(inq.course_title)}</span></td>
                <td>
                  ${escapeHtml(inq.phone_or_whatsapp)}
                  ${inq.email ? `<br><small class="text-secondary">${escapeHtml(inq.email)}</small>` : ''}
                </td>
                <td>${escapeHtml(inq.preferred_days)} (${escapeHtml(inq.preferred_time)})</td>
                <td><span class="badge bg-secondary">${escapeHtml(inq.student_level)}</span></td>
                <td><span class="badge badge-${inq.status}">${escapeHtml(inq.status)}</span></td>
                <td>
                  ${cleanPhone ? `<a href="${waLink}" target="_blank" class="btn btn-sm btn-wa">💬 WhatsApp</a>` : ''}
                </td>
              </tr>
              ${inq.notes ? `<tr><td colspan="8" class="bg-dark text-secondary py-1 ps-4"><small>📝 <em>Note:</em> ${escapeHtml(inq.notes)}</small></td></tr>` : ''}
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
  res.send(html);
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Existing enrollment & progress endpoints
router.post('/:course_id/enroll', requireAuth, (req, res) => {
  const courseId = req.params.course_id;
  const course = store.courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ detail: 'Course not found' });
  }

  const userId = req.user.id;
  let userList = store.userEnrollments.get(userId) || [];
  const existing = userList.find(e => e.course_id === courseId);
  if (existing) {
    return res.status(409).json({ detail: 'Already enrolled' });
  }

  const enrollment = {
    id: store.uuid(),
    course_id: courseId,
    progress: 0.0,
    completed: false,
    enrolled_at: new Date().toISOString()
  };

  userList.push(enrollment);
  store.userEnrollments.set(userId, userList);
  store.persistRuntime();

  res.json({ message: 'Enrolled successfully', enrollment_id: enrollment.id });
});

router.patch('/:course_id/progress', requireAuth, (req, res) => {
  const courseId = req.params.course_id;
  const progress = parseFloat(req.body.progress || 0);

  const userId = req.user.id;
  let userList = store.userEnrollments.get(userId) || [];
  let enrollment = userList.find(e => e.course_id === courseId);

  if (!enrollment) {
    enrollment = {
      id: store.uuid(),
      course_id: courseId,
      progress,
      completed: progress >= 1.0,
      enrolled_at: new Date().toISOString()
    };
    userList.push(enrollment);
    store.userEnrollments.set(userId, userList);
  } else {
    enrollment.progress = progress;
    enrollment.completed = progress >= 1.0;
  }

  store.persistRuntime();
  res.json({ message: 'Progress updated', enrollment });
});

module.exports = router;
