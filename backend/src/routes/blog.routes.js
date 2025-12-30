const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const blogController = require('../controllers/blog.controller');
const categoriesController = require('../controllers/blogCategories.controller');
const tagsController = require('../controllers/blogTags.controller');

// Blog Posts
router.get('/posts', blogController.getAllPosts);
router.get('/posts/:slug', blogController.getPostBySlug);
router.post('/posts', authenticate, requireRole('editor', 'super_admin'), blogController.createPost);
router.put('/posts/:id', authenticate, requireRole('editor', 'super_admin'), blogController.updatePost);
router.delete('/posts/:id', authenticate, requireRole('super_admin'), blogController.deletePost);
router.post('/posts/:id/publish', authenticate, requireRole('editor', 'super_admin'), blogController.publishPost);
router.post('/posts/:id/unpublish', authenticate, requireRole('editor', 'super_admin'), blogController.unpublishPost);
router.post('/posts/:id/duplicate', authenticate, requireRole('editor', 'super_admin'), blogController.duplicatePost);
router.post('/posts/:id/autosave', authenticate, requireRole('editor', 'super_admin'), blogController.autosavePost);

// Categories
router.get('/categories', categoriesController.getAllCategories);
router.post('/categories', authenticate, requireRole('editor', 'super_admin'), categoriesController.createCategory);
router.put('/categories/:id', authenticate, requireRole('editor', 'super_admin'), categoriesController.updateCategory);
router.delete('/categories/:id', authenticate, requireRole('super_admin'), categoriesController.deleteCategory);

// Tags
router.get('/tags', tagsController.getAllTags);
router.post('/tags', authenticate, requireRole('editor', 'super_admin'), tagsController.createTag);
router.delete('/tags/:id', authenticate, requireRole('super_admin'), tagsController.deleteTag);

module.exports = router;
