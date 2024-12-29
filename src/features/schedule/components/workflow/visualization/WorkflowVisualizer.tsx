import React, { useEffect, useRef } from 'react';
import { Workflow, WorkflowStep } from '../../../services/workflow-service';
import * as d3 from 'd3';

interface WorkflowVisualizerProps {
  workflow: Workflow;
  onStepClick?: (stepId: string) => void;
  highlightedSteps?: string[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  status?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  onStepClick,
  highlightedSteps = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data
    const nodes: Node[] = workflow.steps.map((step) => ({
      id: step.id,
      name: step.name,
      type: step.type,
    }));

    const links: Link[] = workflow.steps.flatMap((step) =>
      step.nextSteps.map((nextStep) => ({
        source: step.id,
        target: nextStep,
      }))
    );

    // Setup SVG
    const width = 800;
    const height = 600;
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Create nodes
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => onStepClick?.(d.id));

    // Add node circles
    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', (d) =>
        highlightedSteps.includes(d.id) ? '#3b82f6' : '#666'
      )
      .attr('stroke-width', (d) =>
        highlightedSteps.includes(d.id) ? 3 : 1
      );

    // Add node labels
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 40)
      .attr('fill', '#666')
      .style('font-size', '12px');

    // Add node icons
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', '#fff')
      .style('font-family', 'FontAwesome')
      .text((d) => getNodeIcon(d.type));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, Node, Node>,
      d: Node
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, Node, Node>,
      d: Node
    ) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [workflow, highlightedSteps, onStepClick]);

  return <svg ref={svgRef} className="w-full h-full" />;
};

function getNodeColor(type: string): string {
  switch (type) {
    case 'APPROVAL':
      return '#3b82f6'; // blue
    case 'NOTIFICATION':
      return '#10b981'; // green
    case 'TASK':
      return '#f59e0b'; // yellow
    case 'QUALITY_CHECK':
      return '#6366f1'; // indigo
    case 'VALIDATION':
      return '#ef4444'; // red
    case 'DATA_TRANSFORM':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
}

function getNodeIcon(type: string): string {
  switch (type) {
    case 'APPROVAL':
      return '\uf00c'; // check
    case 'NOTIFICATION':
      return '\uf0f3'; // bell
    case 'TASK':
      return '\uf013'; // cog
    case 'QUALITY_CHECK':
      return '\uf058'; // check-circle
    case 'VALIDATION':
      return '\uf06a'; // exclamation-circle
    case 'DATA_TRANSFORM':
      return '\uf0ec'; // exchange
    default:
      return '\uf111'; // circle
  }
}
