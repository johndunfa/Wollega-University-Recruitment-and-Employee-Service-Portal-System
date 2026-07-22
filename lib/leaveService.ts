export class LeaveService {
  static async fetchMyLeaveRequests() {
    try {
      const res = await fetch('/api/leave/my-requests');

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const text = await res.text();

      if (!text) {
        throw new Error('Empty response body from server');
      }

      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      return [];
    }
  }

  static async submitLeaveRequest({
    employeeId,
    startDate,
    endDate,
    reason,
  }: {
    employeeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    try {
      const response = await fetch('/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, startDate, endDate, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit leave request.');
      }

      return { success: true, message: 'Leave request submitted successfully!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Something went wrong.' };
    }
  }
}
