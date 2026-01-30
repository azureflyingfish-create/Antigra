<template>
  <div style="height: 400px; position: relative;">
    <Bar v-if="chartData && hasData" :data="chartData" :options="chartOptions" />
    <div v-else style="display: flex; justify-content: center; align-items: center; height: 100%; color: #909399;">
        No assignment data for this period.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import 'chartjs-adapter-date-fns'
import { subMonths, parseISO, format } from 'date-fns'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale, ChartDataLabels)

const props = defineProps({
    projectId: {
        type: Number,
        default: null
    },
    members: {
        type: Array,
        default: () => []
    },
    assignments: {
        type: Array,
        default: () => []
    }
})

const hasData = computed(() => {
    return chartData.value && 
           chartData.value.datasets && 
           chartData.value.datasets.length > 0 && 
           chartData.value.datasets[0].data && 
           chartData.value.datasets[0].data.length > 0
})

const chartData = computed(() => {
    if (!props.projectId) return { datasets: [{ data: [] }] }

    const projectAssignments = props.assignments.filter(a => a.project_id === props.projectId)
    
    const formatData = []
    
    projectAssignments.forEach(a => {
        if (!a.start_date || !a.end_date) return
        
        const member = props.members.find(m => m.id === a.member_id)
        if (!member) return

        formatData.push({
            x: [parseISO(a.start_date).getTime(), parseISO(a.end_date).getTime()],
            y: member.name,
            percentage: a.percentage
        })
    })

    return {
        datasets: [{
            label: 'Assignment Period',
            data: formatData,
            backgroundColor: '#67C23A',
            barPercentage: 0.5
        }]
    }
})

const chartOptions = computed(() => {
    const now = new Date()
    let minDate, unit

    if (hasData.value) {
            const timestamps = chartData.value.datasets[0].data.map(d => d.x[0])
            minDate = new Date(Math.min(...timestamps))
            minDate = subMonths(minDate, 1)
    } else {
            minDate = subMonths(now, 12)
    }
    unit = 'month'


    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: { unit: unit },
                min: minDate.getTime()
                // max: undefined // Auto-scale
            },
             y: {
                ticks: {
                     display: true 
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                     label: (context) => {
                        const raw = context.raw
                        const start = format(new Date(raw.x[0]), 'yyyy-MM-dd')
                        const end = format(new Date(raw.x[1]), 'yyyy-MM-dd')
                        return `${context.dataset.label}: ${start} ~ ${end} (${raw.percentage}%)`
                    }
                }
            },
            datalabels: {
                color: 'white',
                display: true,
                align: 'center',
                anchor: 'center',
                formatter: (value, context) => {
                    return value.y; // The Member Name
                },
                font: {
                    weight: 'bold'
                }
            }
        }
    }
})
</script>
