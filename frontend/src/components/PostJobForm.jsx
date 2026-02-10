import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/post_job.css';
import { emit } from '../lib/eventBus'; // NEW
import { API_BASE_URL } from "../lib/api";

const PostJobForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(jobId);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    city_id: '',
    regular_price: '',
    job_type: 'Hourly',
    description: '',
    thumb_image: null
  });

  const [errors, setErrors] = useState({});

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    setFormData(prev => ({ ...prev, title, slug }));
    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
  };

  useEffect(() => {
    fetchCategories();
    fetchCities();
    if (isEditMode && jobId) fetchJobData(jobId);
  }, [jobId, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (error) { console.error('Error fetching categories:', error); }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cities`);
      const data = await response.json();
      if (data.success) setCities(data.data);
    } catch (error) { console.error('Error fetching cities:', error); }
  };

  const fetchJobData = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/job-posts/${jobId}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        const job = data.data;
        setFormData({
          title: job.title || '',
          slug: job.slug || '',
          category_id: job.category_id || '',
          city_id: job.city_id || '',
          regular_price: job.regular_price || '',
          job_type: job.job_type || 'Hourly',
          description: job.description || '',
          thumb_image: null
        });
        if (job.thumb_image) setImagePreview(`/uploads/job-thumbnails/${job.thumb_image}`);
      } else {
        alert('Failed to load job data'); navigate('/client/Orders');
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      alert('Error loading job data'); navigate('/client/Orders');
    } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));
    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, thumb_image: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.city_id) newErrors.city_id = 'City is required';
    if (!formData.regular_price) newErrors.regular_price = 'Price is required';
    else if (isNaN(formData.regular_price) || parseFloat(formData.regular_price) <= 0)
      newErrors.regular_price = 'Price must be a valid positive number';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'thumb_image' && formData[key]) submitData.append(key, formData[key]);
        else if (key !== 'thumb_image') submitData.append(key, formData[key]);
      });

      const url = isEditMode ? `/api/job-posts/${jobId}` : '/api/job-posts';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, { method, credentials: 'include', body: submitData });
      const result = await response.json();

      if (response.ok) {
        alert(isEditMode ? 'Job updated successfully!' : 'Job posted successfully!');

        // 🔔 tell the app to refresh dashboard stats
        const createdOrUpdatedId = (result && result.data && result.data.id) || jobId;
        emit('job:mutated', { type: isEditMode ? 'updated' : 'created', jobId: createdOrUpdatedId });

        if (isEditMode) {
          navigate('/client/Orders');
        } else {
          setFormData({
            title: '', slug: '', category_id: '', city_id: '',
            regular_price: '', job_type: 'Hourly', description: '', thumb_image: null
          });
          setImagePreview(null);
        }
      } else {
        if (result.errors) setErrors(result.errors);
        else alert(result.message || 'Error creating job post');
      }
    } catch (error) {
      console.error('Error submitting job post:', error);
      alert('Error submitting job post: ' + error.message);
    } finally { setLoading(false); }
  };

  return (
    <main className="dashboard-main min-vh-100">
      {/* (unchanged UI below) */}
      {/* ...your form JSX exactly as you had it... */}
      {/* I did not remove any of your markup; only the logic above changed. */}
      {/* Paste your existing JSX content here unchanged */}
    </main>
  );
};

export default PostJobForm;
