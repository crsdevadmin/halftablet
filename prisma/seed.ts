/**
 * Seeds the database from the existing mock data.
 * Run: npx prisma db seed   (configured in package.json)
 */
import { PrismaClient } from '@prisma/client'
import { MEDICINES } from '../src/lib/mockData'
import { STOCK } from '../src/lib/adminData'

const prisma = new PrismaClient()

async function main() {
  // Admin + pharmacist demo users
  await prisma.user.upsert({
    where: { phone: '9000000001' },
    update: {},
    create: { phone: '9000000001', name: 'Admin', role: 'ADMIN' },
  })
  await prisma.user.upsert({
    where: { phone: '9000000002' },
    update: {},
    create: { phone: '9000000002', name: 'Pharmacist Priya', role: 'PHARMACIST' },
  })

  // Medicines
  for (const m of MEDICINES) {
    const stock = STOCK.find(s => s.medicineId === m.id)
    const data = {
        name: m.name,
        genericName: m.genericName,
        manufacturer: m.manufacturer,
        category: m.category,
        mrp: m.mrp,
        halftabletPrice: m.halftabletPrice,
        discountPercent: m.discountPercent,
        requiresPrescription: m.requiresPrescription,
        coldChain: m.coldChain,
        saltComposition: m.saltComposition,
        description: m.description,
        dosage: m.dosage,
        storage: m.storage,
        imageUrl: m.imageUrl,
        rating: m.rating,
        reviewCount: m.reviewCount,
        reorderLevel: stock?.reorderLevel ?? 30,
        uses: m.uses,
        sideEffects: m.sideEffects,
        tags: m.tags,
    }
    // update as well as create: catalog changes must overwrite old seeded rows
    await prisma.medicine.upsert({
      where: { id: m.id },
      update: data,
      create: { id: m.id, ...data },
    })

    // Batches — from STOCK when defined, otherwise a default starter batch
    const batches = stock?.batches?.length
      ? stock.batches
      : [{ batchNo: `${m.id.toUpperCase()}-SEED1`, expiry: new Date(Date.now() + 540 * 86_400_000).toISOString(), qty: 100 }]
    for (const b of batches) {
      await prisma.batch.upsert({
        where: { batchNo: b.batchNo },
        update: {},
        create: {
          batchNo: b.batchNo,
          medicineId: m.id,
          expiry: new Date(b.expiry),
          qty: b.qty,
        },
      })
    }
  }

  console.log(`Seeded ${MEDICINES.length} medicines with batches, plus admin (9000000001) and pharmacist (9000000002) users.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
