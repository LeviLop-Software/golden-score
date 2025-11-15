/**
 * Company Type/Model Definition
 * Defines the structure and shape of company objects
 * TODO: Convert to TypeScript interface if needed
 * TODO: Add validation functions
 * TODO: Add default values
 */

/**
 * Company object structure
 * @typedef {Object} Company
 * @property {string} id - Unique company identifier
 * @property {string} name - Company name
 * @property {string} registrationNumber - Official registration/tax number
 * @property {string} industry - Industry/sector
 * @property {string} location - Company location/headquarters
 * @property {number} employees - Number of employees
 * @property {number} foundedYear - Year company was founded
 * @property {string} website - Company website URL
 * @property {string} description - Company description
 * @property {CompanyScore} score - Company scoring data
 * @property {CompanyFinancials} financials - Financial data
 * @property {Array<string>} certifications - List of certifications
 * @property {Object} metadata - Additional metadata
 */

/**
 * Company Score structure
 * @typedef {Object} CompanyScore
 * @property {number} overall - Overall score (0-100)
 * @property {number} financial - Financial health score
 * @property {number} reputation - Reputation score
 * @property {number} compliance - Compliance score
 * @property {number} sustainability - Sustainability score
 * @property {string} category - Score category (Excellent, Good, Fair, Poor)
 * @property {Date} lastUpdated - Last score calculation date
 */

/**
 * Company Financials structure
 * @typedef {Object} CompanyFinancials
 * @property {number} revenue - Annual revenue
 * @property {number} profit - Annual profit
 * @property {number} assets - Total assets
 * @property {number} liabilities - Total liabilities
 * @property {number} debtRatio - Debt to equity ratio
 * @property {string} currency - Currency code (ILS, USD, EUR)
 * @property {number} year - Fiscal year
 */

/**
 * Create a new company object with default values
 * @param {Partial<Company>} data - Partial company data
 * @returns {Company} Complete company object
 */
export function createCompany(data = {}) {
  return {
    id: data.id || '',
    name: data.name || '',
    registrationNumber: data.registrationNumber || '',
    industry: data.industry || '',
    location: data.location || '',
    employees: data.employees || 0,
    foundedYear: data.foundedYear || new Date().getFullYear(),
    website: data.website || '',
    description: data.description || '',
    score: data.score || createDefaultScore(),
    financials: data.financials || createDefaultFinancials(),
    certifications: data.certifications || [],
    metadata: data.metadata || {},
  };
}

/**
 * Create default score object
 * @returns {CompanyScore}
 */
export function createDefaultScore() {
  return {
    overall: 0,
    financial: 0,
    reputation: 0,
    compliance: 0,
    sustainability: 0,
    category: 'לא מדורג',
    lastUpdated: new Date(),
  };
}

/**
 * Create default financials object
 * @returns {CompanyFinancials}
 */
export function createDefaultFinancials() {
  return {
    revenue: 0,
    profit: 0,
    assets: 0,
    liabilities: 0,
    debtRatio: 0,
    currency: 'ILS',
    year: new Date().getFullYear(),
  };
}

/**
 * Validate company object
 * @param {Company} company - Company object to validate
 * @returns {boolean} True if valid
 */
export function validateCompany(company) {
  // TODO: Add comprehensive validation
  if (!company.name || company.name.trim().length === 0) {
    return false;
  }
  return true;
}
