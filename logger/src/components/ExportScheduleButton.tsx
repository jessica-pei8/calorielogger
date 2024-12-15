import React from 'react';

interface ICalEvent {
  activity: string;
  day: string; 
  start_time: number; 
  end_time: number;  
}

interface ScheduleExporterProps {
  events: ICalEvent[];
}


const dayMap: Record<string, number> = {
  U: 0, // Sunday
  M: 1, // Monday
  T: 2, 
  W: 3, 
  R: 4, 
  F: 5,
  S: 6
};


const mapDayToDate = (dayLetter: string, hour: number): Date => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentWeekStart = new Date(
        currentYear,
        currentMonth,
        now.getDate() - now.getDay()
    );

  const dayOffset = dayMap[dayLetter];
  if (dayOffset === undefined) return new Date();

  const eventDate = new Date(currentWeekStart);
  eventDate.setDate(currentWeekStart.getDate() + dayOffset); 
  eventDate.setHours(hour, 0, 0, 0); 
  return eventDate;
};

const ScheduleExporter: React.FC<ScheduleExporterProps> = ({ events }) => {
    const createICalFile = () => {
        const iCalHeader = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN`;
        const iCalFooter = `END:VCALENDAR`;

        const iCalEvents = events.map((event) => {
            const eventStart = mapDayToDate(event.day, event.start_time);
            const eventEnd = mapDayToDate(event.day, event.end_time);

            const formattedStart = eventStart.toISOString().replace(/[-:]|\.\d+/g, '');
            const formattedEnd = eventEnd.toISOString().replace(/[-:]|\.\d+/g, '');

            return `BEGIN:VEVENT\nSUMMARY:${event.activity}\nDTSTART:${formattedStart}\nDTEND:${formattedEnd}\nEND:VEVENT`;
        });

        const icsContent = [iCalHeader, ...iCalEvents, iCalFooter].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'schedule.ics';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div>
            <button className="export-button" onClick={createICalFile}>
                Export Schedule to iCal
            </button>
        </div>
    );
};

export default ScheduleExporter;
