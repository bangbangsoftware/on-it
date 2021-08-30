<script type="typescript">
	import { getTeam, getTeamsHours } from '$lib/utils';
	import type { Person, WorkingHourDate } from '../../global';
	import { onMount } from 'svelte';

	let rows: Array<WorkingHourDate> = [];
	let team: Person[] = [];
	let totals: number[] = [];

	onMount(() => {
		team = getTeam();
		rows = getTeamsHours(team);
		totals = team.map((m,i)=> total(i));
	});

	const hourChange = (personHour, event) => {
		personHour.hours = parseFloat(event.target.value);
		save();
	};

	const changeHour = (index, adjuster) => {
		const newRows = rows.map((whd, i) => {
			if (index != i) {
				return whd;
			}
			const peoplesWorkingHours = whd.peoplesWorkingHours.map((ph) => {
				ph.hours = adjuster == 0 ? 0 : ph.hours + adjuster;
				return ph;
			});
			whd.peoplesWorkingHours = peoplesWorkingHours;
			return whd;
		});
		rows = newRows;
		save();
	};

	const plusHour = (index) => {
		changeHour(index, 1);
	};

	const takeHour = (index) => {
		changeHour(index, -1);
	};

	const zeroHour = (index) => {
		changeHour(index, 0);
	};

	const save = () => {
		totals = team.map((m,i)=> total(i));
		localStorage.setItem('teamsHours', JSON.stringify(rows));
	};

	const resetDate = () =>{
		localStorage.removeItem("teamsHours");
		localStorage.removeItem("peopleTimes");
		rows = getTeamsHours(team);
		save();
	}

	const total = (index:number) => {
		const total = rows.map(row =>row.peoplesWorkingHours[index].hours)
						  .reduce((a: number,b: number) => (a + b));
		return total;
	}

</script>

<svelte:head>
	<title>Hours</title>
</svelte:head>

<div class="content">
	<h1 on:click={resetDate}>hours kept</h1>
	<table class="main">
		<tr class="block">
			<th class="left">Controls</th>
			<th class="left">Date</th>
			{#each team as person}
				<th class="col">{person.name}</th>
			{/each}
		</tr>
		{#each rows as row, index (index)}
			{#if (row.date + '').startsWith('Mon') || index == 0}
				<tr>
					<td>&nbsp;</td>
				</tr>
			{/if}
			<tr class="block">
				<td>
					<button on:click={($event) => plusHour(index)}>+</button>
					<button on:click={($event) => takeHour(index)}>-</button>
					<button on:click={($event) => zeroHour(index)}>0</button>
				</td>
				<td class="date">{(row.date + '').substring(0, 15)}</td>
				{#each row.peoplesWorkingHours as personHour}
					<td
						><input
							on:change={($event) => hourChange(personHour, $event)}
							type="number"
							size="1"
							value={personHour.hours}
						/></td
					>
				{/each}
			</tr>
		{/each}
			{#each team as person, index (index)}
			<tr>
				<td class="left">{person.name}</td>
				<td>Total</td>
				{#each team as personTotal, ptIndex (ptIndex)}
					{#if ptIndex == index}
						<td>{totals[index]}</td>
					{:else}
						<td></td>
					{/if}
				{/each}
		</tr>
			{/each}
	</table>
</div>

<style>
	.main {
		width:100%;
	}
	button {
		background-color: #ecf0f4;
		border-color: #dfe5ef;
		border-radius: 20px;
		box-shadow: none;
	}
	.content {
		width: 100%;
		margin: var(--column-margin-top) auto 0 auto;
	}
	tr {
		font-size: 28px;
		width: 100%;
		padding: 0.5em 1em 0.3em 1em;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		text-align: center;
	}
	.col {
		min-width: 70px;
		text-align: center;
	}
	.date {
		min-width: 130px;
		text-align: left;
	}
	input {
		background-color: #ecf0f4;
		border: 0;
		width: 60px;
	}
	.left {
		text-align: left;
	}
	.block {
		width: 80%;
		align-items: center;
		margin: 0 0 0.5rem 0;
		padding: 0.5rem;
		background-color: #dfe5ef;
		border-radius: 8px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
		transform: translate(-1px, -1px);
		transition: filter 0.2s, transform 0.2s;
	}
</style>
