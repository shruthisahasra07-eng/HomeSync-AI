/**
 * HomeSync AI - Notification Dispatcher
 * Dispatches in-app notifications to Resident, Worker, and Admin accounts.
 */
const { runQuery, getAllRows } = require('../database');

async function createNotification(userId, title, message, type = 'INFO', requestId = null) {
  try {
    await runQuery(
      `INSERT INTO notifications (user_id, title, message, type, request_id) VALUES (?, ?, ?, ?, ?)`,
      [userId, title, message, type, requestId]
    );
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

async function notifyAdmins(title, message, type = 'WARNING', requestId = null) {
  try {
    const adminUsers = await getAllRows(`SELECT id FROM users WHERE role = 'ADMIN'`);
    for (const admin of adminUsers) {
      await createNotification(admin.id, title, message, type, requestId);
    }
  } catch (err) {
    console.error('Failed to notify admins:', err);
  }
}

module.exports = {
  createNotification,
  notifyAdmins
};
