"use client";

import React, { useState, useEffect } from 'react';
import { db, app } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getBrandIcon } from '@/components/connect/BrandIcons';
import { Trash2, ArrowUp, ArrowDown, Plus, Image as ImageIcon, Save, LogOut } from 'lucide-react';

interface ProfileData {
  bgImageUrl: string;
  useSolidBg: boolean;
  solidBgColor: string;
  profileImageUrl: string;
  title: string;
  subtitle: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconType: string;
  isActive: boolean;
}

const ICON_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'kakao', label: 'Kakao' },
  { value: 'wechat', label: 'WeChat' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
];

const DEFAULT_PROFILE: ProfileData = {
  bgImageUrl: '',
  useSolidBg: true,
  solidBgColor: '#111827',
  profileImageUrl: '',
  title: 'EcoDivers',
  subtitle: 'All-in-One Connect System',
};

export default function ManageConnectPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const storage = getStorage(app);

  // Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/verify-connect-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setAuthError('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setAuthError('인증 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const profileSnap = await getDoc(doc(db, 'mobile_connect_isolated', 'profile_data'));
      if (profileSnap.exists()) {
        setProfile({ ...DEFAULT_PROFILE, ...profileSnap.data() } as ProfileData);
      }
      const linksSnap = await getDoc(doc(db, 'mobile_connect_isolated', 'links_data'));
      if (linksSnap.exists()) {
        setLinks(linksSnap.data().links || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert('데이터를 불러오는데 실패했습니다.');
    }
    setLoading(false);
  };

  // Save Data
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'mobile_connect_isolated', 'profile_data'), profile);
      await setDoc(doc(db, 'mobile_connect_isolated', 'links_data'), { links });
      alert('성공적으로 저장되었습니다.');
    } catch (error) {
      console.error("Error saving data:", error);
      alert('저장에 실패했습니다.');
    }
    setSaving(false);
  };

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'profile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Use timestamp to make filename unique
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `mobile-connect/${type}_${timestamp}_${file.name}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (type === 'bg') {
        setProfile({ ...profile, bgImageUrl: downloadURL, useSolidBg: false });
      } else {
        setProfile({ ...profile, profileImageUrl: downloadURL });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  // Link Management
  const addLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: '새 링크',
      url: 'https://',
      iconType: 'website',
      isActive: true,
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const removeLink = (id: string) => {
    if(confirm('정말 이 링크를 삭제하시겠습니까?')) {
      setLinks(links.filter(link => link.id !== id));
    }
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newLinks = [...links];
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
      setLinks(newLinks);
    } else if (direction === 'down' && index < links.length - 1) {
      const newLinks = [...links];
      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
      setLinks(newLinks);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Mobile Connect Admin</h1>
          <p className="text-gray-500 mb-6 text-center">제어판 접근을 위해 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Password"
                required
              />
            </div>
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '인증 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">모바일 링크 관리 (Mobile Connect)</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => window.open('/connect', '_blank')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              페이지 미리보기
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">프로필 설정</h2>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">프로필 이미지</label>
              <div className="flex items-center gap-4">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'profile')}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">대표 이름 (Title)</label>
              <input 
                type="text" 
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">서브 타이틀 (Subtitle)</label>
              <input 
                type="text" 
                value={profile.subtitle}
                onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Background Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">배경 설정</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={profile.useSolidBg} 
                  onChange={() => setProfile({ ...profile, useSolidBg: true })}
                />
                <span className="text-sm font-medium">단색 배경</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={!profile.useSolidBg} 
                  onChange={() => setProfile({ ...profile, useSolidBg: false })}
                />
                <span className="text-sm font-medium">이미지 배경</span>
              </label>
            </div>

            {profile.useSolidBg ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">배경 색상 (Hex 코드)</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={profile.solidBgColor}
                    onChange={(e) => setProfile({ ...profile, solidBgColor: e.target.value })}
                    className="h-10 w-10 p-1 border rounded"
                  />
                  <input 
                    type="text" 
                    value={profile.solidBgColor}
                    onChange={(e) => setProfile({ ...profile, solidBgColor: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">배경 이미지 업로드</label>
                {profile.bgImageUrl && (
                  <img src={profile.bgImageUrl} alt="Background" className="w-full h-32 object-cover rounded-lg border mb-2" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'bg')}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Links Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-bold text-gray-800">링크 목록 관리</h2>
            <button 
              onClick={addLink}
              className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-medium"
            >
              <Plus size={16} /> 링크 추가
            </button>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={link.id} className="flex flex-col md:flex-row gap-3 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-1 w-full md:w-auto md:pr-4 md:border-r border-gray-300">
                  <button onClick={() => moveLink(index, 'up')} disabled={index === 0} className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => moveLink(index, 'down')} disabled={index === links.length - 1} className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30">
                    <ArrowDown size={16} />
                  </button>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                  <div className="lg:col-span-2">
                    <select 
                      value={link.iconType} 
                      onChange={(e) => updateLink(link.id, 'iconType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      {ICON_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-4">
                    <input 
                      type="text" 
                      placeholder="버튼 타이틀 (예: 예약하기)" 
                      value={link.title}
                      onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <input 
                      type="text" 
                      placeholder="URL 주소 (https://...)" 
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="lg:col-span-2 flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={link.isActive}
                        onChange={(e) => updateLink(link.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{link.isActive ? '노출' : '숨김'}</span>
                    </label>
                    <button 
                      onClick={() => removeLink(link.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {links.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                등록된 링크가 없습니다. [링크 추가] 버튼을 눌러주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
