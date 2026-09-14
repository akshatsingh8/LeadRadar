// Smart Address Decomposition Helper
const parseAddressComponents = (address) => {
    if (!address) return { street: '', city: '', state: '', zip: '', country: '' };
    
    // Clean string
    const clean = String(address).replace(/[\r\n\t]+/g, ' ').trim();

    // Pattern A: US / CA standard (e.g., "450 Lexington Ave, New York, NY 10017" or "... NY 10017, USA")
    const usMatch = clean.match(/^(?:(.*?),\s*)?([^,]+),\s*([A-Za-z]{2})\s*(\d{5}(?:-\d{4})?)(?:,\s*(.*))?$/);
    if (usMatch) {
        return {
            street: usMatch[1] || '',
            city: usMatch[2] || '',
            state: usMatch[3] || '',
            zip: usMatch[4] || '',
            country: usMatch[5] || 'United States'
        };
    }

    // Pattern B: Multi-part comma separated addresses
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        const zipMatch = lastPart.match(/\b(\d{4,7})\b/) || secondLast.match(/\b(\d{4,7})\b/);
        return {
            street: parts.slice(0, parts.length - 2).join(', '),
            city: secondLast.replace(/\b\d{4,7}\b/, '').trim(),
            state: '',
            zip: zipMatch ? zipMatch[1] : '',
            country: lastPart.replace(/\b\d{4,7}\b/, '').trim()
        };
    } else if (parts.length === 2) {
        return {
            street: parts[0],
            city: parts[1],
            state: '',
            zip: '',
            country: ''
        };
    }

    return { street: clean, city: '', state: '', zip: '', country: '' };
};

export const convertToCSV = (leads) => {
    if (!Array.isArray(leads) || leads.length === 0) return '';

    // Extensive 25-column structure aligned with CRM standards
    const columns = [
        { key: 'keyword', label: 'Search Keyword' },
        { key: 'name', label: 'Business Name' },
        { key: 'category', label: 'Main Category' },
        { key: 'sub_categories', label: 'Sub Categories' },
        { key: 'address', label: 'Full Address' },
        { key: 'street', label: 'Street' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State/Province' },
        { key: 'zip', label: 'ZIP/Postal Code' },
        { key: 'country', label: 'Country' },
        { key: 'phone', label: 'Primary Phone' },
        { key: 'mobile', label: 'Mobile/Alt Phone' },
        { key: 'website', label: 'Website' },
        { key: 'websitePhone', label: 'Website Scraped Phone' },
        { key: 'email', label: 'Email' },
        { key: 'email_alt', label: 'Alt Email' },
        { key: 'linkedin', label: 'LinkedIn' },
        { key: 'facebook', label: 'Facebook' },
        { key: 'instagram', label: 'Instagram' },
        { key: 'twitter', label: 'X/Twitter' },
        { key: 'rating', label: 'Rating' },
        { key: 'reviews', label: 'Reviews Count' },
        { key: 'hours', label: 'Business Hours' },
        { key: 'url', label: 'Google Maps Link' },
        { key: 'scrapedAt', label: 'Extraction Date' }
    ];

    const headers = columns.map(c => c.label);

    // Escape function: eliminates newlines/tabs to guarantee 1-row-per-lead and escapes quotes
    const escape = (text) => {
        if (text === null || text === undefined) return '""';
        const sanitized = String(text)
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return `"${sanitized.replace(/"/g, '""')}"`;
    };

    const getFieldValue = (lead, key) => {
        const parsedAddr = parseAddressComponents(lead.address || '');

        switch (key) {
            case 'keyword':
                return lead.keyword || '';
            case 'name':
                return lead.name || '';
            case 'category':
                return (lead.category || '')
                    .replace(/^[1-5][.,]\d\s*(?:★)?/, '')
                    .replace(/^[$€£₹¥+]+$/, '')
                    .replace(/[·•]/g, '')
                    .trim() || 'Business';
            case 'sub_categories':
                return lead.sub_categories || '';
            case 'address':
                return lead.address || '';
            case 'street':
                return lead.street || parsedAddr.street || '';
            case 'city':
                return lead.city || parsedAddr.city || '';
            case 'state':
                return lead.state || parsedAddr.state || '';
            case 'zip':
                return lead.zip || parsedAddr.zip || '';
            case 'country':
                return lead.country || parsedAddr.country || '';
            case 'phone':
                return lead.phone || '';
            case 'mobile':
                return lead.mobile || '';
            case 'website':
                return lead.website || '';
            case 'websitePhone':
                return lead.websitePhone || '';
            case 'email':
                return lead.email || (lead.emails ? lead.emails.split(',')[0].trim() : '');
            case 'email_alt':
                return lead.email_alt || (lead.emails && lead.emails.includes(',') ? lead.emails.split(',')[1].trim() : '');
            case 'linkedin':
                return lead.linkedin || '';
            case 'facebook':
                return lead.facebook || '';
            case 'instagram':
                return lead.instagram || '';
            case 'twitter':
                return lead.twitter || lead.twitter_x || '';
            case 'rating':
                return lead.rating || '';
            case 'reviews':
                return lead.reviews || '';
            case 'hours':
                return lead.hours || '';
            case 'url':
                return lead.url || '';
            case 'scrapedAt':
                return lead.scrapedAt || '';
            default:
                return lead[key] !== undefined ? lead[key] : '';
        }
    };

    const rows = leads.map(l => {
        return columns.map(col => {
            return escape(getFieldValue(l, col.key));
        }).join(',');
    });

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    return BOM + [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `leadradar-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (link.parentNode) {
            document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
    }, 1500);
};
