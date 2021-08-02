/// <reference types="@sveltejs/kit" />
export interface Ticket {
    pin: boolean;
    desc: string;
    hours: number;
  }
  
  export interface PeopleTime {
    person: Person;
    times: Array<Ticket>;
    hours: number;
  }
  
  export interface Person {
    id: number;
    name: string;
    role: string;
  }
  
  export interface DatePeopleTime {
    date: Date;
    people: Array<PeopleTime>;
  }

  export interface PersonHour {
      person: Person;
      hours: mumber;
  }

  export interface WorkingHourDate {
      date: Date;
      peoplesWorkingHours: Array<PersonHour>
  }

  export interface DateRange {
      fromDate: Date;
      toDate: Date;
  }
  