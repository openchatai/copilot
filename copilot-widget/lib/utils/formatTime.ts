export default function formatTimeFromTimestamp(timestamp: number | Date): string {
    const date = new Date(timestamp); // Multiply by 1000 to convert seconds to milliseconds
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12) || 12; // Convert hours from 24-hour to 12-hour format

    return `${formattedHours}:${minutes} ${period}`;
}