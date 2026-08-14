import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteAdmin() {
  const email = 'admin@gmail.com';

  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    console.error(`❌ Utilisateur ${email} non trouvé. Inscrivez-vous d'abord sur le site.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ ${email} promu ADMIN avec succès !`);
}

promoteAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
