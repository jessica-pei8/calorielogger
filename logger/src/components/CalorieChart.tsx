import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CalorieData } from '../types/CalorieData';

interface CalorieChartProps {
  data: CalorieData[];
}

const CalorieChart: React.FC<CalorieChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 30, right: 30, bottom: 30, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.calories)!])
      .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg.append('g')
      .call(yAxis);

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.date)!)
      .attr('y', (d) => yScale(d.calories))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d.calories))
      .attr('fill', 'steelblue');
  }, [data]); 

  return <svg ref={chartRef}></svg>;
};

export default CalorieChart;
