import { DatePart } from './datePart';
import { RuleHandler } from '../rules/rule';

export interface IConstraint {
  step: number;
  handler: RuleHandler;
}

export interface IConstraints {
  [name: string]: IConstraint;
}

type RuleRise = (id: string, ...args: any[]) => void;

export class DateTime {

  public static leapYear (year: number) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  }

  public static getMonthLength (year: number, month: number) {
    // tslint:disable-next-line:no-bitwise
    return month === 2 ? year & 3 || !(year % 25) && year & 15 ? 28 : 29 : 30 + (month + (month >> 3) & 1);
  }

  private parts: { [name: string]: DatePart } = {};

  constructor (from: Date, constraints?: IConstraints) {
    const dateParts = [
      { name: 'year', get: (date: Date) => date.getFullYear() },
      { name: 'month', get: (date: Date) => date.getMonth(), limit: () => 12, limitNames: ['year'] },
      {
        name: 'date',
        get: (date: Date) => date.getDate(),
        limit: () => DateTime.getMonthLength(this.get('year'), this.get('month')), limitNames: ['month'],
      },
      {
        name: 'week',
        get: (date: Date) => {
          const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        },
      },
      { name: 'day', get: (date: Date) => date.getDay(), limit: () => 7, limitNames: ['week'] },
      { name: 'hour', get: (date: Date) => date.getHours(), limit: () => 24, limitNames: ['day', 'date'] },
      { name: 'minute', get: (date: Date) => date.getMinutes(), limit: () => 60, limitNames: ['hour'] },
    ];
    for (const { name, get, limit, limitNames } of dateParts) {
      let step: number = 1;
      let handler: (value: any) => any = (val) => val;
      if (constraints && constraints[name]) {
        const con = constraints[name];
        if (con.step) {
          step = con.step;
        }
        if (con.handler) {
          handler = con.handler;
        }
      }
      this.parts[name] = new DatePart(get(from), limitNames, step, handler, limit);
    }
  }

  public next (level: RuleRise, name: string, value?: number): any {
    const part = this.parts[name];
    const count = part.next(value);
    let flag = true;
    if (count) {
      for (const limit of part.limitNames) {
        const val = this.next(level, limit, count);
        flag = flag && (val || val === 0);
      }
    }
    if (flag) {
      level(name, this);
    }
    return flag && part.done;
  }

  public toDate () {
    return new Date(this.get('year'), this.get('month'), this.get('date'), this.get('hour'), this.get('minute'));
  }

  public toTime () {
    return this.toDate().getTime();
  }

  public toString () {
    return `${this.get('year')} ${this.get('month')} ${this.get('date')} ${this.get('hour')} ${this.get('minute')}`;
  }

  public get (name: string) {
    return this.parts[name].value;
  }

}
