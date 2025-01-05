interface FetchAssessmentsParams {
  search?: string;
  category?: string;
}

export async function fetchAssessments({ search, category }: FetchAssessmentsParams = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);

  const response = await fetch(`/api/assessments?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assessments');
  }
  return response.json();
}

export async function createAssessment(data: any) {
  const response = await fetch('/api/assessments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create assessment');
  }
  return response.json();
}
