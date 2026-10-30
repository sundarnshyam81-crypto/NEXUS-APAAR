'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingState, PageHeader, StatusBadge } from '@/components/ui';
import AicteTable from '@/components/aicte/AicteTable';

interface Course {
  id: number;
  course_code: string;
  institution: string;
  institution_id: string;
  state: string;
  department: string;
  course_name: string;
  programme_level: string;
  approved_intake: number;
  academic_year: string;
  approval_status: string;
}

export default function AicteCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (state) params.state = state;
      if (level) params.programme_level = level;
      const result = await api.aicte.courses(params);
      setCourses(result.courses);
    } catch (loadError) {
      setError((loadError as Error).message || 'Unable to load course records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.aicte.courses()
      .then((result: { courses: Course[] }) => setCourses(result.courses))
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load course records.'))
      .finally(() => setLoading(false));
  }, []);

  const rows = courses.map((course) => ({
    id: course.id,
    code: <span className="font-mono text-primary-container">{course.course_code}</span>,
    institution: <div><p className="font-medium text-heading">{course.institution}</p><p className="text-xs text-muted">{course.institution_id} · {course.state}</p></div>,
    department: course.department,
    course: course.course_name,
    level: course.programme_level,
    intake: course.approved_intake,
    year: course.academic_year,
    status: <StatusBadge status={course.approval_status} />,
  }));

  return (
    <div className="space-y-6">
      <PageHeader kicker="Approved programme monitoring" title="Courses & Intake" description="Inspect institution-wise course approvals, programme levels, academic years, and approved intake." />
      {error && <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>}
      <form onSubmit={(event) => { event.preventDefault(); void loadCourses(); }} className="stitch-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input aria-label="Search courses" placeholder="Search course, institution, or code" value={search} onChange={(event) => setSearch(event.target.value)} className="field-input md:col-span-2" />
        <select aria-label="Filter course state" value={state} onChange={(event) => setState(event.target.value)} className="field-input">
          <option value="">All states</option>
          {['Delhi', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttarakhand', 'West Bengal'].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Filter programme level" value={level} onChange={(event) => setLevel(event.target.value)} className="field-input">
          <option value="">All programme levels</option><option>Undergraduate</option><option>Postgraduate</option><option>Diploma</option>
        </select>
        <button type="submit" className="btn-primary md:col-span-4 justify-self-start">Apply filters</button>
      </form>
      {loading ? <LoadingState label="Loading approved courses and intake..." /> : (
        <AicteTable columns={[
          { key: 'code', label: 'Course code' },
          { key: 'institution', label: 'Institution' },
          { key: 'department', label: 'Department' },
          { key: 'course', label: 'Course name' },
          { key: 'level', label: 'Programme level' },
          { key: 'intake', label: 'Approved intake' },
          { key: 'year', label: 'Academic year' },
          { key: 'status', label: 'Approval status' },
        ]} rows={rows} rowKey="id" emptyMessage="No courses match these filters." />
      )}
    </div>
  );
}
