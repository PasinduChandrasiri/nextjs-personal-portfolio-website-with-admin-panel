// src/pages/admin/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { auth, database } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, remove, onValue, update, get } from 'firebase/database';
import useSettings from '../../hooks/useSettings';
import { CldUploadButton } from 'next-cloudinary'; // still used for projects (works fine for you)

const KNOWN_KEYS = new Set([
  'name',
  'title',
  'description',
  'accentColor',
  'aboutMe',
  'skills',
  'experience',
  'education',
  'social',
  'profileImage',
]);

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// ---------- DIRECT CLOUDINARY UPLOAD (no widget) ----------
async function directUploadToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Missing Cloudinary env vars. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Cloudinary upload failed.');
  }
  if (!json.secure_url) {
    throw new Error('Cloudinary response did not include secure_url.');
  }
  return json.secure_url;
}

export default function AdminPage() {
  const settings = useSettings();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('projects');
  const [localSettings, setLocalSettings] = useState(settings);

  // keep the just-uploaded URL safe until saved
  const [pendingProfileUrl, setPendingProfileUrl] = useState('');

  // file input ref for direct upload
  const fileInputRef = useRef(null);

  // Projects
  const [projectList, setProjectList] = useState([]);
  const [editingSlug, setEditingSlug] = useState(null);
  const [projName, setProjName] = useState('');
  const [projShortDesc, setProjShortDesc] = useState('');
  const [projFullDesc, setProjFullDesc] = useState('');
  const [projSkills, setProjSkills] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLinkedin, setProjLinkedin] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [projImages, setProjImages] = useState([]);

  // Experience & education
  const [expList, setExpList] = useState([]);
  const [eduList, setEduList] = useState([]);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  // Projects list
  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    const unsub = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({ slug: key, ...data[key] }));
        setProjectList(list);
      } else {
        setProjectList([]);
      }
    });
    return () => unsub();
  }, []);

  // ONE-TIME init from DB
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setLocalSettings(settings || {});
      setExpList(settings.experience || []);
      setEduList(settings.education || []);
      setInitialized(true);
    }
  }, [settings, initialized]);

  // Refresh on tab switch ONLY (prevents clobber while editing)
  useEffect(() => {
    setLocalSettings(settings || {});
    setExpList(settings.experience || []);
    setEduList(settings.education || []);
    // Do NOT clear pendingProfileUrl here
  }, [activeTab]); // <-- critical: do not depend on `settings` here

  // Login
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

  // SETTINGS SAVE HELPERS
  async function updateSettings(partial) {
    try {
      const safe = {};
      for (const k of Object.keys(partial)) {
        if (KNOWN_KEYS.has(k)) safe[k] = partial[k];
      }
      await update(ref(database, 'settings'), safe);
      setStatus('Settings saved successfully.');
    } catch (err) {
      console.error('updateSettings error:', err);
      setStatus(`Error saving settings: ${err.message}`);
    }
  }

  const handleSaveGeneral = () => {
    updateSettings({
      name: localSettings.name || '',
      title: localSettings.title || '',
      description: localSettings.description || '',
      accentColor: localSettings.accentColor || '#1d4ed8',
    });
  };
  const handleSaveAbout = () => updateSettings({ aboutMe: localSettings.aboutMe || '' });
  const handleSaveSkills = () => {
    const skillsArr = (localSettings.skills || []).filter((s) => s && s.trim().length > 0);
    updateSettings({ skills: skillsArr });
  };
  const handleSaveSocial = () => updateSettings({ social: { ...(localSettings.social || {}) } });
  const handleSaveExperience = () => updateSettings({ experience: expList });
  const handleSaveEducation = () => updateSettings({ education: eduList });

  // -------- PROFILE IMAGE (DIRECT UPLOAD) --------
  const onPickProfileFile = () => fileInputRef.current?.click();

  const onProfileFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setStatus('Uploading image to Cloudinary...');
      const url = await directUploadToCloudinary(file);
      console.log('[DIRECT UPLOAD] secure_url:', url);
      setPendingProfileUrl(url);
      setLocalSettings((prev) => ({ ...prev, profileImage: url })); // preview
      setStatus('Upload success. Click "Save Profile" to apply.');
    } catch (err) {
      console.error('Direct upload error:', err);
      setStatus(`Upload failed: ${err.message}`);
    } finally {
      // reset the input so selecting the same file again will trigger onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfileImage = async () => {
    const chosen = (pendingProfileUrl || localSettings.profileImage || '').trim();
    console.log('[SAVE] chosen url (pending || local):', chosen, { pendingProfileUrl, local: localSettings.profileImage });

    if (!chosen) {
      setStatus('No profile image URL to save. Please upload an image first.');
      return;
    }
    try {
      const node = ref(database, 'settings/profileImage');
      console.log('[SAVE] Writing to /settings/profileImage:', chosen);
      await set(node, chosen);

      const verifySnap = await get(node);
      const saved = verifySnap.exists() ? verifySnap.val() : null;
      console.log('[VERIFY] /settings/profileImage now =', saved);

      if (saved === chosen) {
        setStatus('Profile image saved successfully.');
        setPendingProfileUrl('');
        setLocalSettings((prev) => ({ ...prev, profileImage: chosen })); // keep UI in sync immediately
      } else {
        throw new Error('Verification mismatch: DB returned a different value for /settings/profileImage.');
      }
    } catch (err) {
      console.error('handleSaveProfileImage error:', err);
      setStatus(`Error saving profile image: ${err.message}`);
    }
  };

  // -------- PROJECTS (unchanged, still using Cloudinary widget which works for you) --------
  const handleUploadProjectImage = (result) => {
    try {
      // next-cloudinary typically yields result.info.secure_url for projects (already working)
      const url =
        result?.info?.secure_url ||
        result?.secure_url ||
        (Array.isArray(result?.info?.files) && result.info.files[0]?.uploadInfo?.secure_url) ||
        '';
      if (url) {
        setProjImages((prev) => [...prev, url]);
      } else {
        setStatus('Project image upload failed. Please try again.');
      }
    } catch (e) {
      setStatus(`Project upload handler error: ${e.message}`);
    }
  };

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
      resetProjectForm();
    } catch (err) {
      setStatus(`Error saving project: ${err.message}`);
    }
  }

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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

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

  // UI
  return (
    <>
      <Head><title>Admin Panel</title></Head>

      <div className="min-h-screen bg-gray-700 p-4 pt-10 pb-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-white">Admin Panel</h1>

          {!user ? (
            <form onSubmit={handleLogin} className="space-y-6 rounded-lg bg-white p-6 shadow">
              {status && <p className="text-red-600">{status}</p>}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button type="submit" className="w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700">
                Sign in
              </button>
            </form>
          ) : (
            <div className="space-y-6 rounded-lg bg-gray-200 p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <p className="rounded-2xl bg-green-400 p-2 text-sm text-black">Logged in as {user.email}</p>
                <button onClick={handleLogout} className="rounded bg-blue-500 px-3 py-1 text-sm text-black hover:bg-blue-400">
                  Sign out
                </button>
              </div>

              {status && <p className="text-green-700">{status}</p>}

              <nav className="mb-6 flex flex-wrap gap-4 border-b border-gray-300 pb-2 text-sm font-medium">
                {['projects', 'general', 'about', 'skills', 'experience', 'education', 'social', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>

              {activeTab === 'projects' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold">{editingSlug ? 'Edit Project' : 'Add New Project'}</h2>
                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                      <label htmlFor="proj-name" className="block text-sm font-medium text-gray-700">Project Name</label>
                      <input
                        id="proj-name"
                        name="projectName"
                        type="text"
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="proj-short" className="block text-sm font-medium text-gray-700">Short Description</label>
                      <textarea
                        id="proj-short"
                        name="projectShortDescription"
                        value={projShortDesc}
                        onChange={(e) => setProjShortDesc(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="proj-full" className="block text-sm font-medium text-gray-700">Full Description</label>
                      <textarea
                        id="proj-full"
                        name="projectFullDescription"
                        value={projFullDesc}
                        onChange={(e) => setProjFullDesc(e.target.value)}
                        rows={5}
                        className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="proj-skills" className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                      <input
                        id="proj-skills"
                        name="projectSkills"
                        type="text"
                        value={projSkills}
                        onChange={(e) => setProjSkills(e.target.value)}
                        className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label htmlFor="proj-github" className="block text-sm font-medium text-gray-700">GitHub Link</label>
                        <input
                          id="proj-github"
                          name="projectGithub"
                          type="url"
                          value={projGithub}
                          onChange={(e) => setProjGithub(e.target.value)}
                          className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="proj-linkedin" className="block text-sm font-medium text-gray-700">LinkedIn Link</label>
                        <input
                          id="proj-linkedin"
                          name="projectLinkedin"
                          type="url"
                          value={projLinkedin}
                          onChange={(e) => setProjLinkedin(e.target.value)}
                          className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="proj-demo" className="block text-sm font-medium text-gray-700">Demo Link</label>
                        <input
                          id="proj-demo"
                          name="projectDemo"
                          type="url"
                          value={projDemo}
                          onChange={(e) => setProjDemo(e.target.value)}
                          className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                      <li key={proj.slug} className="flex items-center justify-between gap-4 rounded border-1 border-gray-950 p-2">
                        <span className="flex-1 truncate">{proj.name}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => editProject(proj)} className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600">Edit</button>
                          <button
                            type="button"
                            onClick={() =>
                              remove(ref(database, `projects/${proj.slug}`))
                                .then(() => setStatus('Project deleted.'))
                                .catch((err) => setStatus(`Error deleting project: ${err.message}`))
                            }
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
                    <label htmlFor="gen-name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      id="gen-name"
                      name="name"
                      type="text"
                      value={localSettings.name || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="gen-title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      id="gen-title"
                      name="title"
                      type="text"
                      value={localSettings.title || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="gen-desc" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="gen-desc"
                      name="description"
                      value={localSettings.description || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="gen-accent" className="block text-sm font-medium text-gray-700">Accent Color</label>
                    <input
                      id="gen-accent"
                      name="accentColor"
                      type="text"
                      value={localSettings.accentColor || ''}
                      onChange={(e) => setLocalSettings((prev) => ({ ...prev, accentColor: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button onClick={handleSaveGeneral} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save General
                  </button>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">About Me</h2>
                  <textarea
                    id="about-me"
                    name="aboutMe"
                    value={localSettings.aboutMe || ''}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, aboutMe: e.target.value }))}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button onClick={handleSaveAbout} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save About
                  </button>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Skills</h2>
                  <div>
                    <label htmlFor="skill-add" className="block text-sm font-medium text-gray-700">Add Skill</label>
                    <div className="flex gap-2">
                      <input
                        id="skill-add"
                        name="newSkill"
                        type="text"
                        value={localSettings.newSkill || ''}
                        onChange={(e) => setLocalSettings((prev) => ({ ...prev, newSkill: e.target.value }))}
                        className="flex-1 rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                      <li key={idx} className="flex items-center gap-1 rounded bg-gray-300 px-2 py-1 text-sm">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-red-600"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleSaveSkills} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save Skills
                  </button>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Experience</h2>
                  <button
                    type="button"
                    onClick={() => setExpList((prev) => [...prev, { company: '', title: '', dateRange: '', bullets: [''] }])}
                    className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Add Experience
                  </button>
                  {expList.map((exp, idx) => (
                    <div key={idx} className="rounded border border-gray-300 p-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Experience {idx + 1}</h3>
                        <button
                          type="button"
                          onClick={() => setExpList((prev) => prev.filter((_, i) => i !== idx))}
                          className="m-0 rounded-xl bg-red-600 p-1 px-1.5 text-white hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <div>
                          <label htmlFor={`exp-company-${idx}`} className="block text-sm font-medium text-gray-700">Company</label>
                          <input
                            id={`exp-company-${idx}`}
                            type="text"
                            value={exp.company}
                            onChange={(e) => setExpList((prev) => prev.map((it, i) => (i === idx ? { ...it, company: e.target.value } : it)))}
                            className="mt-1 w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`exp-title-${idx}`} className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            id={`exp-title-${idx}`}
                            type="text"
                            value={exp.title}
                            onChange={(e) => setExpList((prev) => prev.map((it, i) => (i === idx ? { ...it, title: e.target.value } : it)))}
                            className="mt-1 w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`exp-daterange-${idx}`} className="block text-sm font-medium text-gray-700">Date Range</label>
                          <input
                            id={`exp-daterange-${idx}`}
                            type="text"
                            value={exp.dateRange}
                            onChange={(e) => setExpList((prev) => prev.map((it, i) => (i === idx ? { ...it, dateRange: e.target.value } : it)))}
                            className="mt-1 w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Bullets</p>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="mt-1 flex gap-2">
                            <input
                              id={`exp-bullet-${idx}-${bIdx}`}
                              type="text"
                              value={bullet}
                              onChange={(e) =>
                                setExpList((prev) =>
                                  prev.map((it, i) =>
                                    i === idx
                                      ? { ...it, bullets: it.bullets.map((b, j) => (j === bIdx ? e.target.value : b)) }
                                      : it
                                  )
                                )
                              }
                              className="flex-1 rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setExpList((prev) => prev.map((it, i) => (i === idx ? { ...it, bullets: [...it.bullets, ''] } : it)))
                          }
                          className="mt-1 rounded bg-gray-300 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-400"
                        >
                          + Add Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSaveExperience} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save Experience
                  </button>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Education</h2>
                  <button
                    type="button"
                    onClick={() => setEduList((prev) => [...prev, { school: '', degree: '', dateRange: '', achievements: [''] }])}
                    className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Add Education
                  </button>
                  {eduList.map((edu, idx) => (
                    <div key={idx} className="rounded border border-gray-300 p-4">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Education {idx + 1}</h3>
                        <button
                          type="button"
                          onClick={() => setEduList((prev) => prev.filter((_, i) => i !== idx))}
                          className="m-0 rounded-xl bg-red-600 p-1 px-1.5 text-white hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <div>
                          <label htmlFor={`edu-school-${idx}`} className="block text-sm font-medium text-gray-700">School</label>
                          <input
                            id={`edu-school-${idx}`}
                            type="text"
                            value={edu.school}
                            onChange={(e) => setEduList((prev) => prev.map((it, i) => (i === idx ? { ...it, school: e.target.value } : it)))}
                            className="mt-1 w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edu-degree-${idx}`} className="block text-sm font-medium text-gray-700">Degree</label>
                          <input
                            id={`edu-degree-${idx}`}
                            type="text"
                            value={edu.degree}
                            onChange={(e) => setEduList((prev) => prev.map((it, i) => (i === idx ? { ...it, degree: e.target.value } : it)))}
                            className="mt-1 w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edu-daterange-${idx}`} className="block text-sm font-medium text-gray-700">Date Range</label>
                          <input
                            id={`edu-daterange-${idx}`}
                            type="text"
                            value={edu.dateRange}
                            onChange={(e) => setEduList((prev) => prev.map((it, i) => (i === idx ? { ...it, dateRange: e.target.value } : it)))}
                            className="mt-1 w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Achievements</p>
                        {edu.achievements.map((ach, aIdx) => (
                          <div key={aIdx} className="mt-1 flex gap-2">
                            <input
                              id={`edu-ach-${idx}-${aIdx}`}
                              type="text"
                              value={ach}
                              onChange={(e) =>
                                setEduList((prev) =>
                                  prev.map((it, i) =>
                                    i === idx
                                      ? { ...it, achievements: it.achievements.map((a, j) => (j === aIdx ? e.target.value : a)) }
                                      : it
                                  )
                                )
                              }
                              className="flex-1 rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setEduList((prev) => prev.map((it, i) => (i === idx ? { ...it, achievements: [...it.achievements, ''] } : it)))
                          }
                          className="mt-1 rounded bg-gray-300 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-400"
                        >
                          + Add Achievement
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSaveEducation} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save Education
                  </button>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Social Links</h2>
                  <div>
                    <label htmlFor="social-email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="social-email"
                      name="socialEmail"
                      type="email"
                      value={localSettings.social?.email || ''}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({ ...prev, social: { ...(prev.social || {}), email: e.target.value } }))
                      }
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="social-linkedin" className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <input
                      id="social-linkedin"
                      name="socialLinkedin"
                      type="url"
                      value={localSettings.social?.linkedin || ''}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({ ...prev, social: { ...(prev.social || {}), linkedin: e.target.value } }))
                      }
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700">Twitter</label>
                    <input
                      id="social-twitter"
                      name="socialTwitter"
                      type="url"
                      value={localSettings.social?.twitter || ''}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({ ...prev, social: { ...(prev.social || {}), twitter: e.target.value } }))
                      }
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="social-github" className="block text-sm font-medium text-gray-700">GitHub</label>
                    <input
                      id="social-github"
                      name="socialGithub"
                      type="url"
                      value={localSettings.social?.github || ''}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({ ...prev, social: { ...(prev.social || {}), github: e.target.value } }))
                      }
                      className="mt-1 block w-full rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button onClick={handleSaveSocial} className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save Social
                  </button>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Profile Image</h2>

                  {(pendingProfileUrl || localSettings.profileImage) && (
                    <img
                      src={pendingProfileUrl || localSettings.profileImage}
                      alt="Profile preview"
                      className="h-32 w-32 rounded-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                    />
                  )}

                  {/* Direct upload (no widget) */}
                  <input
                    id="profile-file"
                    name="profileFile"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onProfileFileSelected}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={onPickProfileFile}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Upload Profile Image
                    </button>
                    <input
                      type="url"
                      placeholder="Or paste an image URL here"
                      value={pendingProfileUrl || localSettings.profileImage || ''}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        setPendingProfileUrl(v);
                        setLocalSettings((prev) => ({ ...prev, profileImage: v }));
                      }}
                      className="flex-1 min-w-[240px] rounded-md border-1 border-gray-950 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={handleSaveProfileImage}
                      className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Save Profile
                    </button>
                  </div>

                  <p className="text-xs text-gray-600">
                    Tip: this uploader bypasses the Cloudinary widget (which was closing early) and uploads directly to your Cloudinary preset.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
