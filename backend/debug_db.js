const prisma = require('./src/config/prisma');

async function main() {
    const services = await prisma.service.findMany({ select: { title: true, slug: true } });
    console.log(services);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
