/**
 * Trade-specific skill presets
 * Per design.md Section 5.2: tappable tag selection from preset list + "other"
 */

export const TRADE_SKILLS: Record<string, string[]> = {
  electrician: [
    'Residential Wiring',
    'Commercial Wiring',
    'Industrial Electrical',
    'Solar Panel Installation',
    'Electrical Troubleshooting',
    'Circuit Breakers',
    'Lighting Systems',
    'Power Distribution',
    'Electrical Safety',
    'Blueprint Reading',
    'Cable Installation',
    'Transformer Maintenance',
  ],
  plumber: [
    'Pipe Installation',
    'Drain Cleaning',
    'Leak Repair',
    'Water Heater Installation',
    'Bathroom Plumbing',
    'Kitchen Plumbing',
    'Gas Line Installation',
    'Pipe Welding',
    'Sewer Line Repair',
    'Fixture Installation',
    'Water Treatment Systems',
    'Backflow Prevention',
  ],
  hvac: [
    'AC Installation',
    'AC Repair',
    'Heating Systems',
    'Ventilation Systems',
    'Ductwork Installation',
    'Refrigeration',
    'Thermostat Installation',
    'Air Quality Testing',
    'System Maintenance',
    'Commercial HVAC',
    'Residential HVAC',
    'Energy Efficiency',
  ],
  carpenter: [
    'Framing',
    'Finish Carpentry',
    'Cabinet Making',
    'Door Installation',
    'Window Installation',
    'Deck Building',
    'Flooring Installation',
    'Trim Work',
    'Furniture Making',
    'Blueprint Reading',
    'Power Tools',
    'Hand Tools',
  ],
};

export const AVAILABILITY_OPTIONS = [
  { id: 'immediate', label: 'Immediate', description: 'Available to start now' },
  {
    id: '2-weeks',
    label: '2 Weeks Notice',
    description: 'Need 2 weeks at current job',
  },
  {
    id: '1-month',
    label: '1 Month Notice',
    description: 'Need 1 month at current job',
  },
  {
    id: 'flexible',
    label: 'Flexible',
    description: 'Can discuss timing',
  },
];

export function getSkillsForTrade(trade: string): string[] {
  return TRADE_SKILLS[trade.toLowerCase()] || [];
}
