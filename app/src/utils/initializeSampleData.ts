// Initialize sample data for all modules
export const initializeSampleData = () => {
  // Check if data already exists
  const hasData = localStorage.getItem('sampleDataInitialized');
  if (hasData) return;

  // Sample Fixed Assets
  const sampleAssets = [
    {
      code: 'AST-0001',
      name: 'Toyota Hilux Double Cab',
      category: 'Vehicles',
      description: 'Company vehicle for operations',
      serialNumber: 'JTEBH3FJ8D5002345',
      purchaseCost: 85000000,
      purchaseDate: new Date('2024-01-15'),
      salvageValue: 20000000,
      usefulLife: 60, // 5 years
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 22950000,
      bookValue: 62050000,
      department: 'Finance & Accounting',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      warrantyExpiry: new Date('2027-01-15'),
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2026-03-01'),
    },
    {
      code: 'AST-0002',
      name: 'Toyota Land Cruiser Prado',
      category: 'Vehicles',
      description: 'Executive vehicle',
      serialNumber: 'JTEBP5GA8A5046078',
      purchaseCost: 120000000,
      purchaseDate: new Date('2024-02-01'),
      salvageValue: 30000000,
      usefulLife: 60,
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 57600000,
      bookValue: 62400000,
      department: 'Finance & Accounting',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      warrantyExpiry: new Date('2027-02-01'),
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2026-03-01'),
    },
    {
      code: 'AST-0003',
      name: 'Dell Latitude 5540 Laptop',
      category: 'IT Equipment',
      description: 'Employee laptop',
      serialNumber: 'DL554P-12-002',
      purchaseCost: 2800000,
      purchaseDate: new Date('2025-06-01'),
      salvageValue: 500000,
      usefulLife: 36, // 3 years
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 296236,
      bookValue: 2503704,
      department: 'IT Equipment',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      warrantyExpiry: new Date('2028-06-01'),
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2026-03-01'),
    },
    {
      code: 'AST-0004',
      name: 'Dell Latitude 5540 Laptop',
      category: 'IT Equipment',
      description: 'Employee laptop',
      serialNumber: 'DL554P-12-002',
      purchaseCost: 2800000,
      purchaseDate: new Date('2025-06-01'),
      salvageValue: 500000,
      usefulLife: 36,
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 296236,
      bookValue: 2503704,
      department: 'IT Equipment',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      warrantyExpiry: new Date('2028-06-01'),
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2026-03-01'),
    },
    {
      code: 'AST-0005',
      name: 'HP LaserJet Pro M428fdh',
      category: 'IT Equipment',
      description: 'Office printer',
      serialNumber: 'VNBF394432',
      purchaseCost: 1850000,
      purchaseDate: new Date('2024-09-15'),
      salvageValue: 200000,
      usefulLife: 48, // 4 years
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 439444,
      bookValue: 1410156,
      department: 'IT Equipment',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      warrantyExpiry: new Date('2027-09-15'),
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2024-09-15'),
      updatedAt: new Date('2026-03-01'),
    },
    {
      code: 'AST-0006',
      name: 'Executive Office Desk (L-Shape)',
      category: 'Furniture & Fittings',
      description: 'Executive office furniture',
      purchaseCost: 1200000,
      purchaseDate: new Date('2024-03-01'),
      salvageValue: 100000,
      usefulLife: 84, // 7 years
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 453714,
      bookValue: 764286,
      department: 'Furniture & Fittings',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2026-03-01'),
    },
    {
      code: 'AST-0007',
      name: 'Ergonomic Office Chair',
      category: 'Furniture & Fittings',
      description: 'Office chair',
      purchaseCost: 850000,
      purchaseDate: new Date('2024-03-01'),
      salvageValue: 50000,
      usefulLife: 84,
      depreciationMethod: 'STRAIGHT_LINE' as const,
      accumulatedDepreciation: 86607,
      bookValue: 763393,
      department: 'Furniture & Fittings',
      location: 'Dar',
      status: 'ACTIVE' as const,
      condition: 'Good' as const,
      lastDepreciationDate: new Date('2026-03-01'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2026-03-01'),
    },
  ];

  // Sample Inventory Items
  const sampleItems = [
    {
      code: 'OFF-001',
      name: 'A4 Printing Paper (Ream)',
      description: 'SKU SKU-PAPERA4',
      category: 'Office Supplies',
      unit: 'reams',
      reorderLevel: 10,
      reorderQuantity: 50,
      unitCost: 18000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 43, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'OFF-003',
      name: 'Ballpoint Pens (Black) Box/50',
      description: 'SKU SKU-PENBLK',
      category: 'Office Supplies',
      unit: 'boxes',
      reorderLevel: 5,
      reorderQuantity: 20,
      unitCost: 25000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 9, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'OFF-002',
      name: 'Ballpoint Pens (Blue) Box/50',
      description: 'SKU SKU-PENBLU',
      category: 'Office Supplies',
      unit: 'boxes',
      reorderLevel: 5,
      reorderQuantity: 20,
      unitCost: 25000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 12, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'ELC-003',
      name: 'Batteries AA — Pack/4',
      description: 'SKU SKU-BATAA4',
      category: 'Electrical & Maintenance',
      unit: 'packs',
      reorderLevel: 10,
      reorderQuantity: 30,
      unitCost: 5000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 15, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'OFF-006',
      name: 'Box Files (Assorted Colors)',
      description: 'SKU SKU-BOXFILE',
      category: 'Office Supplies',
      unit: 'pcs',
      reorderLevel: 10,
      reorderQuantity: 30,
      unitCost: 8000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 35, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'CLN-006',
      name: 'Broom — Standard',
      description: 'SKU SKU-BROOMSTD',
      category: 'Cleaning Supplies',
      unit: 'pcs',
      reorderLevel: 3,
      reorderQuantity: 10,
      unitCost: 8000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Maintenance Workshop', quantity: 4, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'PRT-001',
      name: 'Company Letterhead — Pack/100',
      description: 'SKU SKU-LTRHEAD',
      category: 'Printed Materials',
      unit: 'packs',
      reorderLevel: 3,
      reorderQuantity: 10,
      unitCost: 45000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 5, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      code: 'FRN-004',
      name: 'Bookshelf — 5 tier',
      description: 'SKU SKU-BKSHELF',
      category: 'Furniture',
      unit: 'pcs',
      reorderLevel: 1,
      reorderQuantity: 3,
      unitCost: 250000,
      status: 'ACTIVE' as const,
      locations: [
        { location: 'Main Store - Morogoro HQ', quantity: 1, lastUpdated: new Date() }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
  ];

  // Sample Claims
  const sampleClaims = [
    {
      claimNumber: 'CLM-2026-0001',
      employeeId: 'emp-001',
      employeeName: 'Robert Msangi',
      employeeNumber: 'EMP-0036',
      department: 'Sales & Marketing',
      position: 'Head of Sales & Marketing',
      claimType: 'Travel',
      title: '',
      totalAmount: 750000,
      approvedAmount: 0,
      status: 'APPROVED' as const,
      items: [],
      approvals: [],
      createdAt: new Date('2025-11-30'),
      submittedAt: new Date('2025-11-30'),
    },
  ];

  // Save to localStorage
  const fixedAssetsData = {
    assets: sampleAssets.map((a, i) => ({ ...a, id: `asset-${i + 1}` })),
    assignments: [],
    maintenances: [],
    disposals: [],
    depreciationRuns: [],
  };

  const inventoryData = {
    items: sampleItems.map((item, i) => ({ ...item, id: `item-${i + 1}` })),
    purchaseOrders: [],
    stockRequests: [],
    suppliers: [],
  };

  const claimsData = {
    claims: sampleClaims.map((c, i) => ({ ...c, id: `claim-${i + 1}` })),
  };

  localStorage.setItem('fixedAssetsStore', JSON.stringify(fixedAssetsData));
  localStorage.setItem('inventoryStore', JSON.stringify(inventoryData));
  localStorage.setItem('claimsStore', JSON.stringify(claimsData));
  localStorage.setItem('sampleDataInitialized', 'true');

  console.log('Sample data initialized successfully!');
};
