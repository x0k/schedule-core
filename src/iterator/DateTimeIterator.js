import DateTime from './DateTime';
import Event from './Event';
import EventProvider from './EventProvider';

export default class DateTimeIterator extends EventProvider {

  constructor () {
    super();
    const events = [
      {
        name: 'dateTime',
        handler: (data, dt) => dt,
        level: 0,
      },
      {
        name: 'minutes',
        handler: (data, dt) => dt.minutes,
        level: 0,
      },
      {
        name: 'hours',
        handler: (data, dt) => dt.hours,
        level: 1,
      },
      {
        name: 'days',
        handler: (data, dt) => dt.date,
        level: 2,
      },
      {
        name: 'day',
        handler: (data, dt) => dt.day,
        level: 2,
      },
      {
        name: 'weeks',
        handler: (data, dt) => dt.week,
        level: 3
      },
      {
        name: 'months',
        handler: (data, dt) => dt.month,
        level: 4
      },
      {
        name: 'years',
        handler: (data, dt) => dt.year,
        level: 5,
      },
    ];
    for (let event of events) {
      this.addEvent(new Event(event));
    }
  }

  start (begin, end) {
    const dateTime = new DateTime(begin),
      onChange = this.emit.bind(this);
    // Init values
    const events = [ 'dateTime', 'minutes', 'hours', 'days', 'day', 'weeks', 'months', 'years' ];
    for (const name of events) {
      this.emit(name, dateTime);
    }
    // Start
    while (dateTime.before(end)) {
      this.clear();
      dateTime.next(onChange);
    }
  }

  addListner (listner) {
    let targets = [];
    // Check required events and define target
    for (let event of listner.require) {
      if (this.hasEvent(event)) {
        targets.push(this.getEvent(event));
      } else {
        throw new Error(`Required event: ${event} - not found.`);
      }
    }
    for (let target of targets) {
      target.addListner(listner.name);
    }
    this.addEvent(new Event(listner));
  }

}