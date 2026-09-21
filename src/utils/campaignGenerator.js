// LeadRadar Pro - Campaign & Multi-Query Expansion Utilities

export const INDUSTRY_CATEGORIES = {
    'Dentistry': [
        'Dental Clinic',
        'Cosmetic Dentistry',
        'Orthodontist',
        'Pediatric Dentist',
        'Dental Implants',
        'Emergency Dentist',
        'Teeth Whitening Service',
        'Periodontist',
        'Endodontist',
        'Oral Surgeon'
    ],
    'Plumbing': [
        'Emergency Plumber',
        'Residential Plumbing',
        'Commercial Plumbing',
        'Drain Cleaning Service',
        'Water Heater Repair',
        'Leak Detection Specialist',
        'Pipe Relining Service',
        'Boiler Repair',
        'Gas Line Plumber'
    ],
    'Roofing & Construction': [
        'Roofing Contractor',
        'Commercial Roofing',
        'Roof Repair Service',
        'Metal Roofing Contractor',
        'Siding Contractor',
        'Gutter Installation',
        'General Contractor',
        'Home Remodeling Contractor'
    ],
    'Electricians': [
        'Emergency Electrician',
        'Residential Electrician',
        'Commercial Electrician',
        'Electrical Contractor',
        'EV Charger Installation',
        'Electrical Panel Upgrade',
        'Lighting Contractor'
    ],
    'HVAC & Cooling': [
        'Air Conditioning Repair',
        'Heating Contractor',
        'Furnace Repair Service',
        'Commercial HVAC',
        'Air Duct Cleaning',
        'Heat Pump Installation',
        'AC Installation'
    ],
    'Real Estate': [
        'Real Estate Agency',
        'Commercial Real Estate',
        'Property Management Company',
        'Real Estate Broker',
        'Luxury Real Estate',
        'Apartment Rental Agency',
        'Mortgage Broker'
    ],
    'Legal Services': [
        'Personal Injury Lawyer',
        'Criminal Defense Attorney',
        'Family Law Attorney',
        'Estate Planning Attorney',
        'Corporate Lawyer',
        'Employment Attorney',
        'Immigration Lawyer',
        'Bankruptcy Lawyer'
    ],
    'Fitness & Wellness': [
        'CrossFit Gym',
        'Personal Training Studio',
        'Yoga Studio',
        'Pilates Studio',
        'Boxing Gym',
        'Martial Arts School',
        '24 Hour Fitness Center',
        'Boot Camp Fitness'
    ],
    'Auto Repair': [
        'Auto Repair Shop',
        'Brake Repair Shop',
        'Transmission Specialist',
        'Auto Body and Paint',
        'Tire Shop',
        'Oil Change Service',
        'Auto Detailing Service',
        'Car AC Repair'
    ],
    'Restaurants & Food': [
        'Italian Restaurant',
        'Mexican Restaurant',
        'Chinese Restaurant',
        'Sushi Restaurant',
        'Steakhouse',
        'Indian Restaurant',
        'Pizzeria',
        'Seafood Restaurant',
        'Cafe and Bakery'
    ],
    'Accounting & Finance': [
        'CPA Firm',
        'Tax Preparation Service',
        'Bookkeeping Service',
        'Small Business Accounting',
        'Financial Planner',
        'Payroll Service'
    ],
    'Cleaning Services': [
        'Commercial Cleaning',
        'Residential Cleaning Service',
        'Carpet Cleaning Service',
        'Window Cleaning Service',
        'Post-Construction Cleaning',
        'Pressure Washing Service'
    ],
    'Veterinarians & Pets': [
        'Veterinary Clinic',
        'Animal Hospital',
        'Emergency Vet Hospital',
        'Pet Grooming Service',
        'Dog Daycare'
    ],
    'Salons & Spas': [
        'Hair Salon',
        'Barber Shop',
        'Nail Salon',
        'Day Spa',
        'Massage Therapy',
        'Medical Spa',
        'Skin Care Clinic'
    ]
};

