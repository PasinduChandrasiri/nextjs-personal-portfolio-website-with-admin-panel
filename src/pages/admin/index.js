import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { CldUploadButton } from 'next-cloudinary';

import { database, auth } from '../../firebase';

// Helper function to create URL friendly slugs from project names
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [demo, setDemo] = useState('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Observe authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('');
    } catch (err) {
      setStatus(`Login failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpload = (result) => {
    // When an image is uploaded via Cloudinary widget, store its secure URL in state
    const url = result.info.secure_url;
    setImages((prev) => [...prev, url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || images.length === 0) {
      setStatus('Please provide a name and at least one image.');
      return;
    }
    const slug = slugify(name);
    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const data = {
      name,
      description: shortDescription,
      fullDescription,
      skills: skillsArray,
      links: {
        github,
        linkedin,
        demo,
      },
      images,
    };
    try {
      await set(ref(database, `projects/${slug}`), data);
      setStatus('Project saved successfully!');
      // Reset form fields
      setName('');
      setShortDescription('');
      setFullDescription('');
      setSkills('');
      setGithub('');
      setLinkedin('');
      setDemo('');
      setImages([]);
    } catch (err) {
      setStatus(`Error saving project: ${err.message}`);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Panel</title>
      </Head>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
            Admin Panel
          </h1>
          {/* If user is not authenticated, show login form */}
          {!user && (
            <form onSubmit={handleLogin} className="space-y-6 bg-white p-6 rounded-lg shadow">
              {status && <p className="text-red-600">{status}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </form>
          )}
          {/* If authenticated, show project creation form */}
          {user && (
            <div className="space-y-6 bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-4">Logged in as {user.email}</p>
              <button
                onClick={handleLogout}
                className="mb-6 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Sign out
              </button>
              {status && <p className="text-green-600">{status}</p>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Short Description
                  </label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Description</label>
                  <textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 ">GitHub Link</label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn Link</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Demo Link</label>
                    <input
                      type="url"
                      value={demo}
                      onChange={(e) => setDemo(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Images</label>
                  <CldUploadButton
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    options={{ multiple: true, maxFiles: 10 }}
                    onUpload={handleUpload}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Upload Images
                  </CldUploadButton>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {images.map((url, idx) => (
                      <img key={idx} src={url} alt={`Preview ${idx}`} className="w-full h-32 object-cover rounded" />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Save Project
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}