import type { Product } from "../types";

export const products: Product[] = [
  { id: 1, name: "Traceboard", category: "Developer Tools", description: "Inspect distributed traces without leaving your workspace.", price: 24, rating: 4.8 },
  { id: 2, name: "TypePilot", category: "Developer Tools", description: "Keep API contracts and generated TypeScript types in sync.", price: 18, rating: 4.6 },
  { id: 3, name: "Branchlight", category: "Developer Tools", description: "Review pull requests with focused dependency context.", price: 29, rating: 4.7 },
  { id: 4, name: "LogHarbor", category: "Developer Tools", description: "Search local and cloud logs through one query surface.", price: 21, rating: 4.5 },
  { id: 5, name: "Mocksmith", category: "Developer Tools", description: "Create deterministic API fixtures for browser tests.", price: 16, rating: 4.4 },
  { id: 6, name: "DeployMap", category: "Developer Tools", description: "Visualize release dependencies across environments.", price: 32, rating: 4.9 },
  { id: 7, name: "Gridline", category: "Design", description: "Audit spacing and alignment against shared design tokens.", price: 14, rating: 4.5 },
  { id: 8, name: "ContrastKit", category: "Design", description: "Test accessible color combinations in real components.", price: 12, rating: 4.8 },
  { id: 9, name: "MotionNotes", category: "Design", description: "Document interface motion with inspectable timing values.", price: 19, rating: 4.3 },
  { id: 10, name: "IconIndex", category: "Design", description: "Manage a searchable icon library for product teams.", price: 10, rating: 4.2 },
  { id: 11, name: "FrameCheck", category: "Design", description: "Compare implemented screens across responsive breakpoints.", price: 26, rating: 4.7 },
  { id: 12, name: "CopyDesk", category: "Design", description: "Review interface copy in its final layout context.", price: 15, rating: 4.4 },
  { id: 13, name: "MetricRoom", category: "Analytics", description: "Build shared product metric definitions with owners.", price: 35, rating: 4.9 },
  { id: 14, name: "FunnelLens", category: "Analytics", description: "Explore conversion paths with privacy-aware segments.", price: 30, rating: 4.6 },
  { id: 15, name: "CohortTable", category: "Analytics", description: "Compare retention cohorts without spreadsheet exports.", price: 28, rating: 4.5 },
  { id: 16, name: "EventGuard", category: "Analytics", description: "Detect malformed analytics events before deployment.", price: 22, rating: 4.8 },
  { id: 17, name: "QueryCanvas", category: "Analytics", description: "Turn saved SQL queries into lightweight dashboards.", price: 27, rating: 4.3 },
  { id: 18, name: "PulseReport", category: "Analytics", description: "Deliver scheduled metric summaries with anomaly notes.", price: 20, rating: 4.4 }
];
