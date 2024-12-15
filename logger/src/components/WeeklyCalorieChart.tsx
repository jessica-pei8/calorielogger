import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface CalorieData {
  date: string; // Ensure this is in "YYYY-MM-DD" format
  total_calories: number;
}

interface WeeklyCalorieChartProps {
  data: CalorieData[];
}

const WeeklyCalorieChart: React.FC<WeeklyCalorieChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Clear previous chart content
    d3.select(chartRef.current).selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total_calories) || 0])
      .nice()
      .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
      const date = new Date(d as string); // Cast 'd' to string
      return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD format
    });

    const yAxis = d3.axisLeft(yScale);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').call(yAxis);

    // Bars
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.date)!)
      .attr('y', (d) => yScale(d.total_calories))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d.total_calories))
      .attr('fill', 'steelblue');
  }, [data]);

  return <svg ref={chartRef}></svg>;
};

export default WeeklyCalorieChart;
