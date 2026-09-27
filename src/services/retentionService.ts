import { deleteExpiredNotifications, getSetting, setSetting } from '../database/repository';
import { RetentionPeriod } from '../types/notification';

const RETENTION_KEY = 'settings_retention_period';

export async function getRetentionSetting(): Promise<RetentionPeriod> {
  const value = await getSetting(RETENTION_KEY, 'forever');
  if (value === '7_days' || value === '30_days' || value === 'forever') {
    return value;
  }
  return 'forever';
}

export async function saveRetentionSetting(period: RetentionPeriod): Promise<void> {
  await setSetting(RETENTION_KEY, period);
  await deleteExpiredNotifications(period);
}

export async function applyRetentionPolicy(): Promise<number> {
  const period = await getRetentionSetting();
  if (period === 'forever') {
    return 0;
  }
  return await deleteExpiredNotifications(period);
}