export const METRO_PRESETS = [
    {
        name: 'New York City (NY)',
        zips: ['10001', '10002', '10003', '10010', '10011', '10016', '10019', '10022', '11201', '11211', '11215', '11217']
    },
    {
        name: 'Los Angeles (CA)',
        zips: ['90001', '90012', '90015', '90024', '90025', '90028', '90036', '90045', '90049', '90210', '90401', '91403']
    },
    {
        name: 'Chicago (IL)',
        zips: ['60601', '60602', '60603', '60605', '60611', '60614', '60622', '60647', '60654', '60657']
    },
    {
        name: 'Houston (TX)',
        zips: ['77002', '77004', '77006', '77007', '77008', '77019', '77024', '77056', '77057', '77079']
    },
    {
        name: 'Miami (FL)',
        zips: ['33101', '33125', '33129', '33130', '33131', '33133', '33137', '33139', '33140', '33145']
    },
    {
        name: 'Dallas (TX)',
        zips: ['75201', '75202', '75204', '75206', '75214', '75219', '75225', '75230', '75240', '75248']
    },
    {
        name: 'London (UK Postcodes)',
        zips: ['EC1', 'EC2', 'WC1', 'WC2', 'W1', 'SW1', 'SE1', 'E1', 'N1', 'NW1']
    },
    {
        name: 'Bangalore (Commercial Hubs)',
        zips: ['560001', '560004', '560010', '560025', '560034', '560037', '560038', '560041', '560043', '560066', '560071', '560078', '560100', '560102', '560103']
    },
    {
        name: 'Bangalore (Full 99 Pincodes)',
        zips: ['560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010', '560011', '560012', '560013', '560014', '560015', '560016', '560017', '560018', '560019', '560020', '560021', '560022', '560023', '560024', '560025', '560026', '560027', '560028', '560029', '560030', '560032', '560033', '560034', '560036', '560037', '560038', '560039', '560040', '560041', '560042', '560043', '560045', '560046', '560047', '560048', '560049', '560050', '560051', '560052', '560053', '560054', '560055', '560056', '560058', '560059', '560061', '560062', '560063', '560064', '560065', '560066', '560067', '560068', '560069', '560070', '560071', '560072', '560073', '560074', '560075', '560076', '560077', '560078', '560079', '560080', '560083', '560084', '560085', '560086', '560087', '560091', '560092', '560093', '560094', '560095', '560096', '560097', '560098', '560099', '560100', '560102', '560103', '560104', '562106', '562107', '562125', '562130', '562149', '562157']
    }
];

/**
 * Expand a broad keyword into sub-categories & high-intent synonyms.
 */
export function expandNicheVariations(keyword = '') {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return [];

    // Check if directly matches a key or substring in our presets
    for (const [category, subcategories] of Object.entries(INDUSTRY_CATEGORIES)) {
        if (
            category.toLowerCase().includes(trimmed) || 
            trimmed.includes(category.toLowerCase()) ||
            subcategories.some(s => s.toLowerCase().includes(trimmed) || trimmed.includes(s.toLowerCase()))
        ) {
            return subcategories;
        }
    }

    // Dynamic high-intent expansions for custom niches
    const raw = keyword.trim();
    return [
        raw,
        `Emergency ${raw}`,
        `Commercial ${raw}`,
        `Residential ${raw}`,
        `Best ${raw} Services`,
        `Local ${raw} Contractors`,
        `${raw} Specialist`,
        `${raw} Repair`,
        `Affordable ${raw}`
    ];
}

/**
 * Generate sequential range of postal/zip codes.
 */
export function generateZipRange(startCode, count = 10) {
    const clean = String(startCode || '').trim();
    const num = parseInt(clean, 10);
    if (isNaN(num)) return [];

    const padLen = clean.length;
    const list = [];
    const limit = Math.min(Math.max(1, count), 50);

    for (let i = 0; i < limit; i++) {
        const nextNum = num + i;
        list.push(String(nextNum).padStart(padLen, '0'));
    }
    return list;
}

/**
 * Build campaign queue matrix: (Keywords) x (Locations)
 */
export function buildQueryMatrix(keywords = [], locations = []) {
    const validKeywords = keywords
        .map(k => k.trim())
        .filter(k => k.length > 0);

    const validLocations = locations
        .map(l => l.trim())
        .filter(l => l.length > 0);

    const queue = [];
    let idCounter = 1;

    if (validLocations.length === 0) {
        validKeywords.forEach(kw => {
            queue.push({
                id: `q_${Date.now()}_${idCounter++}`,
                query: kw,
                status: 'pending',
                leadsFound: 0
            });
        });
    } else if (validKeywords.length === 0) {
        validLocations.forEach(loc => {
            queue.push({
                id: `q_${Date.now()}_${idCounter++}`,
                query: loc,
                status: 'pending',
                leadsFound: 0
            });
        });
    } else {
        validKeywords.forEach(kw => {
            validLocations.forEach(loc => {
                const fullQuery = kw.toLowerCase().includes(loc.toLowerCase()) 
                    ? kw 
                    : `${kw} in ${loc}`;

                queue.push({
                    id: `q_${Date.now()}_${idCounter++}`,
                    query: fullQuery,
                    status: 'pending',
                    leadsFound: 0
                });
            });
        });
    }

    return queue;
}
