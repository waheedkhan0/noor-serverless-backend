const express = require('express');
const store = require('../services/store');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { difficulty } = req.query;
  let result = store.courses;
  if (difficulty && difficulty.toLowerCase() !== 'all') {
    result = result.filter(c => (c.difficulty || '').toLowerCase() === difficulty.toLowerCase());
  }

  res.json(result.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    thumbnail_url: c.thumbnail_url
  })));
});

router.get('/enrollments/me', requireAuth, (req, res) => {
  const userEnrollments = store.userEnrollments.get(req.user.id) || [];
  res.json(userEnrollments);
});

router.get('/:course_id', (req, res) => {
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

  res.json({ progress: enrollment.progress, completed: enrollment.completed });
});

module.exports = router;
