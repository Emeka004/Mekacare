'use client';

import { useState, useEffect } from 'react';
import { educationService } from '@/services';
import type { EducationContent } from '@/types';
import { BookOpen, Eye, Heart } from 'lucide-react';

export default function AdminEducationPage() {
  const [content, setContent] = useState<EducationContent[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    educationService.getAll({ limit: 100 })
      .then(r => setContent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Education Content</h1>
          <p className="text-gray-500 text-sm mt-1">Manage articles, videos, and resources</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No education content yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Category', 'Type', 'Trimester', 'Views', 'Likes', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {content.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{c.title}</p>
                    {c.isFeatured && <span className="text-xs text-amber-500 font-medium">Featured</span>}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500 text-xs">{c.category.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 capitalize text-gray-500 text-xs">{c.type}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.trimesterTarget.length ? c.trimesterTarget.map(t => `T${t}`).join(', ') : 'All'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" /> {c.viewCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Heart className="w-3 h-3" /> {c.likeCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
