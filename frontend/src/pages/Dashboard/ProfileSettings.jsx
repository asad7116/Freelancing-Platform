import React, { useState, useEffect } from 'react';
import { User, Plus, Trash2, Save } from 'lucide-react';
import { getImageUrl } from '../../lib/api';
import '../../styles/profile_settings.css';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [userRole, setUserRole] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  // Freelancer-specific fields
  const [freelancerInfo, setFreelancerInfo] = useState({
    title: '',
    bio: '',
    specialization: '',
    hourly_rate: '',
    years_of_experience: 0,
    linkedin_url: '',
    github_url: '',
    website_url: '',
    twitter_url: '',
    is_available: true
  });

  // Client-specific fields
  const [clientInfo, setClientInfo] = useState({
    company_name: '',
    company_size: '',
    industry: '',
    website_url: '',
    linkedin_url: ''
  });

  // Arrays for dynamic sections
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // New item templates
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'intermediate' });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    currently_working: false
  });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: ''
  });
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    url: '',
    image: '',
    tags: ''
  });
  const [newBankAccount, setNewBankAccount] = useState({
    bank_name: '',
    account_title: '',
    account_number: '',
    iban: '',
    branch_code: ''
  });
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'jazzcash',
    account_number: '',
    account_name: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include' // Use cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);

        // Set user role
        setUserRole(data.user.role);

        // Set profile image - prepend backend URL if path exists and is relative
        const imagePath = data.profile?.profile_image || data.user.avatar || '';
        if (imagePath) {
          // If path already has http, use it as is, otherwise prepend backend URL
          setProfileImage(getImageUrl(imagePath));
        } else {
          setProfileImage('');
        }

        // Set personal info from user
        setPersonalInfo({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.profile?.phone || '',
          date_of_birth: data.profile?.date_of_birth ? data.profile.date_of_birth.split('T')[0] : '',
          gender: data.profile?.gender || '',
          address: data.profile?.address || '',
          city: data.profile?.city || '',
          state: data.profile?.state || '',
          country: data.profile?.country || '',
          postal_code: data.profile?.postal_code || ''
        });

        if (data.user.role === 'freelancer' && data.profile) {
          // Set freelancer-specific info
          setFreelancerInfo({
            title: data.profile.title || '',
            bio: data.profile.bio || '',
            specialization: data.profile.specialization || '',
            hourly_rate: data.profile.hourly_rate || '',
            years_of_experience: data.profile.years_of_experience || 0,
            linkedin_url: data.profile.linkedin_url || '',
            github_url: data.profile.github_url || '',
            website_url: data.profile.website_url || '',
            twitter_url: data.profile.twitter_url || '',
            is_available: data.profile.is_available !== false
          });

          // Set arrays
          setSkills(data.profile.skills || []);
          setLanguages(data.profile.languages || []);
          setEducation(data.profile.education || []);
          setExperience(data.profile.experience || []);
          setCertifications(data.profile.certifications || []);
          setPortfolioItems(data.profile.portfolio_items || []);
          setBankAccounts(data.profile.bank_accounts || []);
          setPaymentMethods(data.profile.payment_methods || []);
        } else if (data.user.role === 'client' && data.profile) {
          // Set client-specific info
          setClientInfo({
            company_name: data.profile.company_name || '',
            company_size: data.profile.company_size || '',
            industry: data.profile.industry || '',
            website_url: data.profile.website_url || '',
            linkedin_url: data.profile.linkedin_url || ''
          });

          // Set arrays for clients (including education and certifications)
          setEducation(data.profile.education || []);
          setCertifications(data.profile.certifications || []);
          setBankAccounts(data.profile.bank_accounts || []);
          setPaymentMethods(data.profile.payment_methods || []);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateUrl = (url) => {
    if (!url) return true; // Optional fields
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Optional
    const phonePattern = /^[\d\s\+\-\(\)]{10,}$/;
    return phonePattern.test(phone);
  };

  const validateDate = (date) => {
    if (!date) return true; // Optional
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return true; // Optional
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Check if date is not in future and person is at least 13 years old
    if (birthDate > today) return false;
    if (age < 13) return false;
    if (age === 13 && monthDiff < 0) return false;

    return true;
  };

  const validateDateRange = (startDate, endDate, isCurrently = false) => {
    if (!startDate) return true;
    if (isCurrently) return true; // If currently working/studying, no end date needed
    if (!endDate) return true; // Optional end date

    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
  };

  const validatePaymentAccount = (type, accountNumber) => {
    if (!accountNumber) return false;

    switch (type) {
      case 'jazzcash':
      case 'easypaisa':
        // Pakistani mobile numbers: 11 digits starting with 03
        return /^03\d{9}$/.test(accountNumber.replace(/[\s\-]/g, ''));

      case 'paypal':
        // case 'stripe':
        // Email format
        return validateEmail(accountNumber);

      case 'bank_transfer':
        // Bank account: 10-20 digits
        return /^\d{10,20}$/.test(accountNumber.replace(/[\s\-]/g, ''));

      case 'payoneer':
      case 'skrill':
        // Email format
        return validateEmail(accountNumber);

      case 'western_union':
      case 'moneygram':
        // MTCN: 10 digits
        return /^\d{10}$/.test(accountNumber.replace(/[\s\-]/g, ''));

      case 'cryptocurrency':
        // Basic crypto address validation (alphanumeric, 26-42 chars)
        return /^[a-zA-Z0-9]{26,42}$/.test(accountNumber);

      case 'wise':
        // Email or account number
        return validateEmail(accountNumber) || /^\d{8,}$/.test(accountNumber);

      default:
        return accountNumber.length >= 5;
    }
  };

  const validateBankAccount = (accountNumber, iban) => {
    // Account number should be numeric and 10-20 digits
    const accountValid = /^\d{10,20}$/.test(accountNumber?.replace(/[\s\-]/g, '') || '');

    // IBAN validation (if provided): starts with 2 letters, followed by 2 digits, then alphanumeric
    const ibanValid = !iban || /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban?.replace(/[\s\-]/g, '') || '');

    return accountValid && ibanValid;
  };

  const validateProfile = () => {
    const errors = [];

    // Validate mandatory fields
    if (!personalInfo.name?.trim()) {
      errors.push('Name is required');
    }

    // Validate email
    if (!validateEmail(personalInfo.email)) {
      errors.push('Please enter a valid email address');
    }

    // Validate phone if provided
    if (personalInfo.phone && !validatePhone(personalInfo.phone)) {
      errors.push('Please enter a valid phone number (at least 10 digits)');
    }

    // Validate date of birth
    if (personalInfo.date_of_birth && !validateDateOfBirth(personalInfo.date_of_birth)) {
      errors.push('Invalid date of birth. Must be at least 13 years old and not in the future');
    }

    // Validate URLs for freelancers
    if (userRole === 'freelancer') {
      if (freelancerInfo.linkedin_url && !validateUrl(freelancerInfo.linkedin_url)) {
        errors.push('LinkedIn URL is invalid. Must include http:// or https:// and valid domain');
      }
      if (freelancerInfo.github_url && !validateUrl(freelancerInfo.github_url)) {
        errors.push('GitHub URL is invalid. Must include http:// or https:// and valid domain');
      }
      if (freelancerInfo.website_url && !validateUrl(freelancerInfo.website_url)) {
        errors.push('Website URL is invalid. Must include http:// or https:// and valid domain');
      }
      if (freelancerInfo.twitter_url && !validateUrl(freelancerInfo.twitter_url)) {
        errors.push('Twitter URL is invalid. Must include http:// or https:// and valid domain');
      }

      // Validate hourly rate
      if (freelancerInfo.hourly_rate && (isNaN(freelancerInfo.hourly_rate) || parseFloat(freelancerInfo.hourly_rate) < 0)) {
        errors.push('Hourly rate must be a positive number');
      }

      // Validate years of experience
      if (freelancerInfo.years_of_experience && (isNaN(freelancerInfo.years_of_experience) || parseInt(freelancerInfo.years_of_experience) < 0 || parseInt(freelancerInfo.years_of_experience) > 70)) {
        errors.push('Years of experience must be between 0 and 70');
      }
    }

    // Validate URLs for clients
    if (userRole === 'client') {
      if (clientInfo.website_url && !validateUrl(clientInfo.website_url)) {
        errors.push('Company website URL is invalid. Must include http:// or https:// and valid domain');
      }
      if (clientInfo.linkedin_url && !validateUrl(clientInfo.linkedin_url)) {
        errors.push('LinkedIn URL is invalid. Must include http:// or https:// and valid domain');
      }
    }

    // Validate education entries
    education.forEach((edu, index) => {
      if (!edu.degree?.trim() || !edu.institution?.trim()) {
        errors.push(`Education entry ${index + 1}: Degree and Institution are required`);
      }
      if (edu.start_date && edu.end_date && !validateDateRange(edu.start_date, edu.end_date)) {
        errors.push(`Education entry ${index + 1}: Start date must be before end date`);
      }
      if (edu.start_date && !validateDate(edu.start_date)) {
        errors.push(`Education entry ${index + 1}: Start date cannot be in the future`);
      }
    });

    // Validate experience entries (freelancers only)
    if (userRole === 'freelancer') {
      experience.forEach((exp, index) => {
        if (!exp.title?.trim() || !exp.company?.trim()) {
          errors.push(`Experience entry ${index + 1}: Job title and Company are required`);
        }
        if (!exp.currently_working && exp.start_date && exp.end_date && !validateDateRange(exp.start_date, exp.end_date)) {
          errors.push(`Experience entry ${index + 1}: Start date must be before end date`);
        }
        if (exp.start_date && !validateDate(exp.start_date)) {
          errors.push(`Experience entry ${index + 1}: Start date cannot be in the future`);
        }
      });

      // Validate portfolio URLs
      portfolioItems.forEach((item, index) => {
        if (item.url && !validateUrl(item.url)) {
          errors.push(`Portfolio item ${index + 1}: Invalid URL`);
        }
        if (item.image && !validateUrl(item.image)) {
          errors.push(`Portfolio item ${index + 1}: Invalid image URL`);
        }
      });
    }

    // Validate certifications
    certifications.forEach((cert, index) => {
      if (!cert.name?.trim() || !cert.issuing_organization?.trim()) {
        errors.push(`Certification ${index + 1}: Name and Issuing Organization are required`);
      }
      if (cert.credential_url && !validateUrl(cert.credential_url)) {
        errors.push(`Certification ${index + 1}: Invalid credential URL`);
      }
      if (cert.issue_date && cert.expiry_date && !validateDateRange(cert.issue_date, cert.expiry_date)) {
        errors.push(`Certification ${index + 1}: Issue date must be before expiry date`);
      }
    });

    // Validate bank accounts
    bankAccounts.forEach((bank, index) => {
      if (!bank.bank_name?.trim() || !bank.account_number?.trim()) {
        errors.push(`Bank account ${index + 1}: Bank name and Account number are required`);
      }
      if (bank.account_number && !validateBankAccount(bank.account_number, bank.iban)) {
        errors.push(`Bank account ${index + 1}: Invalid account number or IBAN format`);
      }
    });

    // Validate payment methods
    paymentMethods.forEach((payment, index) => {
      if (!payment.account_number?.trim()) {
        errors.push(`Payment method ${index + 1}: Account number/email is required`);
      }
      if (payment.account_number && !validatePaymentAccount(payment.type, payment.account_number)) {
        errors.push(`Payment method ${index + 1}: Invalid ${payment.type} account format`);
      }
    });

    return errors;
  };

  const handleSave = async () => {
    // Validate before saving
    const validationErrors = validateProfile();

    if (validationErrors.length > 0) {
      // Show all errors
      const errorMessage = validationErrors.join('\n• ');
      showErrorMessage(`Please fix the following errors:\n• ${errorMessage}`);
      return;
    }

    setSaving(true);
    try {
      const endpoint = userRole === 'freelancer'
        ? '/api/profile/freelancer'
        : '/api/profile/client';

      const profileData = userRole === 'freelancer' ? {
        ...personalInfo,
        ...freelancerInfo,
        skills,
        languages,
        education,
        experience,
        certifications,
        portfolio_items: portfolioItems,
        bank_accounts: bankAccounts,
        payment_methods: paymentMethods
      } : {
        ...personalInfo,
        ...clientInfo,
        education, // Add education for clients
        certifications, // Add certifications for clients
        bank_accounts: bankAccounts,
        payment_methods: paymentMethods
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use cookies for authentication
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        showSuccessMessage('Profile updated successfully!');
      } else {
        const error = await response.json();
        showErrorMessage('Failed to update profile: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showErrorMessage('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Success/Error message functions
  const showSuccessMessage = (message) => {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'notification success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const showErrorMessage = (message) => {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'notification error-notification';
    notification.style.whiteSpace = 'pre-line'; // Support line breaks
    notification.style.maxWidth = '500px';
    notification.style.maxHeight = '400px';
    notification.style.overflow = 'auto';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000); // Show longer for multiple errors
  };

  // Profile picture upload
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorMessage('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(getImageUrl(data.imagePath));
        showSuccessMessage('Profile picture updated successfully!');
      } else {
        const error = await response.json();
        showErrorMessage(error.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showErrorMessage('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper functions for adding/removing items
  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setLanguages([...languages, { ...newLanguage }]);
      setNewLanguage({ language: '', proficiency: 'intermediate' });
    }
  };

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (!newEducation.degree?.trim() || !newEducation.institution?.trim()) {
      showErrorMessage('Degree and Institution are required fields');
      return;
    }

    if (newEducation.start_date && !validateDate(newEducation.start_date)) {
      showErrorMessage('Start date cannot be in the future');
      return;
    }

    if (newEducation.start_date && newEducation.end_date && !validateDateRange(newEducation.start_date, newEducation.end_date)) {
      showErrorMessage('Start date must be before end date');
      return;
    }

    setEducation([...education, { ...newEducation }]);
    setNewEducation({
      degree: '',
      institution: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    showSuccessMessage('Education added successfully');
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    if (!newExperience.title?.trim() || !newExperience.company?.trim()) {
      showErrorMessage('Job title and Company are required fields');
      return;
    }

    if (newExperience.start_date && !validateDate(newExperience.start_date)) {
      showErrorMessage('Start date cannot be in the future');
      return;
    }

    if (!newExperience.currently_working && newExperience.start_date && newExperience.end_date && !validateDateRange(newExperience.start_date, newExperience.end_date)) {
      showErrorMessage('Start date must be before end date');
      return;
    }

    setExperience([...experience, { ...newExperience }]);
    setNewExperience({
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      description: '',
      currently_working: false
    });
    showSuccessMessage('Experience added successfully');
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (!newCertification.name?.trim() || !newCertification.issuing_organization?.trim()) {
      showErrorMessage('Certification name and Issuing Organization are required fields');
      return;
    }

    if (newCertification.credential_url && !validateUrl(newCertification.credential_url)) {
      showErrorMessage('Please enter a valid URL for the credential (must include http:// or https://)');
      return;
    }

    if (newCertification.issue_date && newCertification.expiry_date && !validateDateRange(newCertification.issue_date, newCertification.expiry_date)) {
      showErrorMessage('Issue date must be before expiry date');
      return;
    }

    setCertifications([...certifications, { ...newCertification }]);
    setNewCertification({
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: ''
    });
    showSuccessMessage('Certification added successfully');
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addPortfolio = () => {
    if (!newPortfolio.title?.trim()) {
      showErrorMessage('Project title is required');
      return;
    }

    if (newPortfolio.url && !validateUrl(newPortfolio.url)) {
      showErrorMessage('Please enter a valid project URL (must include http:// or https://)');
      return;
    }

    if (newPortfolio.image && !validateUrl(newPortfolio.image)) {
      showErrorMessage('Please enter a valid image URL (must include http:// or https://)');
      return;
    }

    setPortfolioItems([...portfolioItems, { ...newPortfolio }]);
    setNewPortfolio({
      title: '',
      description: '',
      url: '',
      image: '',
      tags: ''
    });
    showSuccessMessage('Portfolio item added successfully');
  };

  const removePortfolio = (index) => {
    setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
  };

  const addBankAccount = () => {
    if (!newBankAccount.bank_name?.trim() || !newBankAccount.account_number?.trim()) {
      showErrorMessage('Bank name and Account number are required fields');
      return;
    }

    if (!validateBankAccount(newBankAccount.account_number, newBankAccount.iban)) {
      showErrorMessage('Invalid account number (10-20 digits) or IBAN format (e.g., PK36SCBL0000001123456702)');
      return;
    }

    setBankAccounts([...bankAccounts, { ...newBankAccount }]);
    setNewBankAccount({
      bank_name: '',
      account_title: '',
      account_number: '',
      iban: '',
      branch_code: ''
    });
    showSuccessMessage('Bank account added successfully');
  };

  const removeBankAccount = (index) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.account_number?.trim()) {
      showErrorMessage('Account number/email is required');
      return;
    }

    if (!validatePaymentAccount(newPaymentMethod.type, newPaymentMethod.account_number)) {
      let hint = '';
      switch (newPaymentMethod.type) {
        case 'jazzcash':
        case 'easypaisa':
          hint = 'Enter 11-digit mobile number (e.g., 03001234567)';
          break;
        case 'paypal':
        case 'stripe':
        case 'payoneer':
        case 'skrill':
          hint = 'Enter valid email address';
          break;
        case 'bank_transfer':
          hint = 'Enter 10-20 digit account number';
          break;
        case 'western_union':
        case 'moneygram':
          hint = 'Enter 10-digit MTCN number';
          break;
        case 'cryptocurrency':
          hint = 'Enter valid crypto wallet address (26-42 characters)';
          break;
        case 'wise':
          hint = 'Enter email or account number';
          break;
      }
      showErrorMessage(`Invalid ${newPaymentMethod.type} account format. ${hint}`);
      return;
    }

    setPaymentMethods([...paymentMethods, { ...newPaymentMethod }]);
    setNewPaymentMethod({
      type: 'jazzcash',
      account_number: '',
      account_name: ''
    });
    showSuccessMessage('Payment method added successfully');
  };

  const removePaymentMethod = (index) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-header">
        <h1>Profile Settings</h1>
        <button
          className="btn-save-profile"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Profile Picture Section */}
      <div className="profile-picture-section">
        <div className="profile-picture-wrapper">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-picture-placeholder">
              <User size={64} />
            </div>
          )}
          {uploadingImage && <div className="uploading-overlay">Uploading...</div>}
        </div>
        <div className="profile-picture-actions">
          <label htmlFor="profile-image-input" className="btn-upload-image">
            Upload Profile Picture
          </label>
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: 'none' }}
          />
          <p className="image-hint">JPG, PNG or GIF. Max size 5MB</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        {userRole === 'freelancer' && (
          <>
            <button
              className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              Professional
            </button>
            <button
              className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              Education
            </button>
            <button
              className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              Experience
            </button>
            <button
              className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
          </>
        )}
        {userRole === 'client' && (
          <>
            <button
              className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              Company Info
            </button>
            <button
              className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              Education
            </button>
          </>
        )}
        <button
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment & Banking
        </button>
      </div>

      <div className="profile-content">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="tab-content">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  disabled
                  placeholder="Your email"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={personalInfo.date_of_birth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, date_of_birth: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={personalInfo.gender}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <h3>Address</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  value={personalInfo.state}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={personalInfo.country}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={personalInfo.postal_code}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, postal_code: e.target.value })}
                  placeholder="Postal code"
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Tab (Freelancers only) */}
        {activeTab === 'professional' && userRole === 'freelancer' && (
          <div className="tab-content">
            <h2>Professional Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Professional Title</label>
                <input
                  type="text"
                  value={freelancerInfo.title}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, title: e.target.value })}
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  rows="4"
                  value={freelancerInfo.bio}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, bio: e.target.value })}
                  placeholder="Tell clients about yourself..."
                />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  value={freelancerInfo.specialization}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, specialization: e.target.value })}
                  placeholder="e.g., Web Development"
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  value={freelancerInfo.hourly_rate}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, hourly_rate: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  value={freelancerInfo.years_of_experience}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, years_of_experience: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={freelancerInfo.is_available}
                    onChange={(e) => setFreelancerInfo({ ...freelancerInfo, is_available: e.target.checked })}
                  />
                  {' '}Available for work
                </label>
              </div>
            </div>

            <h3>Skills</h3>
            <div className="skills-section">
              <div className="skills-list">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <Trash2 size={14} onClick={() => removeSkill(index)} />
                  </span>
                ))}
              </div>
              <div className="add-skill-form">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button type="button" onClick={addSkill}>
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            <h3>Languages</h3>
            <div className="languages-section">
              {languages.map((lang, index) => (
                <div key={index} className="language-item">
                  <span>{lang.language} - {lang.proficiency}</span>
                  <Trash2 size={14} onClick={() => removeLanguage(index)} />
                </div>
              ))}
              <div className="add-language-form">
                <input
                  type="text"
                  value={newLanguage.language}
                  onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
                  placeholder="Language"
                />
                <select
                  value={newLanguage.proficiency}
                  onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="fluent">Fluent</option>
                  <option value="native">Native</option>
                </select>
                <button type="button" onClick={addLanguage}>
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            <h3>Social Links</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={freelancerInfo.linkedin_url}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="url"
                  value={freelancerInfo.github_url}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={freelancerInfo.website_url}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, website_url: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="url"
                  value={freelancerInfo.twitter_url}
                  onChange={(e) => setFreelancerInfo({ ...freelancerInfo, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Education Tab - Available for both freelancers and clients */}
        {activeTab === 'education' && (
          <div className="tab-content">
            <h2>Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="item-header">
                  <h4>{edu.degree} - {edu.institution}</h4>
                  <Trash2 size={18} onClick={() => removeEducation(index)} className="delete-icon" />
                </div>
                <p>{edu.field_of_study}</p>
                <p className="date-range">{edu.start_date} - {edu.end_date || 'Present'}</p>
                {edu.description && <p className="description">{edu.description}</p>}
              </div>
            ))}

            <div className="add-section">
              <h3>Add Education</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Degree *</label>
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                    placeholder="Bachelor's, Master's, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Institution *</label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    placeholder="University name"
                  />
                </div>
                <div className="form-group">
                  <label>Field of Study</label>
                  <input
                    type="text"
                    value={newEducation.field_of_study}
                    onChange={(e) => setNewEducation({ ...newEducation, field_of_study: e.target.value })}
                    placeholder="Computer Science, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newEducation.start_date}
                    onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newEducation.end_date}
                    onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={newEducation.description}
                    onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                    placeholder="Additional details..."
                  />
                </div>
              </div>
              <button className="btn-add" onClick={addEducation}>
                <Plus size={18} /> Add Education
              </button>
            </div>

            <h2>Certifications</h2>
            {certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <div className="item-header">
                  <h4>{cert.name}</h4>
                  <Trash2 size={18} onClick={() => removeCertification(index)} className="delete-icon" />
                </div>
                <p>{cert.issuing_organization}</p>
                <p className="date-range">Issued: {cert.issue_date} {cert.expiry_date && `- Expires: ${cert.expiry_date}`}</p>
                {cert.credential_id && <p>ID: {cert.credential_id}</p>}
                {cert.credential_url && <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">View Credential</a>}
              </div>
            ))}

            <div className="add-section">
              <h3>Add Certification</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Certification Name *</label>
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    placeholder="AWS Certified, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Issuing Organization *</label>
                  <input
                    type="text"
                    value={newCertification.issuing_organization}
                    onChange={(e) => setNewCertification({ ...newCertification, issuing_organization: e.target.value })}
                    placeholder="Amazon, Microsoft, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    value={newCertification.issue_date}
                    onChange={(e) => setNewCertification({ ...newCertification, issue_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={newCertification.expiry_date}
                    onChange={(e) => setNewCertification({ ...newCertification, expiry_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Credential ID</label>
                  <input
                    type="text"
                    value={newCertification.credential_id}
                    onChange={(e) => setNewCertification({ ...newCertification, credential_id: e.target.value })}
                    placeholder="ABC123..."
                  />
                </div>
                <div className="form-group">
                  <label>Credential URL</label>
                  <input
                    type="url"
                    value={newCertification.credential_url}
                    onChange={(e) => setNewCertification({ ...newCertification, credential_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button className="btn-add" onClick={addCertification}>
                <Plus size={18} /> Add Certification
              </button>
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && userRole === 'freelancer' && (
          <div className="tab-content">
            <h2>Work Experience</h2>
            {experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="item-header">
                  <h4>{exp.title} at {exp.company}</h4>
                  <Trash2 size={18} onClick={() => removeExperience(index)} className="delete-icon" />
                </div>
                <p>{exp.location}</p>
                <p className="date-range">{exp.start_date} - {exp.currently_working ? 'Present' : exp.end_date}</p>
                {exp.description && <p className="description">{exp.description}</p>}
              </div>
            ))}

            <div className="add-section">
              <h3>Add Experience</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                    placeholder="Software Engineer, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                    disabled={newExperience.currently_working}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newExperience.currently_working}
                      onChange={(e) => setNewExperience({ ...newExperience, currently_working: e.target.checked })}
                    />
                    {' '}Currently working here
                  </label>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    placeholder="Describe your responsibilities..."
                  />
                </div>
              </div>
              <button className="btn-add" onClick={addExperience}>
                <Plus size={18} /> Add Experience
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && userRole === 'freelancer' && (
          <div className="tab-content">
            <h2>Portfolio</h2>
            <div className="portfolio-grid">
              {portfolioItems.map((item, index) => (
                <div key={index} className="portfolio-item">
                  <div className="item-header">
                    <h4>{item.title}</h4>
                    <Trash2 size={18} onClick={() => removePortfolio(index)} className="delete-icon" />
                  </div>
                  <p>{item.description}</p>
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">View Project</a>}
                  {item.tags && <p className="tags">Tags: {item.tags}</p>}
                </div>
              ))}
            </div>

            <div className="add-section">
              <h3>Add Portfolio Item</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                    placeholder="Project name"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    placeholder="Describe the project..."
                  />
                </div>
                <div className="form-group">
                  <label>Project URL</label>
                  <input
                    type="url"
                    value={newPortfolio.url}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={newPortfolio.image}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group full-width">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newPortfolio.tags}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, tags: e.target.value })}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
              </div>
              <button className="btn-add" onClick={addPortfolio}>
                <Plus size={18} /> Add Portfolio Item
              </button>
            </div>
          </div>
        )}

        {/* Company Info Tab (Clients only) */}
        {activeTab === 'company' && userRole === 'client' && (
          <div className="tab-content">
            <h2>Company Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={clientInfo.company_name}
                  onChange={(e) => setClientInfo({ ...clientInfo, company_name: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <select
                  value={clientInfo.company_size}
                  onChange={(e) => setClientInfo({ ...clientInfo, company_size: e.target.value })}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={clientInfo.industry}
                  onChange={(e) => setClientInfo({ ...clientInfo, industry: e.target.value })}
                  placeholder="Technology, Finance, etc."
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={clientInfo.website_url}
                  onChange={(e) => setClientInfo({ ...clientInfo, website_url: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={clientInfo.linkedin_url}
                  onChange={(e) => setClientInfo({ ...clientInfo, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment & Banking Tab */}
        {activeTab === 'payment' && (
          <div className="tab-content">
            <h2>Bank Accounts</h2>
            {bankAccounts.map((bank, index) => (
              <div key={index} className="bank-item">
                <div className="item-header">
                  <h4>{bank.bank_name}</h4>
                  <Trash2 size={18} onClick={() => removeBankAccount(index)} className="delete-icon" />
                </div>
                <p>Account Title: {bank.account_title}</p>
                <p>Account Number: {bank.account_number}</p>
                {bank.iban && <p>IBAN: {bank.iban}</p>}
                {bank.branch_code && <p>Branch Code: {bank.branch_code}</p>}
              </div>
            ))}

            <div className="add-section">
              <h3>Add Bank Account</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    value={newBankAccount.bank_name}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, bank_name: e.target.value })}
                    placeholder="Bank name"
                  />
                </div>
                <div className="form-group">
                  <label>Account Title *</label>
                  <input
                    type="text"
                    value={newBankAccount.account_title}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, account_title: e.target.value })}
                    placeholder="Account holder name"
                  />
                </div>
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    value={newBankAccount.account_number}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, account_number: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div className="form-group">
                  <label>IBAN</label>
                  <input
                    type="text"
                    value={newBankAccount.iban}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, iban: e.target.value })}
                    placeholder="PK..."
                  />
                </div>
                <div className="form-group">
                  <label>Branch Code</label>
                  <input
                    type="text"
                    value={newBankAccount.branch_code}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, branch_code: e.target.value })}
                    placeholder="0123"
                  />
                </div>
              </div>
              <button className="btn-add" onClick={addBankAccount}>
                <Plus size={18} /> Add Bank Account
              </button>
            </div>

            <h2>Payment Methods</h2>
            {paymentMethods.map((payment, index) => (
              <div key={index} className="payment-item">
                <div className="item-header">
                  <h4>{payment.type.toUpperCase()}</h4>
                  <Trash2 size={18} onClick={() => removePaymentMethod(index)} className="delete-icon" />
                </div>
                <p>Account Name: {payment.account_name}</p>
                <p>Account Number: {payment.account_number}</p>
              </div>
            ))}

            <div className="add-section">
              <h3>Add Payment Method</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Type *</label>
                  <select
                    value={newPaymentMethod.type}
                    onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value })}
                  >
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="stripe">Stripe</option>
                    <option value="wise">Wise (TransferWise)</option>
                    <option value="payoneer">Payoneer</option>
                    <option value="skrill">Skrill</option>
                    <option value="western_union">Western Union</option>
                    <option value="moneygram">MoneyGram</option>
                    <option value="cryptocurrency">Cryptocurrency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Account Name</label>
                  <input
                    type="text"
                    value={newPaymentMethod.account_name}
                    onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, account_name: e.target.value })}
                    placeholder="Account holder name"
                  />
                </div>
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    value={newPaymentMethod.account_number}
                    onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, account_number: e.target.value })}
                    placeholder={
                      newPaymentMethod.type === 'jazzcash' || newPaymentMethod.type === 'easypaisa' ? '03001234567' :
                        newPaymentMethod.type === 'paypal' || newPaymentMethod.type === 'stripe' || newPaymentMethod.type === 'payoneer' || newPaymentMethod.type === 'skrill' || newPaymentMethod.type === 'wise' ? 'email@example.com' :
                          newPaymentMethod.type === 'bank_transfer' ? '1234567890123456' :
                            newPaymentMethod.type === 'western_union' || newPaymentMethod.type === 'moneygram' ? '1234567890' :
                              newPaymentMethod.type === 'cryptocurrency' ? 'Wallet address' :
                                'Account number or email'
                    }
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                    {newPaymentMethod.type === 'jazzcash' || newPaymentMethod.type === 'easypaisa' ? '11-digit mobile number starting with 03' :
                      newPaymentMethod.type === 'paypal' || newPaymentMethod.type === 'stripe' || newPaymentMethod.type === 'payoneer' || newPaymentMethod.type === 'skrill' ? 'Valid email address' :
                        newPaymentMethod.type === 'bank_transfer' ? '10-20 digit account number' :
                          newPaymentMethod.type === 'western_union' || newPaymentMethod.type === 'moneygram' ? '10-digit MTCN number' :
                            newPaymentMethod.type === 'cryptocurrency' ? '26-42 character wallet address' :
                              newPaymentMethod.type === 'wise' ? 'Email or account number (8+ digits)' :
                                'Enter account details'}
                  </small>
                </div>
              </div>
              <button className="btn-add" onClick={addPaymentMethod}>
                <Plus size={18} /> Add Payment Method
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
