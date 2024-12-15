import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ActivityData {
  activity: string;
  cals_burnt: number;
}

interface WeeklyActivitiesChartProps {
  data: ActivityData[];
}

const WeeklyActivitiesChart: React.FC<WeeklyActivitiesChartProps> = ({ data }) => {
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
      .attr('transform', `translate(${margin.left},${margin.top})`); // Fixed string interpolation

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.activity))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.cals_burnt) || 0])
      .nice()
      .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`) // Fixed string interpolation
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
      .attr('x', (d) => xScale(d.activity)!)
      .attr('y', (d) => yScale(d.cals_burnt))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d.cals_burnt))
      .attr('fill', 'steelblue');
  }, [data]);

  return <svg ref={chartRef}></svg>;
};

export default WeeklyActivitiesChart;
