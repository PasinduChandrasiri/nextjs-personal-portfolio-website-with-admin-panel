import { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import siteConfig from '../config';

/**
 * Hook to read site‐wide settings from the Firebase Realtime Database.
 *
 * The settings node contains keys such as name, title, description,
 * accentColor, social links, aboutMe, skills, experience, education
 * and profileImage. If nothing exists in the database the values from
 * the static siteConfig are used instead. The hook listens for
 * realtime updates so changes made in the admin panel are immediately
 * reflected across the site.
 */
export default function useSettings() {
  const [settings, setSettings] = useState(siteConfig);

  useEffect(() => {
    const settingsRef = ref(database, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Merge database settings with defaults from siteConfig to avoid
        // accidentally dropping keys when only a subset is stored in db.
        setSettings({ ...siteConfig, ...data });
      } else {
        setSettings(siteConfig);
      }
    });
    return () => unsubscribe();
  }, []);

  return settings;
}