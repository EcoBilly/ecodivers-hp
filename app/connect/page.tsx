"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getBrandIcon } from '@/components/connect/BrandIcons';

interface ProfileData {
  bgImageUrl?: string;
  useSolidBg?: boolean;
  solidBgColor?: string;
  profileImageUrl?: string;
  title?: string;
  subtitle?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconType: string;
  isActive: boolean;
}

export default function ConnectPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileSnap = await getDoc(doc(db, 'mobile_connect_isolated', 'profile_data'));
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as ProfileData);
        }

        const linksSnap = await getDoc(doc(db, 'mobile_connect_isolated', 'links_data'));
        if (linksSnap.exists()) {
          const linksData = linksSnap.data().links || [];
          setLinks(linksData);
        }
      } catch (error) {
        console.error("Error fetching connect data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const bgStyle = profile?.useSolidBg
    ? { backgroundColor: profile?.solidBgColor || '#111827' }
    : {
        backgroundImage: `url(${profile?.bgImageUrl || ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };

  return (
    <div style={bgStyle} className="min-h-screen w-full font-sans">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col relative bg-black/30">
        
        {/* Profile Section */}
        <div className="pt-16 pb-8 px-6 flex flex-col items-center text-center">
          {profile?.profileImageUrl ? (
            <img 
              src={profile.profileImageUrl} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shadow-lg mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-700 border-2 border-white/20 mb-4 flex items-center justify-center shadow-lg">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          <h1 className="text-xl font-bold text-white mb-1 tracking-tight drop-shadow-md">
            {profile?.title || 'EcoDivers Connect'}
          </h1>
          <p className="text-sm text-gray-200 font-medium drop-shadow-md">
            {profile?.subtitle || 'All-in-One Connect System'}
          </p>
        </div>

        {/* Links Section */}
        <div className="flex-1 px-6 pb-12 flex flex-col gap-3">
          {links.filter(link => link.isActive).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full min-h-[56px] flex items-center p-3 rounded-xl 
                       bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]
                       transition-all hover:bg-white/20 active:scale-[0.98] group"
            >
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                {getBrandIcon(link.iconType, { width: 28, height: 28 })}
              </div>
              <div className="flex-1 text-center font-semibold text-white tracking-wide pr-10 drop-shadow-sm">
                {link.title}
              </div>
            </a>
          ))}
          {links.filter(link => link.isActive).length === 0 && (
            <div className="text-center text-white/70 py-10">No links available</div>
          )}
        </div>

        {/* Footer Section */}
        <div className="py-6 text-center mt-auto">
          <p className="text-xs text-white/50 font-medium">
            © {new Date().getFullYear()} EcoDivers. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
