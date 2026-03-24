import { useState, useEffect, useContext } from 'react';
import { workerService } from '../services/workerService';
import WorkerCard from '../components/worker/WorkerCard';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: 'badge-warning',
  Accepted: 'badge-success',
  Rejected: 'badge-danger',
  Completed: 'badge-info',
};

export default function Workers() {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [workers, setWorkers] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(role === 'Worker' ? 'open_jobs' : 'browse');
  const [profile, setProfile] = useState({ skills: '', experience_years: 0, daily_rate: 0, location: '' });
  const [registering, setRegistering] = useState(false);
  const [requested, setRequested] = useState(null); 
  const [jobForm, setJobForm] = useState({ job_description: '', expected_days: 1, agreed_rate: 0, location: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadBrowse = async () => {
    try {
      if (role !== 'Worker') {
        const { data } = await workerService.list();
        setWorkers(data);
      }
    } catch { toast.error('Failed to load workers'); }
  };

  const loadMyJobs = async () => {
    try {
      const { data } = await workerService.getMyJobs();
      setMyJobs(data);
    } catch { toast.error('Failed to load jobs'); }
  };

  const loadOpenJobs = async () => {
    try {
      const { data } = await workerService.getOpenJobs();
      setOpenJobs(data);
    } catch { toast.error('Failed to load open jobs'); }
  };

  useEffect(() => {
    Promise.all([loadBrowse(), loadMyJobs(), loadOpenJobs()]).finally(() => setLoading(false));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await workerService.register(profile);
      toast.success('Worker profile registered!');
      loadBrowse();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await workerService.requestJob({ worker_id: requested, ...jobForm });
      toast.success('Job request sent!');
      setRequested(null);
      loadMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (jobId, status) => {
    try {
      await workerService.updateStatus(jobId, { status });
      toast.success(`Marked as ${status}`);
      loadMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleAcceptOpenJob = async (jobId) => {
    try {
      await workerService.acceptJob(jobId);
      toast.success('Job accepted! It is now in My Jobs.');
      loadMyJobs();
      loadOpenJobs();
      setTab('jobs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept job');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div>
      <div className="page-header">
        <h1>👷 Farm Worker Hub</h1>
        <p>{role === 'Worker' ? 'Manage your worker profile and jobs' : 'Find skilled farm workers'}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {role === 'Worker' && (
          <button className={`btn btn-sm ${tab === 'open_jobs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('open_jobs')}>Open Jobs</button>
        )}
        {role === 'Worker' && (
          <button className={`btn btn-sm ${tab === 'profile' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('profile')}>My Profile</button>
        )}
        {role !== 'Worker' && (
          <button className={`btn btn-sm ${tab === 'browse' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('browse')}>Browse Workers</button>
        )}
        {role !== 'Worker' && (
          <button className={`btn btn-sm ${tab === 'post_job' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('post_job')}>Post Open Job</button>
        )}
        <button className={`btn btn-sm ${tab === 'jobs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('jobs')}>
          My Jobs {myJobs.length > 0 && <span style={{ marginLeft: 4, background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: '.7rem' }}>{myJobs.length}</span>}
        </button>
      </div>

      {/* Worker: Open Jobs */}
      {tab === 'open_jobs' && role === 'Worker' && (
        <div className="card">
          <div className="card-header"><h2>Available Jobs in Marketplace</h2></div>
          {openJobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>No open jobs right now. Check back later!</p>
          ) : (
            <div className="grid-3">
              {openJobs.map(job => (
                <div key={job.id} className="card" style={{ padding: 16 }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>{job.farmer_name}</h3>
                  <div style={{ fontSize: '0.875rem', marginBottom: 16 }}>
                    <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>📍 {job.location}</p>
                    <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>⏳ {job.expected_days} Days</p>
                    <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>💰 ₹{parseFloat(job.agreed_rate).toFixed(2)}</p>
                    <p style={{ margin: '8px 0', fontStyle: 'italic' }}>"{job.job_description}"</p>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleAcceptOpenJob(job.id)}>Accept Job</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Farmer: Post Open Job */}
      {tab === 'post_job' && role !== 'Worker' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-header"><h2>Post an Open Job Request</h2></div>
          <form onSubmit={handleRequest}>
            <div className="form-group">
              <label>Job Description</label>
              <textarea rows={3} value={jobForm.job_description} onChange={e => setJobForm({ ...jobForm, job_description: e.target.value })} placeholder="Describe the work required..." required style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Expected Days</label>
                <input type="number" min="1" value={jobForm.expected_days} onChange={e => setJobForm({ ...jobForm, expected_days: parseInt(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Offered Daily Rate (₹)</label>
                <input type="number" min="0" step="0.01" value={jobForm.agreed_rate} onChange={e => setJobForm({ ...jobForm, agreed_rate: parseFloat(e.target.value) })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Farm Location</label>
              <input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Village / District" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Posting...' : 'Post to Job Board'}
            </button>
          </form>
        </div>
      )}

      {/* Worker: Register Profile */}
      {tab === 'profile' && role === 'Worker' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-header"><h2>Register / Update Profile</h2></div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} placeholder="e.g. Ploughing, Harvesting, Irrigation" required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Experience (years)</label>
                <input type="number" min="0" value={profile.experience_years} onChange={e => setProfile({ ...profile, experience_years: parseInt(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Daily Rate (₹)</label>
                <input type="number" min="0" step="0.01" value={profile.daily_rate} onChange={e => setProfile({ ...profile, daily_rate: parseFloat(e.target.value) })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Village / District" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={registering} style={{ width: '100%' }}>
              {registering ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Farmer: Browse Workers */}
      {tab === 'browse' && role !== 'Worker' && (
        <>
          {requested && (
            <div className="card" style={{ marginBottom: 24, background: 'var(--green-50)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Request Worker</h2>
                <button className="btn btn-sm btn-outline" onClick={() => setRequested(null)}>✕ Cancel</button>
              </div>
              <form onSubmit={handleRequest}>
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea rows={3} value={jobForm.job_description} onChange={e => setJobForm({ ...jobForm, job_description: e.target.value })} placeholder="Describe the work required…" required style={{ resize: 'vertical' }} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Expected Days</label>
                    <input type="number" min="1" value={jobForm.expected_days} onChange={e => setJobForm({ ...jobForm, expected_days: parseInt(e.target.value) })} required />
                  </div>
                  <div className="form-group">
                    <label>Agreed Daily Rate (₹)</label>
                    <input type="number" min="0" step="0.01" value={jobForm.agreed_rate} onChange={e => setJobForm({ ...jobForm, agreed_rate: parseFloat(e.target.value) })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Farm Location</label>
                  <input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Village / District" required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
              </form>
            </div>
          )}

          <div className="grid-3">
            {workers.map(w => (
              <WorkerCard key={w.worker_id} worker={w} onHire={() => { setRequested(w.worker_id); setJobForm({ ...jobForm, agreed_rate: w.daily_rate }); }} />
            ))}
          </div>
        </>
      )}

      {/* Everyone: My Jobs */}
      {tab === 'jobs' && (
        <div className="card">
          <div className="card-header"><h2>{role === 'Worker' ? 'Incoming Job Requests' : 'My Job Requests'}</h2></div>
          {myJobs.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>No jobs found.</p>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      {role === 'Worker' ? <th>Farmer</th> : <th>Worker</th>}
                      <th>Description</th>
                      <th>Days</th>
                      <th>Rate</th>
                      <th>Status</th>
                      {role === 'Worker' && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {myJobs.map(job => (
                      <tr key={job.id}>
                        <td style={{ fontSize: '.8rem', whiteSpace: 'nowrap' }}>{new Date(job.created_at).toLocaleDateString()}</td>
                        <td style={{ fontSize: '.85rem' }}>{role === 'Worker' ? (job.farmer_name || '—') : (job.worker_name || '—')}</td>
                        <td style={{ fontSize: '.8rem', maxWidth: 200 }}>{job.job_description}</td>
                        <td>{job.expected_days}</td>
                        <td>₹{parseFloat(job.agreed_rate).toFixed(2)}</td>
                        <td><span className={`badge ${STATUS_COLORS[job.status] || 'badge-info'}`}>{job.status}</span></td>
                        {role === 'Worker' && job.status === 'Pending' && (
                          <td>
                            <button className="btn btn-sm btn-success" style={{ marginRight: 4 }} onClick={() => handleStatus(job.id, 'Accepted')}>Accept</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleStatus(job.id, 'Rejected')}>Reject</button>
                          </td>
                        )}
                        {role === 'Worker' && job.status === 'Accepted' && (
                          <td>
                            <button className="btn btn-sm btn-primary" onClick={() => handleStatus(job.id, 'Completed')}>Mark Done</button>
                          </td>
                        )}
                        {role === 'Worker' && !['Pending', 'Accepted'].includes(job.status) && <td />}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
