import dns from 'dns';

/**
 * Verifies if an email address is syntactically valid and its domain has mail servers (MX records).
 * This ensures the domain is real and configured to receive email.
 * 
 * @param {string} email - The email address to verify.
 * @returns {Promise<boolean>} - Returns true if the domain exists and can receive email, false otherwise.
 */
export const verifyEmailDomain = (email) => {
    return new Promise((resolve) => {
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return resolve(false);
        }

        const parts = email.split('@');
        if (parts.length !== 2) {
            return resolve(false);
        }

        const domain = parts[1].trim();
        if (!domain) {
            return resolve(false);
        }

        // Basic syntax check for domain
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            return resolve(false);
        }

        // Exclude common local/dev domains that wouldn't resolve in a real environment
        if (domain === 'localhost' || domain.endsWith('.local') || domain.endsWith('.test')) {
            return resolve(false);
        }

        // Query DNS MX records to ensure domain can receive email
        dns.resolveMx(domain, (err, mxRecords) => {
            if (err || !mxRecords || mxRecords.length === 0) {
                // As a fallback, check for A records (some domains direct mail to A record if MX is absent)
                dns.resolve(domain, 'A', (errA, aRecords) => {
                    if (errA || !aRecords || aRecords.length === 0) {
                        console.log(`Email validation failed: Domain ${domain} does not have MX or A records.`);
                        return resolve(false);
                    }
                    console.log(`Email domain ${domain} verified via A records.`);
                    return resolve(true);
                });
            } else {
                console.log(`Email domain ${domain} verified via MX records.`);
                return resolve(true);
            }
        });
    });
};
