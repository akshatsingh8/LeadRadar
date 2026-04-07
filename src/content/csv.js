export const convertToCSV = (leads) => {
    // Extensive 22-column structure
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

    // Helper to escape quotes and handle commas within data
    const escape = (text) => {
        if (text === null || text === undefined) return '""';
        return `"${text.toString().replace(/"/g, '""')}"`;
    };

    const rows = leads.map(l => {
        return columns.map(col => {
            return escape(l[col.key]);
        }).join(',');
    });

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    return BOM + [headers.join(','), ...rows].join('\n');
}

export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || "leadradar-pro-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
