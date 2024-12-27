export const useCalendarSync = (token) => {
  const sync = useCallback(async () => {
    const lastSync = localStorage.getItem('lastSync');
    const now = new Date().getTime();

    // 마지막 동기화로부터 5분 이내면 스킵
    if (lastSync && now - parseInt(lastSync) < 5 * 60 * 1000) {
      return;
    }

    // 백그라운드에서 동기화 수행
    try {
      await syncCalendars();
      localStorage.setItem('lastSync', now.toString());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [token]);

  return { sync };
}; 