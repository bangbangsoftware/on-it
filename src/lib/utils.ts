import type { DateRange, Person, PersonHour, WorkingHourDate } from "src/global";

export const getTeam = () => {
	let team: Person[] = [];
	const fromStore = typeof localStorage === 'undefined' ? null : localStorage.getItem('team');
	const standard: Person[] = [
		{ id: 1, name: 'Mick', role: 'Developer' },
		{ id: 2, name: 'Ben', role: 'Developer' },
		{ id: 3, name: 'Michelle', role: 'Tester' },
		{ id: 4, name: 'Ethan', role: 'Developer' }
	];
	if (team.length == 0) {
		team = fromStore ? JSON.parse(fromStore) : standard;
	}
	return team;
}

const addDays = (date: Date, days: number) => {
	date.setDate(date.getDate() + days);
	return date;
};

const getDates = (startDate: Date, stopDate: Date): Array<Date> => {
	const dateArray = new Array();
	let currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(new Date(currentDate));
		const adder = currentDate.getDay() == 5 ? 3 : 1; // No weekends
		currentDate = addDays(currentDate, adder);
	}
	return dateArray;
};

const getDateRange = (): DateRange => {
	// get from store or get standard 14 days from now.
	const fromDate = new Date();
	const toDate = addDays(new Date(), 14);
	return { fromDate, toDate };
};

const load = (storedRows: string):Array<WorkingHourDate> => {
	const rows: Array<WorkingHourDate> = JSON.parse(storedRows);
	const rowsFixedDate = rows.map(ehd => {
		ehd.date = new Date(ehd.date);
		return ehd;	
	});
	return rowsFixedDate;
}


export const getTeamsHours = (team: Person[]) => {
	// set default from local storage
	const hours: number = 7.5; // Standard Hours - should let the user set it? In storage, or dynamic based on person and day?
	const defaultPeoplesWorkingHours: Array<PersonHour> = team.map((person: Person) => {
		return { person, hours };
	});
	const dateRange = getDateRange();
	const dates = getDates(dateRange.fromDate, dateRange.toDate);
	const defaultRows: Array<WorkingHourDate> = dates.map((date) => {
		const peoplesWorkingHours = JSON.parse(JSON.stringify(defaultPeoplesWorkingHours));
		const whd: WorkingHourDate = { date, peoplesWorkingHours };
		return whd;
	});
	const storedRows = typeof localStorage === 'undefined' ? null :localStorage.getItem("teamsHours");
	const rows: Array<WorkingHourDate> = storedRows ? load(storedRows) : defaultRows;
	return rows;
}
