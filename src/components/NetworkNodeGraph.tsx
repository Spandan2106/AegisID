import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function NetworkNodeGraph({ txs }: { txs: any[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  // Clean up simulation when component unmounts
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !txs) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 300;
    
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Ensure groups exist
    if (svg.select('.links').empty()) {
      svg.append('g').attr('class', 'links');
      svg.append('g').attr('class', 'nodes');
    }

    // Pre-process nodes and links based on txs
    const nodes: any[] = [{ id: 'Root', group: 'root', label: 'Aegis Engine' }];
    const links: any[] = [];
    const identityNodes = new Set();
    const assetNodes = new Set();
    const credentialNodes = new Set();
    const deletedEntities = new Set();

    // First pass: identify deleted entities
    txs.forEach((tx) => {
      if (tx.blockchainOperation === 'DELETE_ASSET') {
        deletedEntities.add(`AST-${tx.entityId}`);
      } else if (tx.blockchainOperation === 'DELETE_IDENTITY') {
        deletedEntities.add(`ID-${tx.entityId}`);
      }
    });

    txs.forEach((tx) => {
      const group = tx.entityType?.toLowerCase() || 'unknown';
      let nodeId = '';
      if (group === 'identity') {
        nodeId = `ID-${tx.entityId}`;
        if (!deletedEntities.has(nodeId) && !identityNodes.has(nodeId)) {
          identityNodes.add(nodeId);
          nodes.push({ id: nodeId, group, label: `Identity #${tx.entityId}` });
          links.push({ source: 'Root', target: nodeId });
        }
      } else if (group === 'asset' || group === 'digitalasset') {
        nodeId = `AST-${tx.entityId}`;
        if (!deletedEntities.has(nodeId) && !assetNodes.has(nodeId)) {
          assetNodes.add(nodeId);
          nodes.push({ id: nodeId, group: 'asset', label: `Asset #${tx.entityId}` });
          links.push({ source: 'Root', target: nodeId });
        }
      } else if (group === 'credential') {
        nodeId = `CRD-${tx.entityId}`;
        if (!deletedEntities.has(nodeId) && !credentialNodes.has(nodeId)) {
          credentialNodes.add(nodeId);
          nodes.push({ id: nodeId, group, label: `Cred #${tx.entityId}` });
          // Link credential to its owner identity if possible
          const ownerId = `ID-${tx.userId || tx.ownerId}`;
          if (identityNodes.has(ownerId)) {
            links.push({ source: ownerId, target: nodeId });
          } else {
            links.push({ source: 'Root', target: nodeId });
          }
        }
      }
    });

    // If no txs, add some mock nodes to show something
    if (txs.length === 0) {
      ['ID-1', 'ID-2', 'AST-1', 'CRD-1'].forEach((id, i) => {
        nodes.push({ id, group: i < 2 ? 'identity' : (i === 2 ? 'asset' : 'credential'), label: id });
        links.push({ source: 'Root', target: id });
      });
    }

    if (!simulationRef.current) {
      simulationRef.current = d3.forceSimulation()
        .force('link', d3.forceLink().id((d: any) => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide().radius(40));
    }
    const simulation = simulationRef.current;

    // Persist coordinates of existing nodes to avoid jumping
    const oldNodes = new Map(simulation.nodes().map((d: any) => [d.id, d]));
    nodes.forEach((d: any) => {
      const old = oldNodes.get(d.id);
      if (old) {
        d.x = old.x;
        d.y = old.y;
        d.vx = old.vx;
        d.vy = old.vy;
      } else {
        d.x = width / 2;
        d.y = height / 2;
      }
    });

    // Update Links
    const linkGroup = svg.select('.links');
    const linkSelection = linkGroup.selectAll('line').data(links, (d: any) => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      return `${sourceId}-${targetId}`;
    });

    linkSelection.exit()
      .transition()
      .duration(300)
      .attr('stroke-opacity', 0)
      .remove();

    const linkEnter = linkSelection.enter().append('line')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 1.5);
      
    linkEnter.transition().duration(300).attr('stroke-opacity', 0.6);

    const link = linkSelection.merge(linkEnter as any);

    // Update Nodes
    const nodeGroup = svg.select('.nodes');
    const nodeSelection = nodeGroup.selectAll('g.node').data(nodes, (d: any) => d.id);

    nodeSelection.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    const nodeEnter = nodeSelection.enter().append('g')
      .attr('class', 'node')
      .attr('opacity', 0)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    const colors: any = {
      root: '#3b82f6', // blue
      identity: '#10b981', // emerald
      asset: '#8b5cf6', // purple
      credential: '#f59e0b', // amber
      unknown: '#64748b' // slate
    };

    nodeEnter.append('circle')
      .attr('r', (d: any) => d.id === 'Root' ? 16 : 10)
      .attr('fill', (d: any) => colors[d.group] || colors.unknown)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2);

    nodeEnter.append('text')
      .attr('dx', 15)
      .attr('dy', 4)
      .attr('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-family', 'sans-serif')
      .text((d: any) => d.label);

    nodeEnter.transition().duration(300).attr('opacity', 1);

    const node = nodeSelection.merge(nodeEnter as any);

    // Update simulation
    simulation.nodes(nodes);
    
    const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
    if (linkForce) {
      linkForce.links(links);
    }
    
    simulation.alpha(0.3).restart();

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [txs]);

  return (
    <div className="w-full bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden relative group">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live Node Topology</span>
      </div>
      <svg ref={svgRef} className="w-full min-h-[300px] cursor-grab active:cursor-grabbing"></svg>
    </div>
  );
}
