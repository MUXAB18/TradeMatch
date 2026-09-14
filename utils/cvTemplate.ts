/**
 * CV/Resume HTML Template Generator
 * Per prd.md Section 5.3: Generate clean, readable PDF from user profile
 *
 * Template requirements:
 * - Readable on both mobile and print
 * - Missing fields degrade gracefully
 * - Professional appearance
 * - Include: name, trade, experience, certifications, skills, contact info
 */

import { User, Certification } from '../types';

interface CVData {
  user: User;
  certifications: Array<Certification & { id: string }>;
}

/**
 * Generate HTML template for CV/Resume
 * Missing fields are handled gracefully (omitted or shown as "Not specified")
 *
 * @param data - User profile and certifications
 * @returns HTML string ready for PDF rendering
 */
export function generateCVHTML(data: CVData): string {
  const { user, certifications } = data;

  // Format certifications list
  const certsHTML = certifications.length > 0
    ? certifications
        .map(
          cert => `
        <div class="cert-item">
          <div class="cert-bullet">✓</div>
          <div>
            <strong>${escapeHtml(cert.name)}</strong>
            ${cert.required ? '<span class="required-badge">Required</span>' : ''}
            <br/>
            <span class="cert-desc">${escapeHtml(cert.description)}</span>
          </div>
        </div>
      `
        )
        .join('')
    : '<p class="empty">No certifications listed</p>';

  // Format skills list
  const skillsHTML = user.skills.length > 0
    ? user.skills
        .map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
        .join('')
    : '<p class="empty">No skills listed</p>';

  // Format phone (remove + if present for cleaner display)
  const phone = user.phone?.replace(/^\+/, '') || 'Not provided';

  // Format years of experience
  const experience =
    user.yearsExperience > 0
      ? `${user.yearsExperience} ${user.yearsExperience === 1 ? 'year' : 'years'}`
      : 'Entry level';

  // Availability label
  const availabilityLabels: Record<string, string> = {
    immediate: 'Immediate',
    '2-weeks': '2 Weeks Notice',
    '1-month': '1 Month Notice',
    flexible: 'Flexible',
  };
  const availability = availabilityLabels[user.availability] || user.availability || 'Flexible';

  // Current date for "Generated on" footer
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(user.name)} - CV</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1A1A1A;
      padding: 30px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 3px solid #1E4D6B;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }

    .name {
      font-size: 28pt;
      font-weight: bold;
      color: #1E4D6B;
      margin-bottom: 8px;
    }

    .trade {
      font-size: 16pt;
      color: #6B6B6B;
      margin-bottom: 15px;
      text-transform: capitalize;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 10pt;
      color: #6B6B6B;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1E4D6B;
      border-bottom: 2px solid #E8A33D;
      padding-bottom: 6px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }

    .info-label {
      font-weight: bold;
      color: #6B6B6B;
    }

    .info-value {
      color: #1A1A1A;
    }

    .cert-item {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      padding: 10px;
      background-color: #F7F5F2;
      border-radius: 4px;
    }

    .cert-bullet {
      color: #2D8A4E;
      font-weight: bold;
      font-size: 14pt;
    }

    .cert-desc {
      color: #6B6B6B;
      font-size: 9pt;
    }

    .required-badge {
      background-color: #E8A33D;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: bold;
      margin-left: 6px;
    }

    .skill-tag {
      display: inline-block;
      background-color: #1E4D6B;
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      margin-right: 8px;
      margin-bottom: 8px;
      font-size: 9pt;
      font-weight: 500;
    }

    .empty {
      color: #6B6B6B;
      font-style: italic;
    }

    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #6B6B6B;
      text-align: center;
      font-size: 8pt;
      color: #6B6B6B;
    }

    /* Print-specific styles */
    @media print {
      body {
        padding: 20px;
      }
      
      .cert-item {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Header with name and trade -->
  <div class="header">
    <div class="name">${escapeHtml(user.name)}</div>
    <div class="trade">${escapeHtml(user.trade)}</div>
    <div class="contact-info">
      <div class="contact-item">
        <span>📱</span>
        <span>${escapeHtml(phone)}</span>
      </div>
      ${user.email ? `
      <div class="contact-item">
        <span>✉️</span>
        <span>${escapeHtml(user.email)}</span>
      </div>
      ` : ''}
      <div class="contact-item">
        <span>🌍</span>
        <span>${escapeHtml(user.country)}</span>
      </div>
      <div class="contact-item">
        <span>⏰</span>
        <span>${escapeHtml(availability)}</span>
      </div>
    </div>
  </div>

  <!-- Experience Summary -->
  <div class="section">
    <div class="section-title">Experience Summary</div>
    <div class="info-grid">
      <div class="info-label">Years of Experience:</div>
      <div class="info-value">${escapeHtml(experience)}</div>
      
      <div class="info-label">Trade:</div>
      <div class="info-value">${escapeHtml(user.trade)}</div>
      
      <div class="info-label">Availability:</div>
      <div class="info-value">${escapeHtml(availability)}</div>
    </div>
  </div>

  <!-- Skills -->
  <div class="section">
    <div class="section-title">Skills & Competencies</div>
    ${skillsHTML}
  </div>

  <!-- Certifications -->
  <div class="section">
    <div class="section-title">Certifications & Licenses</div>
    ${certsHTML}
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Generated on ${generatedDate} via TradeMatch</p>
    <p>This is a professional profile summary. References available upon request.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
