import Event from './Event';

export default class DateTimeEvent extends Event {

  constructor (data) {
    super(data);
    this.level = data.level;
  }

  get level () {
    return this.level;
  }

}
