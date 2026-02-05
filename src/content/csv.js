export const convertToCSV = (leads) => {
    // Explicit columns as requested by user
    const columns = [
        { key: 'keyword', label: 'Keyword' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'website', label: 'Website' },
        { key: 'rating', label: 'Rating' },
        { key: 'reviews', label: 'Reviews' },
        { key: 'url', label: 'Google Maps URL' }
    ];

    const headers = columns.map(c => c.label);

    // Helper to escape quotes
    const escape = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;

    const rows = leads.map(l => {
        return columns.map(col => {
            return escape(l[col.key]);
        }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || "google-maps-leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
