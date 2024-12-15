import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import * as d3 from 'd3';
import { LogData } from '../types/LogData';
import React, {useEffect, useRef} from 'react';
import { TextField } from '@mui/material';
import { fetchAllLogs } from '../utils/data';

interface SavedLogsProps {
    email: string
}

interface BarChartProps {
  caloriesConsumed: number;
  caloriesBurnt: number;
}

interface FormProps {
    email: string,
    response: boolean,
    setResponse: React.Dispatch<React.SetStateAction<boolean>>;
}

const BarChart: React.FC<BarChartProps> = ({ caloriesConsumed, caloriesBurnt }) => {
  const barChartRef = useRef<SVGSVGElement | null>(null);
  useEffect (() => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const data = [
        { label: 'Calories Consumed', calories: caloriesConsumed },
        { label: 'Calories Burnt', calories: caloriesBurnt }
    ];

    d3.select(barChartRef.current).selectAll('*').remove();
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.calories)!])
        .nice()
        .range([height, 0]);

    const svg = d3.select(barChartRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.label)!)
        .attr('y', (d) => yScale(d.calories))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - yScale(d.calories))
        .attr('fill', 'steelblue');

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .call(d3.axisLeft(yScale));

  }, [caloriesConsumed, caloriesBurnt])
  return <svg ref={barChartRef}></svg>
};

const AccordionElem: React.FC<LogData> = (data) => {
    return (
        <Accordion>
            <AccordionSummary>
                {data.startDate} - {data.endDate}
            </AccordionSummary>
            <AccordionDetails>
                <h4>Macronutrient Information</h4>
                <h5>Avg Protein Grams</h5>
                <p>{data.avgProteinGrams} g/day</p>
                <h5>Avg Carb Grams: </h5>
                <p>{data.avgCarbGrams} g/day</p>
                <BarChart 
                    caloriesConsumed={data.avgCalConsumed} 
                    caloriesBurnt={data.avgCalBurnt}
                />
            </AccordionDetails>
        </Accordion>
    )
}


const SavedLogsForm: React.FC<FormProps> = (props) => {

    const handleApiRequest = async (startDate: string, endDate: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/saved_logs?email=${props.email}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: startDate, endDate: endDate })
            });
            const data = await response.json();
            console.log(data);
            if (data.success)
                props.setResponse(!props.response)
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const submitLog = () => {
        const startDateElem = document.getElementById('log-start') as HTMLInputElement;
        if (!startDateElem)
            return;
        const startDate = startDateElem.value;

        const endDateElem = document.getElementById('log-end') as HTMLInputElement;
        if (!endDateElem)
            return;
        const endDate = endDateElem.value;

        if (startDate == '' || endDate == '')
            return;
       
        if (new Date(startDate) >= new Date(endDate)) {
            alert("Start date must be before end date")
            return;
        }
        console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
        handleApiRequest(startDate, endDate);
    };

    const style_v = {marginRight: "10px"}
    return (
        <div>
            <h4>Generate New Log: </h4>
            <label>Log Start Date: </label>
            <input 
                id="log-start" 
                type="date"
                style={style_v}
            />
            <label>Log End Date: </label>
            <input 
                id="log-end" 
                type="date"
                style={style_v}
            />
            <button
                style={style_v}
                onClick={submitLog}
            >
                Generate New Log
            </button>
        </div>
    )
}
const SavedLogs: React.FC<SavedLogsProps> = ({ email }) => {
    const [data, setData] = React.useState<LogData[]>([]);
    const [response, setResponse] = React.useState<boolean>(false);

    useEffect(() => {
        const loadAllLogs = async () => {
            const log_data = await fetchAllLogs(email);
            setData(log_data);
        };

        loadAllLogs();
    }, [email, response]);

    return (<div>
        <h2>Saved Logs</h2>
        <SavedLogsForm 
            email={email} 
            response={response} 
            setResponse={setResponse}
        ></SavedLogsForm>
        {data.map((log, index) => (
            <AccordionElem {...log}></AccordionElem>
        ))}
    </div>)
    
}

export default SavedLogs