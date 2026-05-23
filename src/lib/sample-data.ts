import type { SecurityTool } from './types'

/**
 * Realistic SME security stack used as demo data.
 * Edit here to change what "Load Sample Data" populates — no component code needs touching.
 */
export const SAMPLE_TOOLS: Omit<SecurityTool, 'id'>[] = [
  {
    name: 'CrowdStrike Falcon',
    vendor: 'CrowdStrike',
    category: 'endpoint',
    monthlyCost: 840,
    seats: 50,
    description: 'EDR/XDR endpoint protection, threat intelligence',
  },
  {
    name: 'Microsoft Defender for Endpoint',
    vendor: 'Microsoft',
    category: 'endpoint',
    monthlyCost: 375,
    seats: 50,
    description: 'Built-in Windows endpoint protection, AV, EDR',
  },
  {
    name: 'Sophos XG Firewall',
    vendor: 'Sophos',
    category: 'network',
    monthlyCost: 220,
    seats: 1,
    description: 'Next-gen firewall, IPS, web filtering',
  },
  {
    name: 'Cisco Umbrella',
    vendor: 'Cisco',
    category: 'network',
    monthlyCost: 480,
    seats: 50,
    description: 'DNS-layer security, web filtering, CASB',
  },
  {
    name: 'Okta Workforce',
    vendor: 'Okta',
    category: 'identity',
    monthlyCost: 600,
    seats: 50,
    description: 'SSO, MFA, lifecycle management',
  },
  {
    name: 'Microsoft Entra ID P2',
    vendor: 'Microsoft',
    category: 'identity',
    monthlyCost: 450,
    seats: 50,
    description: 'Azure AD, conditional access, PIM, MFA',
  },
  {
    name: 'Proofpoint Essentials',
    vendor: 'Proofpoint',
    category: 'email',
    monthlyCost: 300,
    seats: 50,
    description: 'Email security, anti-phishing, spam filtering',
  },
  {
    name: 'Veeam Backup',
    vendor: 'Veeam',
    category: 'backup',
    monthlyCost: 180,
    seats: 1,
    description: 'VM and server backup, ransomware recovery',
  },
  {
    name: 'Qualys VMDR',
    vendor: 'Qualys',
    category: 'vulnerability',
    monthlyCost: 650,
    seats: 1,
    description: 'Vulnerability management, patch management, compliance',
  },
  {
    name: 'Tenable.io',
    vendor: 'Tenable',
    category: 'vulnerability',
    monthlyCost: 580,
    seats: 1,
    description: 'Vulnerability scanning, asset discovery',
  },
]
