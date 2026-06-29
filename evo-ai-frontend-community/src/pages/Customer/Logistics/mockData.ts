export const mockShipments = [
  {
    id: 'ENT-2026-001',
    orderId: 'PED-2026-001',
    status: 'Em Trânsito',
    carrier: 'Império Log (Interno)',
    vehiclePlate: 'IMP-1234',
    departure: 'Central Império - São Paulo, SP',
    destination: 'Av. Paulista, 1000 - São Paulo, SP',
    trackingCode: 'IMP987654321BR',
    totalDistance: '3.5 KM',
    estimatedConsumption: '0.3 L',
    dieselCost: 'R$ 1.65',
    freightCost: 'R$ 6.30',
    totalCost: 'R$ 7.95',
    driver: 'Carlos Alberto',
    truckType: 'fiorino',
    transitTime: '0.5h'
  },
  {
    id: 'ENT-2026-002',
    orderId: 'PED-2026-005',
    status: 'Entregue',
    carrier: 'Correios Sedex',
    vehiclePlate: 'N/A',
    departure: 'CD Campinas - Campinas, SP',
    destination: 'Rua das Flores, 123 - Jundiaí, SP',
    trackingCode: 'BR000123456789X',
    totalDistance: '45.0 KM',
    estimatedConsumption: '5.2 L',
    dieselCost: 'R$ 28.60',
    freightCost: 'R$ 80.00',
    totalCost: 'R$ 108.60',
    driver: 'Sedex Motorista',
    truckType: 'van',
    transitTime: '1.2h'
  }
];

export const mockFleet = [
  {
    id: 'VEH-001',
    plate: 'IMP-1234',
    status: 'Em Viagem',
    type: 'fiorino',
    consumption: '12.5',
    capacity: '650',
    driver: 'Carlos Alberto'
  },
  {
    id: 'VEH-002',
    plate: 'ABC-9876',
    status: 'Disponível',
    type: 'truck',
    consumption: '4.5',
    capacity: '12000',
    driver: 'João Marcos'
  },
  {
    id: 'VEH-003',
    plate: 'XYZ-3333',
    status: 'Manutenção',
    type: 'toco',
    consumption: '6.0',
    capacity: '6000',
    driver: 'Não atribuído'
  }
];

export const mockCarriers = [
  {
    id: 'CARR-001',
    name: 'Império Log (Interno)',
    status: 'Ativa',
    valuePerKm: '1.80',
    baseDiesel: '5.90',
    avgSpeed: '60'
  },
  {
    id: 'CARR-002',
    name: 'Correios Sedex',
    status: 'Ativa',
    valuePerKm: '3.50',
    baseDiesel: '0.00',
    avgSpeed: '80'
  },
  {
    id: 'CARR-003',
    name: 'JadLog',
    status: 'Inativa',
    valuePerKm: '2.10',
    baseDiesel: '6.10',
    avgSpeed: '70'
  }
];
