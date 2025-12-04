'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, User, Github, Cloud } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export function Navbar() {
    const { data: session } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch user profile to check API connections
    useEffect(() => {
        console.log('Navbar session:', session);
        if (session?.user) {
            fetchProfile();
        }

        // 설정 페이지에서 프로필 업데이트 시 다시 불러오기
        const handleProfileUpdate = () => {
            fetchProfile();
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [session]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/user/profile');
            setProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <nav className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary-50 p-2 rounded-lg">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            School Breeze
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/templates" className="text-gray-600 hover:text-primary transition-colors font-medium">
                            자료나눔터
                        </Link>
                        <Link href="/guide" className="text-gray-600 hover:text-primary transition-colors font-medium">
                            이용 가이드
                        </Link>

                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                {/* API Connection Status */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                    {/* GitHub */}
                                    <div className="relative group">
                                        <Github className={`w-4 h-4 ${session ? 'text-green-600' : 'text-gray-300'}`} />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            GitHub {session ? '연결됨' : '연결 안 됨'}
                                        </div>
                                    </div>

                                    {/* Vercel */}
                                    <div className="relative group">
                                        <svg className={`w-4 h-4 ${profile?.hasVercelToken ? 'text-green-600' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L2 19.7778H22L12 2Z" />
                                        </svg>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Vercel {profile?.hasVercelToken ? '연결됨' : '연결 안 됨'}
                                        </div>
                                    </div>

                                    {/* Gemini */}
                                    <div className="relative group">
                                        <Cloud className={`w-4 h-4 ${profile?.hasGeminiKey ? 'text-green-600' : 'text-gray-300'}`} />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Gemini {profile?.hasGeminiKey ? '연결됨' : '연결 안 됨'}
                                        </div>
                                    </div>
                                </div>

                                {/* User Menu */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 text-sm focus:outline-none hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 font-medium">{session.user.name}</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                            </div>
                                            <Link
                                                href="/templates/my"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                나만의 도구함
                                            </Link>
                                            <Link
                                                href="/templates/shared"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                공유한 자료 관리
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                설정
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    signOut();
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
                            >
                                선생님 로그인
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
