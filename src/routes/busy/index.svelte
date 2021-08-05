<script lang="ts">
	import { getTeam, getTeamsHours } from '$lib/utils';
	import type { PeopleTime, Person, PersonHour, Ticket, WorkingHourDate } from 'src/global';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let peopleTimes: Array<PeopleTime> = [];
	let continuity = 0;
	let total = 0;
	let busy = 0;

	const setup = () => {
		const stored = localStorage.getItem('peopleTimes');
		const fromStore = stored ? JSON.parse(stored) : null;
		peopleTimes = fromStore ? fromStore : defaultTimes();
		total = peopleTimes.map((peopleTime) => peopleTime.hours).reduce((a, b) => a + b);
		busy = peopleTimes
			.map((peopleTime) => {
				if (peopleTime.times.length == 0) {
					return 0;
				}

				return peopleTime.times.map((ticket) => ticket.hours).reduce((a, b) => a + b);
			})
			.reduce((a, b) => a + b);

		continuity = total;
	};

	onMount(setup);

	const clear = () =>{
		localStorage.removeItem("peopleTimes");
		setup();
	}

	const defaultTimes = () => {
		const team = getTeam();
		const dates = getTeamsHours(team);
		const peopleTotals: Array<PersonHour> = [];
		dates.forEach((workingHourDate) => {
			const peopleHours = workingHourDate.peoplesWorkingHours;
			peopleHours.forEach((peopleHour, i) => {
				const hasTotal = peopleTotals.length > i + 1;
				const total = hasTotal ? peopleTotals[i].hours + peopleHour.hours : peopleHour.hours;
				peopleTotals[i] = { person: peopleHour.person, hours: total };
			});
		});

		return peopleTotals.map((peopleHours) => ({
			person: peopleHours.person,
			hours: peopleHours.hours,
			times: Array<Ticket>()
		}));
	};

	const save = () => {
		localStorage.setItem('peopleTimes', JSON.stringify(peopleTimes));
	};

	const validateAndSave = (personId: number, desc: string, hours: number) => {
		console.log(personId, desc, hours);
		if (!desc) {
			console.error('No task name');
			(<HTMLInputElement>document.getElementById(personId + '--new-task')).focus();
			return;
		}
		if (!hours) {
			console.error('No hours for new task');
			(<HTMLInputElement>document.getElementById(personId + '--new-task-hours')).focus();
			return;
		}
		const pin = false;
		const newTask: Ticket = { pin, desc, hours };
		peopleTimes = peopleTimes.map((peopleTime) => {
			if (peopleTime.person.id != personId) {
				return peopleTime;
			}
			peopleTime.times.push(newTask);
			return peopleTime;
		});
		(<HTMLInputElement>document.getElementById(personId + '--new-task-hours')).value = '';
		(<HTMLInputElement>document.getElementById(personId + '--new-task')).value = '';
		(<HTMLInputElement>document.getElementById(personId + '--new-task')).focus();
		busy = busy + hours;
		continuity = total - busy;
		save();
	};

	const deleteTask = (personID: number, taskIndex: number) => {
		peopleTimes = peopleTimes.map((personTime: PeopleTime) => {
			if (personTime.person.id == personID) {
				const ticketToGo = personTime.times.find((ticket, i) => i === taskIndex);
				busy = busy - ticketToGo.hours;
				continuity = total - busy;
				personTime.times = personTime.times.filter((ticket, i) => i !== taskIndex);
			}
			return personTime;
		});
		save();
	};

	const addHours = (tickets: Array<Ticket>) =>
		tickets.map((ticket) => ticket.hours).reduce((a, b) => a + b);

	const workContinuity = (personTime: PeopleTime) =>{
		const hours = addHours(personTime.times);
		return personTime.hours - hours;
	}

	const onKeyPress = (e) => {
		if (e.charCode !== 13) {
			// only return
			return;
		}
		const fullID = '' + e.target.id;
		const marker = fullID.indexOf('--');
		const id = parseInt(fullID.substring(0, marker));
		const taskName = (<HTMLInputElement>document.getElementById(id + '--new-task')).value;
		const hours = parseInt(
			(<HTMLInputElement>document.getElementById(id + '--new-task-hours')).value
		);
		validateAndSave(id, taskName, hours);
	};
</script>

<svelte:head>
	<title>On It</title>
</svelte:head>

<section>
	<h1 on:click={clear}>busy</h1>

	{#each peopleTimes as personTime (personTime.person.id)}
		<div class="block" transition:scale|local={{ start: 0.7 }} animate:flip={{ duration: 200 }}>
			<div class="task new">
				<div class="name">{personTime.person.name}</div>
				<div class="hours">{personTime.hours}</div>
			</div>
			<div class="input-grid">
				<input
					on:keypress={onKeyPress}
					name="{personTime.person.id}--new-task"
					id="{personTime.person.id}--new-task"
					aria-label="Task Name"
					placeholder="+ Ticket / Meeting etc"
				/>
				<input
					on:keypress={onKeyPress}
					name="{personTime.person.id}--new-task-hours"
					id="{personTime.person.id}--new-task-hours"
					type="number"
					aria-label="Task Time"
					placeholder="Hours"
				/>
			</div>
			{#each personTime.times as ticket, index}
				<div class="task-grid">
					<div class="task-show">
						<input title="Keep this" type="checkbox" checked={ticket.pin} />
					</div>
					<div class="task-show">{ticket.desc}</div>
					<div class="task-show">{ticket.hours}</div>
					<button
						on:click={() => deleteTask(personTime.person.id, index)}
						class="delete"
						aria-label="Delete member"
					/>
				</div>
			{/each}
			<div class="busy-total">
				<div>Busy</div>
				<div class="total">{addHours(personTime.times)}</div>
			</div>
			<br>
			<div class="task">
				<div>Continuity</div>
				<div class="total">{workContinuity(personTime)}</div>
			</div>
		</div>
	{/each}
	<br />
	<div class="busy-total block">
		<div>Busy</div>
		<div class="total">{busy}</div>
	</div>
	<div class="task block">
		<div>Total</div>
		<div class="total">{total}</div>
	</div>
	<div class="task block">
		<div>Continuity</div>
		<div class="total">{continuity}</div>
	</div>
</section>

<style>
	.block {
		width: 80%;
		align-items: center;
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
		background-color: white;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		transition: filter 0.2s, transform 0.2s;
	}
	.total {
		font-weight: bold;
		text-align: right;
	}
	.name {
		text-align: left;
	}
	.hours {
		text-align: right;
	}
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	input {
		border: 1px solid transparent;
		outline: none;
		font-size: 20px;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	input:focus-visible {
		box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #ff3e00 !important;
	}

	.input-grid {
		display: grid;
		grid-template-columns: 6fr 6fr;
		grid-gap: 0.5rem;
	}

	.task-grid {
		display: grid;
		grid-template-columns: 1fr 9fr 1fr 1fr;
		height: 30px;
	}

	.task-show {
		margin-top: 6px;
	}

	.delete:hover {
		transition: opacity 0.2s;
		opacity: 1;
	}

	.delete {
		background-size: 25px;
		background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
		background-repeat: no-repeat;
		opacity: 0.2;
		float: right;
		width: 24px;
		height: 25px;
		float: right;
		margin-left: 34px;
		border: none;
	}

	.task {
		display: grid;
		grid-template-columns: 6fr 6fr;
		grid-gap: 0.5rem;
	}

	.busy-total {
		display: grid;
		grid-template-columns: 7fr 1fr 1fr;
	}
</style>
