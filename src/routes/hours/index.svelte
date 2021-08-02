<script type="typescript" >
	import { getTeam, getTeamsHours } from '$lib/utils';
	import type { Person, WorkingHourDate } from '../../global';
	import { onMount } from 'svelte';

	let rows: Array<WorkingHourDate> = [];
	let team: Person[] = [];

	onMount(() => {
		team = getTeam();
		rows= getTeamsHours(team);
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
		localStorage.setItem('teamsHours', JSON.stringify(rows));
	};
</script>

<svelte:head>
	<title>Hours</title>
</svelte:head>

<div class="content">
	<h1>hours kept</h1>
	<table>
		<tr>
			<th class="left">Controls</th>
			<th class="left">Date</th>
			{#each team as person}
				<th class="col">{person.name}</th>
			{/each}
		</tr>
		{#each rows as row, index}
			{#if (row.date + '').startsWith('Mon') || index == 0}
				<tr>
					<td>&nbsp;</td>
				</tr>
			{/if}
			<tr>
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
	</table>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
	.col {
		min-width: 70px;
		text-align: left;
	}
	.date {
		min-width: 130px;
		text-align: left;
	}
	input {
		background-color: #ecf0f4;
		border: 0;
		width: 40px;
	}
	.left {
		text-align: left;
	}
</style>
