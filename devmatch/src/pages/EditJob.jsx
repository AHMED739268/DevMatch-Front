import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { showErrorToast } from '../lib/toast';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { editJob, fetchRecruiterJobs } from '../lib/recruiterApi';
import { Briefcase, FileText, MapPin, Layers, Globe, ClipboardList } from 'lucide-react';

export default function EditJob() {
  const { id } = useParams();
  const { isRecruiter } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', specialization: '', governorate: '', status: 'open', work_mode: 'onsite', job_type: 'full-time' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isRecruiter) {
      navigate('/');
      return;
    }
    const fetchJob = async () => {
      setLoading(true);
      try {
        const jobs = await fetchRecruiterJobs();
        const job = jobs.find(j => j._id === id);
        if (!job) throw new Error('Job not found');
        setForm({
          title: job.title,
          description: job.description,
          specialization: job.specialization,
          governorate: job.governorate,
          status: job.status || 'open',
          work_mode: job.work_mode || 'onsite',
          job_type: job.job_type || 'full-time'
        });
      } catch (err) {
        setError('Failed to load job.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, isRecruiter, navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await editJob(id, form);
      toast.success('Job updated!');
      navigate('/recruiter-dashboard');
    } catch (err) {
      setError('Failed to update job.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    showErrorToast(error);
    return <ToastContainer />;
  }

  return (
    <div className="edit-job-bg">
      <div className="edit-job-card">
        <div className="edit-job-title">Edit Job</div>
        <form onSubmit={handleSubmit}>
          <label className="edit-job-label"><Briefcase size={18}/> Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="edit-job-input" />

          <label className="edit-job-label"><FileText size={18}/> Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="edit-job-input" rows={4} />

          <label className="edit-job-label"><Layers size={18}/> Specialization</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} className="edit-job-input" />

          <label className="edit-job-label"><MapPin size={18}/> Governorate</label>
          <input name="governorate" value={form.governorate} onChange={handleChange} className="edit-job-input" />

          <label className="edit-job-label"><ClipboardList size={18}/> Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="edit-job-select">
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <label className="edit-job-label"><Globe size={18}/> Work Mode</label>
          <select name="work_mode" value={form.work_mode} onChange={handleChange} className="edit-job-select">
            <option value="onsite">Onsite</option>
            <option value="remotely">Remotely</option>
          </select>

          <label className="edit-job-label"><ClipboardList size={18}/> Job Type</label>
          <select name="job_type" value={form.job_type} onChange={handleChange} className="edit-job-select">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="by task">By Task</option>
          </select>

          <button type="submit" className="edit-job-btn">Save</button>
        </form>
      </div>
    </div>
  );
}
