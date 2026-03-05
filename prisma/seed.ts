import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding initial profiles...");

  const profiles = [
    {
      name: "Gestor",
      description: "Administrador da UAN com acesso total",
      active: true,
    },
    {
      name: "Funcionário",
      description: "Membro da equipe operacional",
      active: true,
    },
    {
      name: "Visualizador",
      description: "Acesso apenas de leitura",
      active: true,
    },
  ];

  for (const p of profiles) {
    const existing = await prisma.profiles.findUnique({
      where: { name: p.name },
    });

    if (!existing) {
      await prisma.profiles.create({
        data: p,
      });
      console.log(`Profile ${p.name} created!`);
    } else {
      console.log(`Profile ${p.name} already exists. Skipping.`);
    }
  }

  console.log("Database seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
