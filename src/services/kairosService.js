export const createKairosEvent = async (token, kairosId, originalEvent, activeTask, feedback) => {
  const startTime = new Date(activeTask.startTime);
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / (1000 * 60));

  const plannedStart = new Date(originalEvent.start.dateTime);
  const plannedEnd = new Date(originalEvent.end.dateTime);
  const plannedDuration = Math.round((plannedEnd - plannedStart) / (1000 * 60));

  const descriptionText = generateKairosDescription(
    originalEvent,
    startTime,
    endTime,
    duration,
    plannedDuration,
    feedback
  );

  const eventData = {
    summary: `[Kairos] ${originalEvent.summary}`,
    description: descriptionText,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Asia/Seoul'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Asia/Seoul'
    }
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(kairosId)}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    }
  );

  if (!response.ok) throw new Error('Failed to create Kairos event');
  return await response.json();
}; 