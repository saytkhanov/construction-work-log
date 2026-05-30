import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Начальный справочник видов работ.
 * Upsert по уникальному имени делает сид идемпотентным —
 * его можно запускать повторно без дублей.
 */
const workTypeNames: string[] = [
  'Кладка перегородок',
  'Монтаж опалубки',
  'Армирование',
  'Бетонирование',
  'Штукатурные работы',
  'Монтаж инженерных сетей',
  'Демонтажные работы',
  'Устройство стяжки',
];

async function main() {
  console.log('Seeding work types...');

  for (const name of workTypeNames) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name },
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
