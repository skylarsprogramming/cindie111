'use client';

import { useState, useEffect } from 'react';
import { UserProfile, LearningProgress, SkillsProgress } from '@/lib/types';

interface LearningDashboardProps {
  profile: UserProfile;
}

export function LearningDashboard({ profile }: LearningDashboardProps) {
  const [progress, setProgress] = useState<LearningProgress>(profile.learningProgress);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [profile.uid]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile/progress');
      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = (skills: SkillsProgress): number => {
    const values = Object.values(skills);
    return Math.round(values.reduce((sum, skill) => sum + skill, 0) / values.length);
  };

  const overallProgress = calculateOverallProgress(progress.skillsProgress);

  const skills = [
    { key: 'reading', label: 'Reading', icon: '📖', color: 'bg-blue-500' },
    { key: 'writing', label: 'Writing', icon: '✍️', color: 'bg-green-500' },
    { key: 'listening', label: 'Listening', icon: '🎧', color: 'bg-purple-500' },
    { key: 'speaking', label: 'Speaking', icon: '🗣️', color: 'bg-orange-500' },
    { key: 'pronunciation', label: 'Pronunciation', icon: '🎤', color: 'bg-pink-500' },
    { key: 'grammar', label: 'Grammar', icon: '📝', color: 'bg-indigo-500' },
    { key: 'vocabulary', label: 'Vocabulary', icon: '📚', color: 'bg-red-500' },
  ] as const;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Learning Dashboard</h2>
        <p className="text-gray-600">Track your progress and achievements in language learning.</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading progress...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overall Progress Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <p className="text-blue-100">Keep up the great work!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <div className="text-sm text-blue-100 capitalize">{progress.currentLevel}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-blue-300 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{progress.totalLessonsCompleted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Study Time</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatTime(progress.totalStudyTime)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-semibold text-gray-900">{progress.streak} days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Level</p>
                  <p className="text-2xl font-semibold text-gray-900 capitalize">{progress.currentLevel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Progress */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill) => {
                const skillValue = progress.skillsProgress[skill.key as keyof SkillsProgress];
                return (
                  <div key={skill.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{skill.icon}</span>
                        <span className="font-medium text-gray-900">{skill.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{skillValue}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${skill.color}`}
                        style={{ width: `${skillValue}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Courses */}
          {progress.completedCourses.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.completedCourses.map((courseId, index) => (
                  <div key={courseId} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-green-600">✅</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-green-900">Course {index + 1}</p>
                      <p className="text-sm text-green-600">{courseId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Course */}
          {progress.currentCourse && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Course</h3>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">📖</span>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium text-blue-900">{progress.currentCourse}</p>
                  <p className="text-sm text-blue-600">Continue your learning journey</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Last Activity */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="flex items-center text-gray-600">
              <span className="text-sm">
                Last activity: {formatDate(progress.lastActivityAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
