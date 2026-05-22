import { query } from './index';

const seedData = async () => {
  console.log('Starting database seed...');

  try {
    // Check if data already exists
    const existingPlants = await query('SELECT COUNT(*) FROM plants');
    if (parseInt(existingPlants.rows[0].count) > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Seed plants (4 plants)
    const plants = [
      { name: 'Planta Norte', location: 'Av. Industrial 1234, Monterrey, NL', managerName: 'Carlos Rodríguez' },
      { name: 'Planta Centro', location: 'Av. Manufactura 567, Ciudad de México', managerName: 'María Hernández' },
      { name: 'Planta Occidente', location: 'Blvd. Producción 890, Guadalajara, Jal', managerName: 'Jorge López' },
      { name: 'Planta Sur', location: 'Carretera Federal 1500, Puebla, Puebla', managerName: 'Ana Martínez' },
    ];

    for (const plant of plants) {
      await query(
        'INSERT INTO plants (name, location, manager_name) VALUES ($1, $2, $3)',
        [plant.name, plant.location, plant.managerName]
      );
    }
    console.log('Seeded 4 plants');

    // Seed distribution centers (5 distribution centers)
    const distributionCenters = [
      { name: 'Centro Distribución Norte', address: 'Calle Logística 111, Monterrey, NL', region: 'Norte', capacity: 50000 },
      { name: 'Centro Distribución Centro', address: 'Av. Warehouse 222, Toluca, Edo.Mex', region: 'Centro', capacity: 75000 },
      { name: 'Centro Distribución Occidente', address: 'Carretera仓储 333, Guadalajara, Jal', region: 'Occidente', capacity: 60000 },
      { name: 'Centro Distribución Sur', address: 'Boulevard Distribución 444, Puebla, Puebla', region: 'Sur', capacity: 45000 },
      { name: 'Centro Distribución Metropolitano', address: 'Av. Metropolitana 555, Ciudad de México', region: 'Centro', capacity: 100000 },
    ];

    for (const dc of distributionCenters) {
      await query(
        'INSERT INTO distribution_centers (name, address, region, capacity) VALUES ($1, $2, $3, $4)',
        [dc.name, dc.address, dc.region, dc.capacity]
      );
    }
    console.log('Seeded 5 distribution centers');

    // Seed orders (30 orders with varied statuses)
    const statuses = ['pending', 'in_transit', 'delivered', 'cancelled'];
    const orderStatuses: { count: number; status: string }[] = [
      { count: 10, status: 'delivered' },
      { count: 8, status: 'in_transit' },
      { count: 7, status: 'pending' },
      { count: 5, status: 'cancelled' },
    ];

    let orderCount = 0;
    for (const statusGroup of orderStatuses) {
      for (let i = 0; i < statusGroup.count; i++) {
        const plantId = (orderCount % 4) + 1;
        const dcId = (orderCount % 5) + 1;
        const quantity = Math.floor(Math.random() * 500) + 50;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 30) + 1);
        
        await query(
          'INSERT INTO orders (plant_id, distribution_center_id, status, quantity, delivery_date) VALUES ($1, $2, $3, $4, $5)',
          [plantId, dcId, statusGroup.status, quantity, deliveryDate.toISOString().split('T')[0]]
        );
        orderCount++;
      }
    }
    console.log('Seeded 30 orders');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export { seedData };

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}