import { HttpClient } from '@angular/common/http';
import {
  Component
} from '@angular/core';

import { CalendarEvent } from 'angular-calendar';
import { addMonths, endOfWeek, isSameDay, isWithinInterval, startOfWeek } from 'date-fns';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-mycalendar',
  templateUrl: './mycalendar.component.html',
  styleUrls: ['./mycalendar.component.css']
})
export class MycalendarComponent {


  calendarView: 'month' | 'quarter' = 'month';
  viewDate: Date = new Date();

  API_KEY = environment.API_TOKEN;

  events: CalendarEvent[] = [];

  quarterMonths: Date[] = [];

  // Countries
  countries: any[] = [];
  selectedCountry: string = 'IN';

  lastLoadedYear: number | null = null;
  lastLoadedCountry: String | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.setQuarterMonths();
    this.getCountries();
    this.fetchHolidays(this.selectedCountry, this.viewDate.getFullYear());
  }

  setQuarterMonths() {
    // const start = startOfQuarter(this.viewDate);
    // this.quarterMonths = [0, 1, 2].map(i => addMonths(start, i));

    const current = this.viewDate;
    this.quarterMonths = [0, 1, 2].map(i => addMonths(current, i));
  }

  getCountries() {
    const url = 'https://raw.githubusercontent.com/stefanbinder/countries-states/master/countries.json';

    this.http.get<any[]>(url).subscribe(data => {
      this.countries = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  setView(view: 'month' | 'quarter') {
    this.calendarView = view;
    if (view === 'quarter') {
      this.setQuarterMonths();
    }
    this.checkYearAndFetch();
  }

  goToPrevious() {
    if (this.calendarView === 'month') {
      this.viewDate = addMonths(this.viewDate, -1);
    } else {
      // this.viewDate = addMonths(this.viewDate, -3);
      this.viewDate = addMonths(this.viewDate, -1);
      this.setQuarterMonths();
    }
    this.checkYearAndFetch();
  }

  goToNext() {
    if (this.calendarView === 'month') {
      this.viewDate = addMonths(this.viewDate, 1);
    } else {
      // this.viewDate = addMonths(this.viewDate, 3);
      this.viewDate = addMonths(this.viewDate, 1);
      this.setQuarterMonths();
    }
    this.checkYearAndFetch();
  }

  goToToday() {
    this.viewDate = new Date();
    if (this.calendarView === 'quarter') {
      this.setQuarterMonths();
    }
    this.checkYearAndFetch();
  }

  onCountryChange() {
    this.checkYearAndFetch();
  }

  checkYearAndFetch() {
    const currentYear = this.viewDate.getFullYear();
    if (
      this.selectedCountry &&
      (this.lastLoadedYear !== currentYear ||
        this.lastLoadedCountry !== this.selectedCountry)
    ) {
      this.lastLoadedYear = currentYear;
      this.lastLoadedCountry = this.selectedCountry;
      this.fetchHolidays(this.selectedCountry, currentYear);
    }
  }

  fetchHolidays(countryCode: string, year: number) {
    const url = `https://calendarific.com/api/v2/holidays?api_key=${this.API_KEY}&country=${countryCode}&year=${year}&type=national`;

    this.http.get<any>(url).subscribe(response => {
      const holidays = response.response.holidays || [];

      this.events = holidays.map((holiday: any) => ({
        title: holiday.name,
        start: new Date(holiday.date.iso)
      }));
    });
  }

  isHolidayWeek(date: Date): boolean {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);

    return this.events.some(event =>
      event.start >= weekStart && event.start <= weekEnd
    );
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event => isSameDay(event.start, date));
  }

  getWeekHolidayClass1(date: Date): string {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    const holidayCount = this.events.filter(event =>
      isWithinInterval(event.start, { start: weekStart, end: weekEnd })
    ).length;

    if (holidayCount > 1) {
      return 'holiday-week-blue';
    } else if (holidayCount === 1) {
      return 'holiday-week-green';
    }
    return '';
  }

  getWeekHolidayClass(date: Date): string {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);

    // Collect unique holiday dates within the week
    const uniqueHolidayDates = new Set(
      this.events
        .filter(event =>
          isWithinInterval(event.start, { start: weekStart, end: weekEnd })
        )
        .map(event => event.start.toDateString())
    );

    const holidayCount = uniqueHolidayDates.size;

    if (holidayCount > 1) {
      return 'holiday-week-blue';
    } else if (holidayCount === 1) {
      return 'holiday-week-green';
    }
    return '';
  }

  getQuarter(month: number): string {
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter}`;
  }

  getRollingMonthRangeLabel(): string {
    if (this.quarterMonths.length === 0) return '';

    const startMonth = this.quarterMonths[0];
    const endMonth = this.quarterMonths[this.quarterMonths.length - 1];

    const sameYear = startMonth.getFullYear() === endMonth.getFullYear();
    const startStr = startMonth.toLocaleString('default', { month: 'long' });
    const endStr = endMonth.toLocaleString('default', { month: 'long' });

    return sameYear
      ? `${startStr} - ${endStr} ${startMonth.getFullYear()}`
      : `${startStr} ${startMonth.getFullYear()} - ${endStr} ${endMonth.getFullYear()}`;
  }

}
