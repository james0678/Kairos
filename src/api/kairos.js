export const createKairosEvent = async (eventData) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 필요한 경우 인증 헤더 추가
    },
    body: JSON.stringify(eventData)
  });

  if (!response.ok) {
    throw new Error('Failed to create Kairos event');
  }

  return response.json();
}; 