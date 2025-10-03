import { useState, useEffect } from 'react';
import Head from 'next/head';
import { auth, database } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, remove, onValue } from 'firebase/database';
import useSettings from '../../hooks/useSettings';
import { CldUploadButton } from 'next-cloudinary';
import Header from '../../components/Header';

// Helper to slugify strings for project keys
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function AdminPage() {
  const settings = useSettings();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Tab navigation
  const [activeTab, setActiveTab] = useState('projects');
  // Local state for editable settings
  const [localSettings, setLocalSettings] = useState(settings);
  // Projects list
  const [projectList, setProjectList] = useState([]);
  /**
   * Currently editing project slug. If null, the form is in "add" mode.
   */
  const [editingSlug, setEditingSlug] = useState(null);
  // Form fields for project creation/editing
  const [projName, setProjName] = useState('');
  const [projShortDesc, setProjShortDesc] = useState('');
  const [projFullDesc, setProjFullDesc] = useState('');
  const [projSkills, setProjSkills] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLinkedin, setProjLinkedin] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [projImages, setProjImages] = useState([]);
  // Experience & Education editing arrays (local copy)
  const [expList, setExpList] = useState([]);
  const [eduList, setEduList] = useState([]);

  // Sync local copy with settings when settings update
  useEffect(() => {
    setLocalSettings(settings);
    setExpList(settings.experience || []);
    setEduList(settings.education || []);
  }, [settings]);

  // Fetch projects list for admin view
  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({ slug: key, ...data[key] }));
        setProjectList(list);
      } else {
        setProjectList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Observe authentication state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Authentication handlers
  async function handleLogin(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('');
    } catch (err) {
      setStatus(`Login failed: ${err.message}`);
    }
  }
  async function handleLogout() {
    await signOut(auth);
  }

  // Update settings in realtime database
  async function saveSettings(updated) {
    try {
      await set(ref(database, 'settings'), updated);
      setStatus('Settings saved successfully.');
    } catch (err) {
      setStatus(`Error saving settings: ${err.message}`);
    }
  }

  // Handlers for saving each section
  const handleSaveGeneral = () => {
    const updated = {
      ...settings,
      name: localSettings.name,
      title: localSettings.title,
      description: localSettings.description,
      accentColor: localSettings.accentColor,
    };
    saveSettings(updated);
  };
  const handleSaveAbout = () => {
    saveSettings({ ...settings, aboutMe: localSettings.aboutMe });
  };
  const handleSaveSkills = () => {
    const skillsArr = localSettings.skills.filter((s) => s && s.trim().length > 0);
    saveSettings({ ...settings, skills: skillsArr });
  };
  const handleSaveSocial = () => {
    saveSettings({ ...settings, social: { ...localSettings.social } });
  };
  const handleSaveExperience = () => {
    saveSettings({ ...settings, experience: expList });
  };
  const handleSaveEducation = () => {
    saveSettings({ ...settings, education: eduList });
  };
  const handleSaveProfileImage = () => {
    saveSettings({ ...settings, profileImage: localSettings.profileImage });
  };

  // Project CRUD handlers
  const handleUploadProjectImage = (result) => {
    const url = result.info.secure_url;
    setProjImages((prev) => [...prev, url]);
  };
  /**
   * Save a project. If editingSlug is null, create a new project; otherwise
   * update the existing project at the editingSlug key. The slug will be
   * derived from the project name for new projects. A project must have
   * a name and at least one image to be saved.
   */
  async function handleSaveProject(e) {
    e.preventDefault();
    if (!projName || projImages.length === 0) {
      setStatus('Project name and at least one image are required.');
      return;
    }
    const slug = editingSlug || slugify(projName);
    const skillsArray = projSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const data = {
      name: projName,
      description: projShortDesc,
      fullDescription: projFullDesc,
      skills: skillsArray,
      links: {
        github: projGithub,
        linkedin: projLinkedin,
        demo: projDemo,
      },
      images: projImages,
    };
    try {
      await set(ref(database, `projects/${slug}`), data);
      setStatus(`Project ${editingSlug ? 'updated' : 'saved'} successfully.`);
      // Reset form and editing state
      resetProjectForm();
    } catch (err) {
      setStatus(`Error saving project: ${err.message}`);
    }
  }

  /**
   * Populate the project form with data for editing. Sets editingSlug and
   * loads the existing values into the form fields. Also scrolls to the
   * top of the form for convenience.
   */
  function editProject(proj) {
    setEditingSlug(proj.slug);
    setProjName(proj.name || '');
    setProjShortDesc(proj.description || '');
    setProjFullDesc(proj.fullDescription || '');
    setProjSkills((proj.skills || []).join(', '));
    setProjGithub(proj.links?.github || '');
    setProjLinkedin(proj.links?.linkedin || '');
    setProjDemo(proj.links?.demo || '');
    setProjImages(proj.images || []);
    // Scroll to top of page to bring form into view
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Reset the project form fields and clear editing state.
   */
  function resetProjectForm() {
    setEditingSlug(null);
    setProjName('');
    setProjShortDesc('');
    setProjFullDesc('');
    setProjSkills('');
    setProjGithub('');
    setProjLinkedin('');
    setProjDemo('');
    setProjImages([]);
  }
  async function deleteProject(slug) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await remove(ref(database, `projects/${slug}`));
      setStatus('Project deleted.');
    } catch (err) {
      setStatus(`Error deleting project: ${err.message}`);
    }
  }

  // Handlers for editing exp/edu lists
  const addExperience = () => {
    setExpList((prev) => [...prev, { company: '', title: '', dateRange: '', bullets: [''] }]);
  };
  const updateExperienceField = (idx, field, value) => {
    setExpList((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };
  const updateExperienceBullet = (idx, bulletIdx, value) => {
    setExpList((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, bullets: item.bullets.map((b, j) => (j === bulletIdx ? value : b)) } : item
      )
    );
  };
  const addExperienceBullet = (idx) => {
    setExpList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, bullets: [...item.bullets, ''] } : item))
    );
  };
  const deleteExperience = (idx) => {
    setExpList((prev) => prev.filter((_, i) => i !== idx));
  };

  const addEducation = () => {
    setEduList((prev) => [...prev, { school: '', degree: '', dateRange: '', achievements: [''] }]);
  };
  const updateEducationField = (idx, field, value) => {
    setEduList((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };
  const updateEducationAchievement = (idx, achIdx, value) => {
    setEduList((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, achievements: item.achievements.map((a, j) => (j === achIdx ? value : a)) } : item
      )
    );
  };
  const addEducationAchievement = (idx) => {
    setEduList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, achievements: [...item.achievements, ''] } : item))
    );
  };
  const deleteEducation = (idx) => {
    setEduList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle upload of profile image
  const handleProfileUpload = (result) => {
    const url = result.info.secure_url;
    setLocalSettings((prev) => ({ ...prev, profileImage: url }));
  };

  return (
    <>
      <Head>
        <title>Admin Panel</title>
      </Head>
      <div className="min-h-screen bg-gray-700 p-4 pt-10 pb-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Admin Panel</h1>
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-6 rounded-lg bg-white p-6 shadow">
              {status && <p className="text-red-600">{status}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign in
              </button>
            </form>
          ) : (
            <div className="space-y-6 rounded-lg bg-gray-200 p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-black bg-green-400 p-2 rounded-2xl">Logged in as {user.email}</p>
                <button
                  onClick={handleLogout}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-black hover:bg-blue-400"
                >
                  Sign out
                </button>
              </div>
              {status && <p className="text-green-600">{status}</p>}
              {/* Tab navigation */}
              <nav className="mb-6 flex flex-wrap gap-4 border-b border-gray-200 pb-2 text-sm font-medium">
                {['projects', 'general', 'about', 'skills', 'experience', 'education', 'social', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
              {/* Tab contents */}
              {activeTab === 'projects' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold">{editingSlug ? 'Edit Project' : 'Add New Project'}</h2>
                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <input
                        type="text"
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Short Description</label>
                      <textarea
                        value={projShortDesc}
                        onChange={(e) => setProjShortDesc(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Description</label>
                      <textarea
                        value={projFullDesc}
                        onChange={(e) => setProjFullDesc(e.target.value)}
                        rows={5}
                        className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={projSkills}
                        onChange={(e) => setProjSkills(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">GitHub Link</label>
                        <input
                          type="url"
                          value={projGithub}
                          onChange={(e) => setProjGithub(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">LinkedIn Link</label>
                        <input
                          type="url"
                          value={projLinkedin}
                          onChange={(e) => setProjLinkedin(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Demo Link</label>
                        <input
                          type="url"
                          value={projDemo}
                          onChange={(e) => setProjDemo(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Images</label>
                      <CldUploadButton
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        options={{ multiple: true, maxFiles: 10 }}
                        onUpload={handleUploadProjectImage}
                        className="mt-2 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Upload Images
                      </CldUploadButton>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {projImages.map((url, idx) => (
                          <img key={idx} src={url} alt={`Preview ${idx}`} className="h-32 w-full rounded object-cover" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="mt-2 flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        {editingSlug ? 'Update Project' : 'Save Project'}
                      </button>
                      {editingSlug && (
                        <button
                          type="button"
                          onClick={resetProjectForm}
                          className="mt-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                  <hr className="my-6" />
                  <h2 className="text-xl font-bold">Existing Projects</h2>
                  {projectList.length === 0 && <p>No projects found.</p>}
                  <ul className="space-y-2">
                  {projectList.map((proj) => (
                      <li
                        key={proj.slug}
                        className="flex items-center justify-between gap-4 rounded border-gray-950 border-1 p-2"
                      >
                        <span className="flex-1 truncate">
                          {proj.name}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editProject(proj)}
                            className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProject(proj.slug)}
                            className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">General Settings</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={localSettings.name || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={localSettings.title || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={localSettings.description || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Accent Color</label>
                    <input
                      type="text"
                      value={localSettings.accentColor || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, accentColor: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSaveGeneral}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save General
                  </button>
                </div>
              )}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">About Me</h2>
                  <textarea
                    value={localSettings.aboutMe || ''}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, aboutMe: e.target.value }))}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={handleSaveAbout}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save About
                  </button>
                </div>
              )}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Skills</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Add Skill</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={localSettings.newSkill || ''}
                        onChange={(e) => setLocalSettings((prev) => ({ ...prev, newSkill: e.target.value }))}
                        className="flex-1 rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSkill = (localSettings.newSkill || '').trim();
                          if (newSkill) {
                            setLocalSettings((prev) => ({
                              ...prev,
                              skills: [...(prev.skills || []), newSkill],
                              newSkill: '',
                            }));
                          }
                        }}
                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {(localSettings.skills || []).map((skill, idx) => (
                      <li key={idx} className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => setLocalSettings((prev) => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== idx),
                          }))}
                          className="text-red-500"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleSaveSkills}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Skills
                  </button>
                </div>
              )}
              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Experience</h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Add Experience
                  </button>
                  {expList.map((exp, idx) => (
                    <div key={idx} className="rounded border border-gray-200 p-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Experience {idx + 1}</h3>
                        <button
                          type="button"
                          onClick={() => deleteExperience(idx)}
                          className="text-white bg-red-600 m-0 p-1 px-1.5 rounded-xl hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperienceField(idx, 'company', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperienceField(idx, 'title', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date Range</label>
                          <input
                            type="text"
                            value={exp.dateRange}
                            onChange={(e) => updateExperienceField(idx, 'dateRange', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Bullets</p>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="mt-1 flex gap-2">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => updateExperienceBullet(idx, bIdx, e.target.value)}
                              className="flex-1 rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addExperienceBullet(idx)}
                          className="mt-1 rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                        >
                          + Add Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveExperience}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Experience
                  </button>
                </div>
              )}
              {activeTab === 'education' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Education</h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Add Education
                  </button>
                  {eduList.map((edu, idx) => (
                    <div key={idx} className="rounded border border-gray-200 p-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Education {idx + 1}</h3>
                        <button
                          type="button"
                          onClick={() => deleteEducation(idx)}
                          className="text-white bg-red-600 m-0 p-1 px-1.5 rounded-xl hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">School</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducationField(idx, 'school', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducationField(idx, 'degree', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date Range</label>
                          <input
                            type="text"
                            value={edu.dateRange}
                            onChange={(e) => updateEducationField(idx, 'dateRange', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Achievements</p>
                        {edu.achievements.map((ach, aIdx) => (
                          <div key={aIdx} className="mt-1 flex gap-2">
                            <input
                              type="text"
                              value={ach}
                              onChange={(e) => updateEducationAchievement(idx, aIdx, e.target.value)}
                              className="flex-1 rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addEducationAchievement(idx)}
                          className="mt-1 rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                        >
                          + Add Achievement
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSaveEducation}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Education
                  </button>
                </div>
              )}
              {activeTab === 'social' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Social Links</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={localSettings.social?.email || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, social: { ...prev.social, email: e.target.value } }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <input
                      type="url"
                      value={localSettings.social?.linkedin || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, social: { ...prev.social, linkedin: e.target.value } }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                    <input
                      type="url"
                      value={localSettings.social?.twitter || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, social: { ...prev.social, twitter: e.target.value } }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub</label>
                    <input
                      type="url"
                      value={localSettings.social?.github || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, social: { ...prev.social, github: e.target.value } }))}
                      className="mt-1 block w-full rounded-md border-gray-950 border-1 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSaveSocial}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Social
                  </button>
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Profile Image</h2>
                  {localSettings.profileImage && (
                    <img src={localSettings.profileImage} alt="Profile preview" className="h-32 w-32 rounded-full object-cover" />
                  )}
                  <CldUploadButton
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onUpload={handleProfileUpload}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Upload Profile Image
                  </CldUploadButton>
                  <button
                    onClick={handleSaveProfileImage}
                    className="ml-3 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Save Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}