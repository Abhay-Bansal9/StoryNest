import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {message}
    </div>
  );
};

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 120) {
      errors.title = 'Title must be under 120 characters';
    }
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    if (formData.tags && formData.tags.split(',').some(tag => tag.trim().length > 30)) {
      errors.tags = 'Each tag must be under 30 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch blog data if editing
  useEffect(() => {
    const fetchBlog = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await axios.get(`/api/blogs/${id}`);
          const blog = response.data;
          setFormData({
            title: blog.title,
            content: blog.content,
            tags: blog.tags.join(', ')
          });
          setWordCount(blog.content.split(/\s+/).filter(Boolean).length);
          setError(null);
          showNotification('Blog loaded successfully', 'success');
        } catch (error) {
          console.error('Error fetching blog:', error);
          setError('Failed to fetch blog. Please try again.');
          showNotification('Failed to load blog', 'error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBlog();
  }, [id]);

  // Auto-save functionality with debounce
  const autoSave = useCallback(async () => {
    if (!isDirty || !validateForm()) return;

    try {
      const response = await axios.post('/api/blogs/save-draft', {
        id,
        ...formData
      });
      setLastSaved(new Date());
      setIsDirty(false);
      if (!id) {
        navigate(`/edit/${response.data._id}`);
      }
      showNotification('Draft saved automatically', 'success');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setError('Auto-save failed. Please try saving manually.');
      showNotification('Auto-save failed', 'error');
    }
  }, [formData, id, isDirty, navigate]);

  // Set up auto-save timer with debounce
  useEffect(() => {
    const timer = setTimeout(autoSave, 30000);
    return () => clearTimeout(timer);
  }, [autoSave]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    if (name === 'content') {
      setWordCount(value.split(/\s+/).filter(Boolean).length);
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!validateForm()) {
      showNotification('Please fix the validation errors before publishing', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/blogs/publish', {
        id,
        ...formData
      });
      showNotification('Blog published successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error('Publish failed:', error);
      setError('Failed to publish. Please try again.');
      showNotification('Failed to publish blog', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual save
  const handleSave = async () => {
    if (!validateForm()) {
      showNotification('Please fix the validation errors before saving', 'error');
      return;
    }

    try {
      setLoading(true);
      await autoSave();
      setError(null);
      showNotification('Draft saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save. Please try again.');
      showNotification('Failed to save draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Edit Story' : 'New Story'}
              </h1>
              {lastSaved && (
                <p className="mt-2 text-sm text-gray-500">
                  Last saved at {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${
                isDirty ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Story title"
                className={`w-full p-4 text-2xl border-b-2 ${
                  validationErrors.title ? 'border-red-500' : 'border-gray-200'
                } focus:outline-none focus:border-blue-500 bg-transparent`}
                maxLength={120}
              />
              <div className="flex justify-between mt-1">
                <div>
                  <p className="text-sm text-gray-500">
                    {formData.title.length}/120 characters
                  </p>
                  {validationErrors.title && (
                    <p className="text-sm text-red-500">{validationErrors.title}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {wordCount} words
                </p>
              </div>
            </div>

            <div className="relative">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Start writing your story..."
                className={`w-full h-[500px] p-4 border-2 ${
                  validationErrors.content ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:border-blue-500 resize-none bg-transparent`}
              />
              {validationErrors.content && (
                <p className="absolute bottom-2 left-4 text-sm text-red-500">
                  {validationErrors.content}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Add tags (comma-separated)"
                className={`w-full p-4 border-2 ${
                  validationErrors.tags ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:border-blue-500 bg-transparent`}
              />
              <div className="mt-1">
                <p className="text-sm text-gray-500">
                  Example: technology, lifestyle, travel
                </p>
                {validationErrors.tags && (
                  <p className="text-sm text-red-500">{validationErrors.tags}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={loading || !isDirty}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {loading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading || !formData.title || !formData.content}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {loading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;