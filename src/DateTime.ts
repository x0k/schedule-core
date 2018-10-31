export default class DateTime {

  public year: number;
  public month: number; // 1-12
  public date: number; // 1-31
  public hours: number; // 0-23
  public minutes: number; // 0-59

  public day: number; // 1-7 from monday

  constructor (now: Date) {
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1;
    this.date = now.getDate();
    this.hours = now.getHours();
    this.minutes = now.getMinutes() - 1;

    const day = now.getDay();
    this.day = day > 0 ? day : 7;
  }

  public before (date: Date): boolean {
    if (this.year < date.getFullYear() || this.month < date.getMonth() + 1 || this.date < date.getDate()
      || this.hours < date.getHours() || this.minutes < date.getMinutes()) {
      return true;
    }
    return false;
  }

  public next (level): DateTime {
    this.addMinute(level);
    return this;
  }

  private leapYear (year): boolean {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  }

  private getMonthLength (year: number, month: number) {
    // tslint:disable-next-line:no-bitwise
    return month === 2 ? year & 3 || !(year % 25) && year & 15 ? 28 : 29 : 30 + (month + (month >> 3) & 1);
  }

  private addYear (level): void {
    this.year++;
    level('years', this);
  }

  private addMonth (level): void {
    if (this.month < 12) {
      this.month++;
    } else {
      this.month = 1;
      this.addYear(level);
    }
    level('months', this);
  }

  private addDate (level): void {
    // Day
    if (this.day < 7) {
      this.day++;
    } else {
      this.day = 1;
    }
    // Date
    if (this.date < this.getMonthLength(this.year, this.month)) {
      this.date++;
    } else {
      this.date = 1;
      this.addMonth(level);
    }
    level('days', this);
  }

  private addHours (level): void {
    if (this.hours < 23) {
      this.hours++;
    } else {
      this.hours = 0;
      this.addDate(level);
    }
    level('hours', this);
  }

  private addMinute (level): void {
    if (this.minutes < 59) {
      this.minutes++;
    } else {
      this.minutes = 0;
      this.addHours(level);
    }
    level('minutes', this);
  }

}
