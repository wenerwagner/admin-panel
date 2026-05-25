import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { Prisma, type PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

const localDatabaseUrl = "postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel";

type DemoStudent = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  subscribedPlan: Prisma.StudentCreateInput["subscribedPlan"];
  status: Prisma.StudentCreateInput["status"];
};

const demoStudents: DemoStudent[] = [
  {
    name: "Ana Souza",
    email: "ana.souza@example.com",
    cpf: "93541134780",
    phone: "+5581999991001",
    subscribedPlan: "BASIC",
    status: "ACTIVE",
  },
  {
    name: "Bruno Lima",
    email: "bruno.lima@example.com",
    cpf: "52998224725",
    phone: "+5581999991002",
    subscribedPlan: "PREMIUM",
    status: "ACTIVE",
  },
  {
    name: "Carla Mendes",
    email: "carla.mendes@example.com",
    cpf: "39053344705",
    phone: "+5581999991003",
    subscribedPlan: "BASIC",
    status: "PAUSED",
  },
  {
    name: "Diego Rocha",
    email: "diego.rocha@example.com",
    cpf: "11144477735",
    phone: "+5581999991004",
    subscribedPlan: "PREMIUM",
    status: "CANCELED",
  },
  {
    name: "Elisa Nunes",
    email: "elisa.nunes@example.com",
    cpf: "12345678909",
    phone: "+5581999991005",
    subscribedPlan: "BASIC",
    status: "ACTIVE",
  },
  {
    name: "Felipe Barros",
    email: "felipe.barros@example.com",
    cpf: "98765432100",
    phone: "+5581999991006",
    subscribedPlan: "PREMIUM",
    status: "PAUSED",
  },
  {
    name: "Gabriela Costa",
    email: "gabriela.costa@example.com",
    cpf: "16899535009",
    phone: "+5581999991007",
    subscribedPlan: "BASIC",
    status: "ACTIVE",
  },
  {
    name: "Henrique Alves",
    email: "henrique.alves@example.com",
    cpf: "85351346893",
    phone: "+5581999991008",
    subscribedPlan: "PREMIUM",
    status: "ACTIVE",
  },
  {
    name: "Isabela Ferreira",
    email: "isabela.ferreira@example.com",
    cpf: "15450946082",
    phone: "+5581999991009",
    subscribedPlan: "BASIC",
    status: "PAUSED",
  },
  {
    name: "Joao Pereira",
    email: "joao.pereira@example.com",
    cpf: "13823596080",
    phone: "+5581999991010",
    subscribedPlan: "PREMIUM",
    status: "ACTIVE",
  },
  {
    name: "Larissa Martins",
    email: "larissa.martins@example.com",
    cpf: "39873428038",
    phone: "+5581999991011",
    subscribedPlan: "BASIC",
    status: "CANCELED",
  },
  {
    name: "Marcos Ribeiro",
    email: "marcos.ribeiro@example.com",
    cpf: "43927439002",
    phone: "+5581999991012",
    subscribedPlan: "PREMIUM",
    status: "PAUSED",
  },
  {
    name: "Natalia Gomes",
    email: "natalia.gomes@example.com",
    cpf: "74865943072",
    phone: "+5581999991013",
    subscribedPlan: "BASIC",
    status: "ACTIVE",
  },
  {
    name: "Otavio Castro",
    email: "otavio.castro@example.com",
    cpf: "01345499027",
    phone: "+5581999991014",
    subscribedPlan: "PREMIUM",
    status: "CANCELED",
  },
  {
    name: "Patricia Moraes",
    email: "patricia.moraes@example.com",
    cpf: "52887154087",
    phone: "+5581999991015",
    subscribedPlan: "BASIC",
    status: "ACTIVE",
  },
];

function configureEnvironment() {
  const rootEnvPath = resolve(import.meta.dirname, "../../../..", ".env");

  if (existsSync(rootEnvPath)) {
    loadEnv({ path: rootEnvPath });
  }

  process.env.DATABASE_URL ??= localDatabaseUrl;
}

export async function seedLocalData(client: PrismaClient): Promise<{
  adminEmail: string;
  createdAdmin: boolean;
  createdStudents: number;
  skippedStudents: number;
}> {
  const { AdminAlreadyExistsError, createAdmin } = await import("../admin/create-admin.js");

  const adminInput = {
    email: process.env.ADMIN_EMAIL ?? "admin@example.com",
    name: process.env.ADMIN_NAME ?? "Local Admin",
    password: process.env.ADMIN_PASSWORD ?? "local-admin-password",
  };

  let createdAdmin = false;

  try {
    await createAdmin(adminInput, client);
    createdAdmin = true;
  } catch (error) {
    if (!(error instanceof AdminAlreadyExistsError)) {
      throw error;
    }
  }

  let createdStudents = 0;
  let skippedStudents = 0;

  for (const student of demoStudents) {
    const existingStudent = await client.student.findFirst({
      where: {
        email: student.email,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (existingStudent) {
      skippedStudents += 1;
      continue;
    }

    await client.student.create({
      data: student,
    });
    createdStudents += 1;
  }

  return {
    adminEmail: adminInput.email,
    createdAdmin,
    createdStudents,
    skippedStudents,
  };
}

async function main() {
  configureEnvironment();

  const { prisma } = await import("../lib/prisma.js");

  try {
    const result = await seedLocalData(prisma);
    console.log(
      [
        result.createdAdmin
          ? `Admin user created: ${result.adminEmail}`
          : `Admin user already exists: ${result.adminEmail}`,
        `Demo students created: ${result.createdStudents}`,
        `Demo students skipped: ${result.skippedStudents}`,
      ].join("\n"),
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
