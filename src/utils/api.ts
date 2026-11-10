const API_BASE = '/api';

export async function uploadAndReview(file: File): Promise<{ text: string; report: any; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '上传失败');
  }

  return res.json();
}

export async function reviewText(text: string): Promise<{ text: string; report: any; fileName: string }> {
  const res = await fetch(`${API_BASE}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '评审失败');
  }

  return res.json();
}
