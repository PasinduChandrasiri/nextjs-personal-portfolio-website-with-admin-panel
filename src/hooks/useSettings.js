// hooks/useSettings.js
import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';

const fallback = {
  name: 'Pasindu Chandrasiri',
  title: 'Computer Engineering Undergraduate',
  description: 'Portfolio website for Pasindu Chandrasiri',
  accentColor: '#1d4ed8',
  aboutMe:
    'I am a passionate Computer Engineering student exploring the intersections of hardware and software. This space will showcase my projects, experiences and what I am currently learning.',
  skills: [],
  experience: [],
  education: [],
  social: {},
  profileImage: '', // no local default
};

export default function useSettings() {
  const [settings, setSettings] = useState(fallback);

  useEffect(() => {
    const settingsRef = ref(database, 'settings');

    const handle = (snap) => {
      const raw = snap.val() || {};
      setSettings({
        name: raw.name ?? fallback.name,
        title: raw.title ?? fallback.title,
        description: raw.description ?? fallback.description,
        accentColor: raw.accentColor ?? fallback.accentColor,
        aboutMe: raw.aboutMe ?? fallback.aboutMe,
        skills: Array.isArray(raw.skills) ? raw.skills : fallback.skills,
        experience: Array.isArray(raw.experience) ? raw.experience : fallback.experience,
        education: Array.isArray(raw.education) ? raw.education : fallback.education,
        social: typeof raw.social === 'object' && raw.social ? raw.social : fallback.social,
        profileImage: typeof raw.profileImage === 'string' ? raw.profileImage : '',
      });
    };

    const onError = (err) => console.error('Settings load error:', err);

    onValue(settingsRef, handle, onError);
    return () => off(settingsRef, 'value', handle);
  }, []);

  return settings;
}
