import { Booking } from '@/types';

export function buildGoogleCalendarUrl(booking: Booking): string {
  const [year, month, day] = booking.date.split('-').map((n) => parseInt(n, 10));
  const [startH, startM] = booking.startTime.split(':').map((n) => parseInt(n, 10));
  const [endH, endM] = booking.endTime.split(':').map((n) => parseInt(n, 10));

  const startDate = new Date(year, month - 1, day, startH, startM);
  const endDate = new Date(year, month - 1, day, endH, endM);

  const formatGCalDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d+/g, '');

  const title = encodeURIComponent(`${booking.serviceName} at ${booking.businessName}`);
  const details = encodeURIComponent(
    `Booking Reference: ${booking.bookingReference}\nService: ${booking.serviceName}\nDuration: ${booking.durationMinutes} mins\nBusiness Address: ${booking.businessAddress}\nContact: ${booking.businessPhone}\nBooked via BUKKAPP`
  );
  const location = encodeURIComponent(booking.businessAddress);
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function generateICSContent(booking: Booking): string {
  const [year, month, day] = booking.date.split('-').map((n) => parseInt(n, 10));
  const [startH, startM] = booking.startTime.split(':').map((n) => parseInt(n, 10));
  const [endH, endM] = booking.endTime.split(':').map((n) => parseInt(n, 10));

  const startDate = new Date(year, month - 1, day, startH, startM);
  const endDate = new Date(year, month - 1, day, endH, endM);

  const formatICSDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d+/g, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BUKKAPP//Local Booking Marketplace//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.bookingReference}@bukkapp.in`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${booking.serviceName} at ${booking.businessName}`,
    `DESCRIPTION:Ref: ${booking.bookingReference} | Address: ${booking.businessAddress} | Phone: ${booking.businessPhone}`,
    `LOCATION:${booking.businessAddress}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICSFile(booking: Booking) {
  const ics = generateICSContent(booking);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `BUKKAPP-${booking.bookingReference}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function buildDirectionsUrl(address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
