import React, { useEffect, useRef, useState } from 'react';  // Added useState hook
import * as d3 from 'd3';
import { useAuth } from '../hooks/useAuth';

interface CalorieData {
  date: string; // Example: "2024-12-08"
  total_cals: number;
}

interface PieData {
  label: string;
  value: number;
}

interface DailyCalorieChartProps {
  data: CalorieData[];
}

const DailyCalorieChart: React.FC<DailyCalorieChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const { user } = useAuth();  

  // Use state to store maintenanceCalories
  const [maintenanceCalories, setMaintenanceCalories] = useState<number>(2000); // Initial value is 2000

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/user?email=${user?.email}`);
      const data = await response.json();

      if (data.success && data.complete) {
        // Update state with fetched maintenance calories
        setMaintenanceCalories(data.profile.MaintenanceCalories || 2000); // Default to 2000 if not available
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.email]);  // Fetch profile when user email changes

  const transformedData: PieData[] = [
    { label: 'Maintenance Calories', value: maintenanceCalories },
    {
      label: 'Calories Consumed',
      value: data.reduce((acc, d) => acc + (d.total_cals || 0), 0), // Handle invalid values
    },
  ];

  useEffect(() => {
    // Clear previous chart content
    d3.select(chartRef.current).selectAll('*').remove();

    // Chart dimensions
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Create SVG container
    const svg = d3
      .select(chartRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Pie generation
    const pie = d3.pie<PieData>().value(d => d.value);

    // Arc generation
    const arc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Draw pie chart
    svg
      .selectAll('path')
      .data(pie(transformedData))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', d => color(d.data.label) as string);

    // Add text labels
    svg
      .selectAll('text')
      .data(pie(transformedData))
      .enter()
      .append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#fff')
      .text(d => `${d.data.label}: ${d.data.value}`);
  }, [data, maintenanceCalories]);  // Re-run when data or maintenanceCalories change

  return <svg ref={chartRef}></svg>;
};

export default DailyCalorieChart;
