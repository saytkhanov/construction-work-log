import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Начальный справочник видов работ.
 * Используется upsert по уникальному имени, поэтому сид идемпотентен —
 * его можно запускать повторно без дублей.
 */
const workTypes: Array<{ name: string; unit: string }> = [
  { name: 'Земляные работы', unit: 'м3' },
  { name: 'Устройство фундамента', unit: 'м3' },
  { name: 'Кирпичная кладка', unit: 'м3' },
  { name: 'Монолитные работы', unit: 'м3' },
  { name: 'Монтаж металлоконструкций', unit: 'т' },
  { name: 'Кровельные работы', unit: 'м2' },
  { name: 'Штукатурные работы', unit: 'м2' },
  { name: 'Малярные работы', unit: 'м2' },
  { name: 'Устройство стяжки пола', unit: 'м2' },
  { name: 'Электромонтажные работы', unit: 'точка' },
  { name: 'Сантехнические работы', unit: 'точка' },
  { name: 'Остекление', unit: 'м2' },
  { name: 'Благоустройство территории', unit: 'м2' },
  { name: 'Демонтажные работы', unit: 'м3' },
];

async function main() {
  console.log('Seeding work types...');

  for (const workType of workTypes) {
    await prisma.workType.upsert({
      where: { name: workType.name },
      update: { unit: workType.unit },
      create: workType,
    });
  }

  const count = await prisma.workType.count();
  console.log(`Seed complete. Work types in DB: ${count}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
