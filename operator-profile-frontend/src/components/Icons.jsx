const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const DashboardIcon = () => (<svg {...base}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
export const ReportIcon = () => (<svg {...base}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M12 11v6M9 14h6" /></svg>);
export const BuildingIcon = () => (<svg {...base}><rect x="4" y="3" width="12" height="18" rx="1.5" /><path d="M16 9h3a1 1 0 0 1 1 1v11H16M8 7h4M8 11h4M8 15h4" /></svg>);
export const TruckIcon = () => (<svg {...base}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>);
export const VanIcon = () => (<svg {...base}><path d="M3 16V8a2 2 0 0 1 2-2h8l5 5v5H3Z" /><path d="M13 6v5h5" /><circle cx="7.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></svg>);
export const DatabaseIcon = () => (<svg {...base}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>);
export const CheckIcon = () => (<svg {...base} strokeWidth={2.4}><path d="m5 12 5 5 9-10" /></svg>);
export const AlertIcon = () => (<svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>);
export const CloseIcon = () => (<svg {...base} width="18" height="18"><path d="M6 6l12 12M18 6 6 18" /></svg>);
